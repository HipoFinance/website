// The Club flag (specs/club-website.md §1, §12). One constant decides whether the new Club exists on
// the site: the /club/ pages in every locale, the Club item in every nav (in place of Rewards), the
// /rewards/ → /club/ redirect pages, the `club` sitemap group and the /app/ mapping of page=reward.
//
// CLUB_LIVE stays false until the launch commit at L (Sat 2026-10-31 09:00 UTC); before that the live
// site shows today's Rewards page. PUBLIC_CLUB=1 builds the Club for a local preview without changing
// the constant (`PUBLIC_CLUB=1 npm run dev`). The mock server is a second, separate switch
// (PUBLIC_CLUB_MOCK=1, see src/components/app/club/mock.ts); a build without it contains no mock code.
//
// Plain ESM so astro.config.mjs (Node), the Astro pages and the island (Vite) can all import it. Vite
// replaces import.meta.env.PUBLIC_CLUB at build time; Node has process.env instead.

export const CLUB_LIVE = false

/** @returns {boolean} true when this build contains the Club */
export function clubBuilt() {
  if (CLUB_LIVE) {
    return true
  }
  // `import.meta.env` exists under Vite only; astro.config.mjs runs in plain Node, where it is undefined.
  const env = /** @type {Record<string, string | undefined> | undefined} */ (import.meta.env)
  if (env?.PUBLIC_CLUB === '1') {
    return true
  }
  return typeof process !== 'undefined' && process.env?.PUBLIC_CLUB === '1'
}

// ------------------------------------------------------------------------------ the build guards

// The numeric id of @HipoFinanceBot (the part of its bot token before the colon; it is public, and
// Telegram shows it in the login popup's URL). PUBLIC_CLUB_TG_BOT_ID overrides it, e.g. for a dev bot
// (spec Open question 3). A build that contains the Club fails when the id in use is empty or not all
// digits (clubBuildProblems, run by astro.config.mjs).
export const CLUB_TG_BOT_ID = '6362986884'

// The Club's switches, read through Vite (import.meta.env) by the pages and the island and through
// process.env by astro.config.mjs: the two must agree.
const CLUB_SWITCHES = ['PUBLIC_CLUB', 'PUBLIC_CLUB_MOCK', 'PUBLIC_CLUB_TG_BOT_ID']

/**
 * Why this build must stop, or [] when it may go on. `processEnv` is what astro.config.mjs sees;
 * `viteEnv` what import.meta.env will hold (Vite's loadEnv: the .env files, with process.env on top).
 *
 * - A switch set only in an .env file: the config would build one site and the pages another.
 * - The mock in CI: the deploy builds in CI, and a mock build must never be deployed.
 * - A build with the Club and no real bot id (`build` only, and not for the local mock preview, which
 *   never opens Telegram's popup): the login button would fail on the live site.
 *
 * @param {{ processEnv: Record<string, string | undefined>, viteEnv: Record<string, string | undefined>, command: string, botId?: string }} input
 *   `botId` stands in for CLUB_TG_BOT_ID in scripts/club-site-selftest.mjs.
 * @returns {string[]}
 */
export function clubBuildProblems({ processEnv, viteEnv, command, botId: defaultBotId = CLUB_TG_BOT_ID }) {
  const problems = []
  for (const key of CLUB_SWITCHES) {
    if ((viteEnv[key] ?? '') !== (processEnv[key] ?? '')) {
      problems.push(`${key} differs between process.env and the .env files; set it in the environment`)
    }
  }
  const mock = viteEnv.PUBLIC_CLUB_MOCK === '1' || processEnv.PUBLIC_CLUB_MOCK === '1'
  if (mock && processEnv.CI) {
    problems.push('PUBLIC_CLUB_MOCK=1 in CI: a mock build is never deployed')
  }
  const club = CLUB_LIVE || viteEnv.PUBLIC_CLUB === '1' || processEnv.PUBLIC_CLUB === '1'
  const botId = viteEnv.PUBLIC_CLUB_TG_BOT_ID || processEnv.PUBLIC_CLUB_TG_BOT_ID || defaultBotId
  if (command === 'build' && club && !mock && !/^[0-9]+$/.test(botId)) {
    problems.push(
      'the Club is built without the Telegram bot id: set CLUB_TG_BOT_ID in src/data/club-flag.mjs (or PUBLIC_CLUB_TG_BOT_ID)',
    )
  }
  return problems
}
