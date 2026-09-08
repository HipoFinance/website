#!/usr/bin/env node
// Loads deployed pages in a real browser and fails if they do not actually render.
//
// WHY THIS EXISTS. On 2026-09-08 a one-line import change moved @ton/core into the eagerly loaded
// island chunk, ahead of the Buffer polyfill that lives behind a dynamic import. Every app page
// then served HTTP 200 with a complete HTML shell, threw during hydration, and displayed nothing.
// No status-code check, link check or build step caught it -- the build passed, the deploy passed,
// and the site was broken until a person opened it. This is the check that closes that gap: a page
// is "up" when it has rendered, not when it has responded.
//
// No dependencies, deliberately. It drives whatever Chrome the runner already has over the
// DevTools Protocol using Node's built-in WebSocket (Node >= 22), so there is no Playwright
// install, no browser download, and nothing to keep in step with a lockfile.
//
//   node scripts/render-check.mjs [options] <url>...
//
//     --min-text=N     fail if document.body.innerText is shorter (default 300)
//     --expect=REGEX   fail unless the rendered text matches (repeatable)
//     --build=SHA      wait until <meta name="build"> starts with SHA, then check
//     --timeout=MS     how long to wait for the above (default 90000)

const args = process.argv.slice(2)
const opt = (name, fallback) => {
    const hit = args.find((a) => a.startsWith(`--${name}=`))
    return hit === undefined ? fallback : hit.slice(name.length + 3)
}
const all = (name) => args.filter((a) => a.startsWith(`--${name}=`)).map((a) => a.slice(name.length + 3))

const urls = args.filter((a) => !a.startsWith('--'))
const minText = Number(opt('min-text', '300'))
const expects = all('expect').map((r) => new RegExp(r))
const wantBuild = opt('build', '')
const timeoutMs = Number(opt('timeout', '90000'))

if (urls.length === 0) {
    console.error('usage: render-check.mjs [options] <url>...')
    process.exit(2)
}

// Errors that are expected on these sites and say nothing about whether the page rendered. Keep
// this list short and specific: a broad pattern here would hide the very failure this script is for.
const benign = [
    // Both sites are Telegram Mini Apps. Opened in an ordinary browser, the bridge cannot find its
    // launch parameters and rejects. That happens on a fully working page.
    /LaunchParamsRetrieveError/,
    /tgWebAppPlatform/,
]

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

function findChrome() {
    const candidates = [
        process.env.CHROME_PATH,
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        // Playwright's download, if someone has run `npx playwright install chromium` locally. The
        // headless shell is used rather than the full binary on purpose: it needs no libcups,
        // libcairo or libpango, so it runs on machines where the headed build will not start.
        ...['chromium_headless_shell-1234', 'chromium-1234'].flatMap((d) => [
            join(homedir(), '.cache/ms-playwright', d, 'chrome-headless-shell-linux64/chrome-headless-shell'),
            join(homedir(), '.cache/ms-playwright', d, 'chrome-linux64/chrome'),
        ]),
    ].filter(Boolean)
    const found = candidates.find((p) => existsSync(p))
    if (found === undefined) {
        console.error('No Chrome found. Set CHROME_PATH, or install chromium.')
        process.exit(2)
    }
    return found
}

const port = 9500 + Math.floor(Math.random() * 400)
const chrome = spawn(
    findChrome(),
    [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--disable-dev-shm-usage',
        `--remote-debugging-port=${String(port)}`,
        `--user-data-dir=/tmp/render-check-${String(port)}`,
        'about:blank',
    ],
    { stdio: 'ignore' },
)
process.on('exit', () => chrome.kill('SIGKILL'))

async function waitForBrowser() {
    for (let i = 0; i < 60; i++) {
        try {
            const r = await fetch(`http://127.0.0.1:${String(port)}/json/version`)
            if (r.ok) return
        } catch {
            /* not up yet */
        }
        await new Promise((r) => setTimeout(r, 500))
    }
    throw new Error('Chrome did not open its debugging port')
}

// One fresh tab per URL, so state and errors never leak between pages.
async function render(url) {
    const target = await (
        await fetch(`http://127.0.0.1:${String(port)}/json/new?about:blank`, { method: 'PUT' })
    ).json()
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
        ws.onopen = resolve
        ws.onerror = reject
    })

    let id = 0
    const pending = new Map()
    const errors = []
    ws.onmessage = (e) => {
        const m = JSON.parse(e.data)
        if (m.id !== undefined && pending.has(m.id)) {
            pending.get(m.id)(m.result)
            pending.delete(m.id)
        }
        if (m.method === 'Runtime.exceptionThrown') {
            const d = m.params.exceptionDetails
            errors.push(String(d.exception?.description ?? d.text))
        }
        if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
            errors.push(m.params.args.map((a) => String(a.description ?? a.value)).join(' '))
        }
    }
    const send = (method, params = {}) =>
        new Promise((resolve) => {
            const i = ++id
            pending.set(i, resolve)
            ws.send(JSON.stringify({ id: i, method, params }))
        })
    const evaluate = async (expression) =>
        (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value

    await send('Runtime.enable')
    await send('Page.enable')
    await send('Page.navigate', { url })

    // Poll rather than sleep a fixed time: hydration and, for a just-published site, Pages
    // propagation both finish when they finish. Reloads pick up a newly deployed build.
    const deadline = Date.now() + timeoutMs
    let text = ''
    let build = ''
    let reloads = 0
    for (;;) {
        await new Promise((r) => setTimeout(r, 2000))
        text = String((await evaluate('document.body ? document.body.innerText : ""')) ?? '')
        build = String(
            (await evaluate(`document.querySelector('meta[name="build"]')?.content ?? ''`)) ?? '',
        )
        const buildOk = wantBuild === '' || wantBuild.startsWith(build) || build.startsWith(wantBuild)
        const ok = text.length >= minText && expects.every((re) => re.test(text)) && buildOk
        if (ok || Date.now() > deadline) break
        // A stale build means the deploy has not propagated; a short page may just still be
        // hydrating, so only reload for the former.
        if (!buildOk && reloads < 20) {
            reloads++
            await send('Page.reload', { ignoreCache: true })
        }
    }

    ws.close()
    return { url, text, build, errors }
}

await waitForBrowser()

let failed = false
for (const url of urls) {
    const r = await render(url)
    const real = r.errors.filter((e) => !benign.some((b) => b.test(e)))
    const missing = expects.filter((re) => !re.test(r.text))
    const buildOk = wantBuild === '' || wantBuild.startsWith(r.build) || r.build.startsWith(wantBuild)

    const problems = []
    if (r.text.length < minText) problems.push(`rendered only ${String(r.text.length)} chars (need ${String(minText)})`)
    if (missing.length > 0) problems.push(`missing from the page: ${missing.map(String).join(', ')}`)
    if (!buildOk) problems.push(`build stamp is "${r.build}", expected "${wantBuild}"`)
    if (real.length > 0) problems.push(`uncaught errors:\n    ${real.slice(0, 5).join('\n    ')}`)

    if (problems.length === 0) {
        console.info(`PASS  ${url}  (${String(r.text.length)} chars${r.build ? `, build ${r.build}` : ''})`)
    } else {
        failed = true
        console.error(`FAIL  ${url}`)
        for (const p of problems) console.error(`  - ${p}`)
        console.error(`  first 200 chars: ${r.text.replace(/\s+/g, ' ').slice(0, 200)}`)
    }
}

chrome.kill('SIGKILL')
process.exit(failed ? 1 : 0)
