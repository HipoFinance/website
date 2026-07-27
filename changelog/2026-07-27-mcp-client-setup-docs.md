# 2026-07-27 — MCP client setup instructions

Detailed report for the [CHANGELOG](../CHANGELOG.md) entry of this date. The
second session on 2026-07-27; the first is
[the MCP server documentation page](2026-07-27-mcp-server-docs.md), which this
one corrects. The connection instructions written there offered a `claude mcp
add` command and a raw `mcpServers` JSON block as equal alternatives. The
maintainer followed the JSON route, it silently did nothing, and this session
rewrote that part of the page so the next reader does not repeat it.

| Commit    | Summary                                              |
| --------- | ---------------------------------------------------- |
| `3d04a0a` | Point the MCP setup instructions at `claude mcp add` |

This report and the `CHANGELOG.md` entry land in a follow-up commit. The work
is on the `mcp-client-setup-docs` branch, not `main`.

---

### What prompted it

The session opened with a protocol question — the current hGRAM/GRAM exchange
rate and its implied APY — answered by reading `get_treasury_state` and
`get_times` from the mainnet treasury
(`EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ`) through toncenter, and
cross-checking against `gauge.hipo.finance/data`. Both agreed exactly: rate
1.143623 GRAM per hGRAM, APY 15.5918%, TVL 2,501,952.20 GRAM.

The maintainer then asked why the Hipo MCP server had not been used instead,
since it was configured. It had not been used because it was not available:
no `mcp__hipo__*` tools were exposed to the session at all. The cause was that
the server had been declared as an `mcpServers` block in
`~/.claude/settings.json`, which Claude Code does not read for MCP
configuration — `claude mcp list` reported "No MCP servers configured" while
that block was present. Running the documented `claude mcp add` command
registered it correctly and it reported connected immediately.

That is a documentation bug, not a user error. The page presented the JSON
block right after the command with no indication that it was for other clients
only, and a reader configuring Claude Code had no reason to prefer one over the
other. Worse, the failure is silent: nothing warns that the block was ignored.

### What changed

All in `src/content/docs/hipo-mcp-server.md`, in the two "Connecting"
subsections:

- **Hosted server.** The `claude mcp add --transport http` command keeps its
  place, now followed by an explanation that it registers the server for the
  current project only, a second copy-pasteable block showing the `-s user`
  variant for every-project availability, and a paragraph stating plainly that
  the command should be used rather than hand-editing a file, because an
  `mcpServers` block in `settings.json` is ignored. It also tells the reader to
  confirm with `claude mcp list` and to restart Claude Code, since servers are
  connected at startup and a newly added one is invisible to a running session.
- **Running it locally.** The same one-sentence pointer before the JSON entry.
- **Both JSON blocks** are now introduced as being for other clients — "Claude
  Desktop, Cursor, and most others" — rather than as a second way to do the
  same thing.

The `-s user` line was revised once more after the maintainer ran
`claude mcp add -s alireza …` and hit `Invalid scope: alireza`. The original
phrasing, "add it at user scope", reads as though `user` were a slot to fill
in with a username. It now says `-s user` is a literal scope keyword, not a
placeholder for your own username. Two readers misread the same sentence, which
was enough evidence to change it.

### Considered and not done

- **Deleting the JSON blocks.** They are correct and necessary for Claude
  Desktop, Cursor, and anything else configured by file. The defect was the
  framing, not their presence.
- **Adding a `-s user` example to the local/stdio section too.** The
  `claude mcp add hipo -- npx …` command takes the flag identically, but
  repeating the block a second time on one page is noise; the prose pointer
  covers it.
- **Documenting the other scopes.** `claude mcp add -s` also accepts `project`,
  `dynamic`, `enterprise`, and others. Only `local` and `user` matter to
  someone connecting to a public HTTP endpoint, and enumerating the rest would
  turn a Hipo page into Claude Code documentation.
- **Updating `public/llms.txt`.** Checked; it describes the MCP server and its
  endpoint but carries no client setup instructions, so nothing there went
  stale. No protocol-level fact changed this session.

### Machine-level changes, outside the repo

Recorded because they explain the session and are not visible in `git log`.
`hipo` was registered with `claude mcp add`, first at local (project) scope and
then at user scope, leaving a shadowing duplicate; the local entry was then
removed, leaving one user-scope entry in `/Users/alireza/.claude.json` that
`claude mcp list` reports as connected. The superseded `mcpServers` block in
`~/.claude/settings.json` was deliberately left in place during the session as
evidence for the diagnosis above; it is inert and can be deleted.

---

### Verification performed

- Reproduced the reported problem before changing anything: confirmed via
  `ToolSearch` that no `mcp__hipo__*` tool was exposed to the session, and via
  `claude mcp list` that the CLI saw no servers at all while
  `~/.claude/settings.json` contained an `mcpServers.hipo` block. That command
  runs as a fresh process, so this is not a stale-session artifact.
- Confirmed the documented command works, rather than only that it parses:
  `claude mcp add --transport http hipo https://mcp.hipo.finance/mcp` reported
  the file it modified (`/Users/alireza/.claude.json`), and a subsequent
  `claude mcp list` reported `hipo … ✔ Connected`.
- Confirmed `-s user` behaves as the page now describes. The accepted scope
  list quoted above came from the CLI itself, via an invalid one:

  ```
  Invalid scope: alireza. Must be one of: local, user, project, dynamic,
  enterprise, claudeai, managed, agent
  ```

- Confirmed the duplicate-name behaviour behind the page's advice: re-running
  the same `add` returns `MCP server hipo already exists in user config`
  rather than overwriting.
- `npx prettier --check src/content/docs/hipo-mcp-server.md` — clean.
- `npm run build` — 44 pages, Pagefind index rebuilt, no errors. Page count is
  unchanged, as expected for an edit to an existing page.

### Follow-ups

- **The claim that `settings.json` is ignored is version-specific.** It is what
  this Claude Code build does, established by direct observation, not something
  checked against upstream documentation. If that changes, the sentence at
  `hipo-mcp-server.md:44` needs revisiting.
- **The MCP server has still not been exercised from inside a session.** The
  tools load only at startup, so the exchange rate reported in this session came
  from toncenter, not from `get_exchange_rate`. After a restart it is worth
  calling the tool and confirming it matches — that would also validate the
  example response block on the docs page.
- Carried over and still open: **the `docs.hipo.finance` Cloudflare cutover**
  has not been executed; the runbook is in `specs/gitbook-docs-migration.md`.
- Carried over: the `engines` field for the `HipoFinance/mcp` repo, the
  `abs-0.twimg.com` emoji hotlink in `tokenomics.md`, the five pre-rule verbose
  `CHANGELOG.md` entries, and the stale
  `origin/alirezaravanbakhsh-patch-1` branch.
