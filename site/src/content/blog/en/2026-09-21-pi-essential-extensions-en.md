---
title: "12 Pi extensions worth installing"
description: "Twelve extensions and skill packs that actually improve day-to-day work in Pi: pi-web-access, pi-codegraph, ponytail, context-mode, pi-custom-system-prompt, pi-notify, pi-interactive-shell, pi-custom-provider-fix, pi-subagent, addyosmani/agent-skills, @juicesharp/rpiv-ask-user-question, and pi-cc-extensions — with install commands and caveats"
pubDatetime: 2026-09-21T00:00:00Z
modDatetime: 2026-10-07T00:00:00Z
draft: false
tags:
  - AI
  - Pi
  - Tooling
  - Productivity
lang: en
---

Pi ships with MCP, Codemode, and subagent scheduling built in, but what decides whether it feels good in daily use is usually a handful of extensions and skill packs. Here are twelve I actually run, each with its install command, what it does, when it helps, and the caveats.

The short version:

| Package | One line | Type |
| --- | --- | --- |
| `pi-web-access` | Search + web/video extraction, zero config | extension |
| `@vndv/pi-codegraph` | tree-sitter graph index instead of grep/read loops | extension |
| `ponytail` | Makes the agent write less code (measured −54% LOC) | extension + skill |
| `context-mode` | Sandboxed execution + knowledge base to save context | extension + skill |
| `pi-custom-system-prompt` | Inject your own system prompt from Markdown | extension |
| `@pi-unipi/notify` | Push completion notifications to your phone | extension + skill |
| `pi-interactive-shell` | Run interactive CLIs and subagents in a TUI overlay | extension + skill |
| `pi-custom-provider-fix` | Wizard-driven custom LLM endpoint setup | extension |
| `@mjakl/pi-subagent` | Delegate to specialist subagents | extension |
| `addyosmani/agent-skills` | 25 engineering skills + 9 lifecycle commands | skills |
| `@juicesharp/rpiv-ask-user-question` | Make the model ask instead of guess | extension |
| `pi-cc-extensions` | Claude Code-style TUI + CC Dark/Light themes | extension + theme |

## 1. pi-web-access: getting online<span id="pi-web-access"></span>

[pi-web-access](https://pi.dev/packages/pi-web-access) provides five tools:

```text
web_search
fetch_content
get_search_content
source_check
web_fetch
```

The highlight is **zero config**: it works immediately after install, with search going through Exa MCP and no API key at all. If you've signed in to a ChatGPT subscription via `/login`, OpenAI search can reuse those credentials.

Content extraction covers web pages, GitHub repos, PDFs, and YouTube video (including frame extraction at exact timestamps). GitHub URLs are **cloned locally** so the agent gets real file contents, not scraped rendered HTML.

API keys go in `~/.pi/agent/web-search.json`:

```json
{
  "openaiApiKey": "sk-...",
  "braveApiKey": "BSA_...",
  "exaApiKey": "exa-..."
}
```

Many providers are supported — OpenAI, Brave, Parallel, Tavily, Firecrawl, Jina, Perplexity, Gemini, Kimi, Exa, self-hosted SearXNG — and every capability has a fallback chain.

```bash
pi install npm:pi-web-access
```

## 2. pi-codegraph: stop the grep loops<span id="pi-codegraph"></span>

[@vndv/pi-codegraph](https://pi.dev/packages/@vndv/pi-codegraph) adds eight structural code tools to Pi:

```text
codegraph_search    codegraph_node       codegraph_files
codegraph_callers   codegraph_callees    codegraph_impact
codegraph_explore   codegraph_status
```

It indexes your project with tree-sitter and answers "how does X reach Y" instead of making the agent grep and read over and over.

Note that it **depends on an external CLI** — installing the extension alone does nothing:

```bash
npm install -g @colbymchenry/codegraph   # must be on PATH
cd /path/to/project && codegraph init -i # every project needs indexing
pi install npm:@vndv/pi-codegraph
```

Requires Node.js ≥ 22.19.0. It's a pure extension — no MCP server to configure.

## 3. ponytail: make it write less code<span id="ponytail"></span>

[@dietrichgebert/ponytail](https://pi.dev/packages/@dietrichgebert/ponytail) puts it plainly: the best code is the code you never wrote.

It installs a "laziness ladder" the agent climbs from the bottom rung before writing anything:

```text
Does this need to exist?      → skip it (YAGNI)
Already in this codebase?     → reuse, don't rewrite
Does the stdlib do it?        → use the stdlib
Does the platform do it?      → use the native feature
Does an installed dep do it?  → use it
Is one line enough?           → one line
Otherwise                     → the minimum that actually works
```

The maintainers publish a measurement: a headless Claude Code session editing tiangolo's full-stack-fastapi-template, twelve feature tickets, same agent with and without the skill, n=4, Haiku 4.5.

| Metric | vs no-skill baseline |
| --- | --- |
| LOC | **−54%** |
| tokens | −22% |
| cost | −20% |
| time | −27% |
| safety checks kept | 100% |

In the control arms, a plain "YAGNI + one-liners" prompt also cut LOC but *increased* tokens, cost and time. ponytail is the only arm that cuts every metric while staying fully safe — validation, error handling, security and accessibility are explicitly off the chopping block.

Commands: `/ponytail`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, and more.

```bash
pi install npm:@dietrichgebert/ponytail
```

## 4. context-mode: save your context window<span id="context-mode"></span>

[context-mode](https://pi.dev/packages/context-mode) targets a different problem: every MCP tool call dumps raw data into context. A single Playwright snapshot costs 56 KB, twenty GitHub issues 59 KB.

The core idea is **Think in Code**: rather than reading fifty files into context so the model can count functions, have it write a script that counts and only `console.log`s the result.

```text
// Before: 47 × Read() = 700 KB
// After: 1 × ctx_execute() = 3.6 KB
```

You get six sandbox tools (`ctx_execute`, `ctx_execute_file`, `ctx_batch_execute`, `ctx_index`, `ctx_search`, `ctx_fetch_and_index`) plus five meta-tools, and slash commands like `/context-mode:ctx-stats` and `/context-mode:ctx-doctor`. After a compaction it recovers context through a SQLite + FTS5 index instead of making the agent re-read files.

⚠️ **The license is Elastic-2.0, not MIT.** Check it before commercial use.

```bash
pi install npm:context-mode
```

## 5. pi-custom-system-prompt: your own system prompt<span id="pi-custom-system-prompt"></span>

[pi-custom-system-prompt](https://pi.dev/packages/pi-custom-system-prompt) reads a prompt from `~/.pi/agent/system-prompts/*.md` and injects it on every turn, with nothing hardcoded to a model or provider.

You can keep several `.md` files in that directory, and switching takes effect on **your very next message** — no `/new`, no restart:

```text
/system-prompt-info     show path, size, mode, enabled state, files
/system-prompt-toggle   enable or disable
/system-prompt-reload   re-read from disk
/system-prompt-mode     replace | append
/system-prompt-show     print the first ~800 chars
/system-prompt-select   pick a different file
```

Two modes: `append` (default — keeps Pi's prompt as the base and adds yours as an extra section, safest) and `replace` (your prompt becomes the base, but Pi still appends the tool listing, project context, the skills block, the date and the working directory, so nothing Pi would normally load is lost).

```bash
pi install npm:pi-custom-system-prompt
mkdir -p ~/.pi/agent/system-prompts
```

## 6. @pi-unipi/notify: ping your phone when it's done<span id="pi-notify"></span>

Long jobs finishing while you're away from the keyboard are the normal case. [@pi-unipi/notify](https://pi.dev/packages/@pi-unipi/notify) pushes agent lifecycle events to your phone.

Supported platforms:

- **Native desktop**: Windows via SnoreToast (no admin needed), macOS via terminal-notifier, Linux via notify-send / libnotify — zero config
- **Gotify**
- **Telegram**
- **ntfy**

It also supports "silence after input" — if you just pressed a key, you're clearly watching, so it stays quiet. Configure via `/unipi:notify-settings`, or use `/unipi:notify-set-gotify`, `notify-set-tg`, `notify-set-ntfy` and `notify-test`.

```bash
pi install npm:@pi-unipi/notify
```

## 7. pi-interactive-shell: interactive CLIs and subagents<span id="pi-interactive-shell"></span>

Some work is inherently interactive: `vim`, `psql`, `ssh`, `git rebase -i`, `docker logs -f`. [pi-interactive-shell](https://pi.dev/packages/pi-interactive-shell) runs them in an observable TUI overlay — you watch the whole thing and can take over at any point.

Four modes:

| Mode | Behaviour | Good for |
| --- | --- | --- |
| `interactive` | overlay, you take over freely | editors, REPLs, SSH |
| `hands-free` | polled status, quiet updates | dev servers, builds |
| `dispatch` | notified on completion, no polling | delegating to subagents |
| `monitor` | wakes only when a trigger fires | watchers, logs, tests |

The user-facing commands are `/spawn`, `/attach` and `/dismiss` — you never hand-write a tool call.

```bash
pi install npm:pi-interactive-shell
```

## 8. pi-custom-provider-fix: custom LLM endpoints<span id="pi-custom-provider-fix"></span>

Hand-editing `models.json` to wire up a third-party OpenAI-compatible endpoint is painful. [youugiuhiuh/pi-custom-provider-fix](https://github.com/youugiuhiuh/pi-custom-provider-fix) gives you a `/provider-setup` wizard covering API type selection, model discovery, model metadata, compatibility overrides, API keys, and OAuth flows.

It's a fork of [`d4rw1nz/pi-custom-provider`](https://github.com/d4rw1nz/pi-custom-provider), and the thing it fixes is the **empty model preset list**. The preset picker is synchronous while the models.dev catalog is fetched asynchronously, so newer models never appeared. The fork adds caching plus a `prefetchModelCatalog` warm-up, and relaxes the `catalogApi` filter — models.dev doesn't declare a wire API, so the old filter dropped every remote model. With that in place, newer models such as `deepseek-v4.1-flash` (and region-suffixed variants) actually show up.

```bash
pi install git:github.com/youugiuhiuh/pi-custom-provider-fix
```

Restart Pi, then run `/provider-setup`.

## 9. @mjakl/pi-subagent: delegate to specialists<span id="pi-subagent"></span>

[@mjakl/pi-subagent](https://pi.dev/packages/@mjakl/pi-subagent) lets you talk to the main agent the way you'd talk to anyone: "review this diff", "find where authentication is implemented". The main agent decides when to delegate, runs the subagent, and folds the result back into your conversation.

You never call the `subagent` tool or write JSON. Each subagent runs in its own isolated Pi process, with streaming progress in the TUI. On first run it creates a read-only starter `explore` agent automatically.

Agent definitions are just Markdown with YAML frontmatter:

```text
User-level:  ~/.pi/agent/agents/*.md
Project:     .pi/agents/*.md  (requires explicit project trust)
```

Project agents win on name conflicts. The description decides when the main agent picks it; the body is the subagent's extra system prompt.

⚠️ Before upgrading to 3.1.0, let in-flight delegations finish and restart every parent Pi process — old and new extension versions must not touch the same persistent child session concurrently. Existing session files need no migration.

```bash
pi install npm:@mjakl/pi-subagent
```

## 10. addyosmani/agent-skills: 25 engineering skills<span id="agent-skills"></span>

The one entry that isn't a Pi package: [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) encodes senior-engineer workflows as skills covering the whole development lifecycle.

```text
  DEFINE          PLAN           BUILD          VERIFY         REVIEW          SHIP
 ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐
 │ Idea │ ───▶ │ Spec │ ───▶ │ Code │ ───▶ │ Test │ ───▶ │  QA  │ ───▶ │  Go  │
 │Refine│      │ PRD  │      │ Impl │      │Debug │      │ Gate │      │ Live │
 └──────┘      └──────┘      └──────┘      └──────┘      └──────┘      └──────┘
  /spec          /plan          /build        /test         /review       /ship
```

Nine commands each activate the right skills: `/spec`, `/plan`, `/build`, `/test`, `/constraints`, `/review`, `/webperf`, `/code-simplify`, `/ship`. `/build auto` runs every task autonomously after you approve the plan once — but each task is still test-driven and committed separately, and it pauses on failures or risky steps.

There are 25 skills in total, including `code-review-and-quality`, `test-driven-development`, `frontend-ui-engineering`, `security-and-hardening`, `debugging-and-error-recovery`, `constraint-driven-development` and `doubt-driven-development`. They also activate by context: designing an API pulls in `api-and-interface-design`, building UI pulls in `frontend-ui-engineering`.

This repo requires Bun, so install via `bunx`:

```bash
bunx skills add addyosmani/agent-skills            # all 25
bunx skills add addyosmani/agent-skills --list     # browse first
bunx skills add addyosmani/agent-skills --skill code-review-and-quality
```

⚠️ **A single-skill install copies only `skills/<name>/`, not the repo-level `references/`**, so paths to shared checklists break. Install the whole repo, clone it, or copy the needed checklist into a `references/` directory inside the installed skill.

## 11. @juicesharp/rpiv-ask-user-question: make it ask first<span id="ask-user-question"></span>

[@juicesharp/rpiv-ask-user-question](https://pi.dev/packages/@juicesharp/rpiv-ask-user-question) adds exactly one tool to Pi — `ask_user_question` — and blocks the most expensive kind of loss there is: the model guessing at your requirements, and you spending an hour undoing a wrong assumption.

Give it an instruction with a real decision buried in it (say, “add caching to the API client”) and instead of picking for you, a questionnaire takes over the bottom of the terminal:

```text
 Feature Type │ Design Tab │ Testing │ Release │ Submit
───────────────────────────────────────────────────────
 Which real development task are we planning right now?

  1. Bug fix (Recommended)   a defect to reproduce and fix
  2. New feature             net-new behaviour or surface
  3. Refactor                same behaviour, better shape
  4. Perf tuning             make an existing path faster

 Type something.
 ↑↓ move · Enter choose · n note · Tab switch · Esc abandon
```

- Up to **four questions** arrive in one tabbed dialog, not four interruptions; the Submit tab lists your answers and names anything still blank before you commit
- Each question carries **2–4 authored options**, every one with a description of what it means or what it costs
- You can always answer in your own words: a `Type something.` row is appended to every question. While typing, `Shift+Enter` adds a line, `Ctrl+G` opens Pi's configured external editor, `Ctrl+U` clears the draft — and browsing another option and coming back keeps what you wrote
- An option can carry a markdown `preview` (ASCII mockup, code, diagram, config) rendered in a bordered box beside the option list; wide terminals go side by side, anything under 100 columns stacks it underneath
- `n` attaches a note: per-question on a question tab, one global note for the whole questionnaire on the Submit tab. They reach the model as `user notes:` / `global note:`, and neither marks a question answered
- `Ctrl+]` collapses the dialog so you can scroll the transcript behind it, then brings it back with your answers intact

```bash
pi install npm:@juicesharp/rpiv-ask-user-question
```

Restart your Pi session and it works with zero configuration. Optional settings live in `~/.config/rpiv-ask-user-question/config.json` (read, never written): `collapseKey` changes the collapse key (default `ctrl+]`, and `"off"` disables it), `guidance.promptSnippet` tunes how eagerly the model asks, and `guidance.description` replaces the tool description outright. Malformed JSON falls back to the defaults with a warning rather than erroring out.

Requires Node.js 22+ and Pi with an interactive terminal (or an RPC/ACP host). **In non-interactive runs the tool is removed from the model's tool list** instead of failing on every call. No native dependencies, no compiler, no API keys — it makes no model calls of its own.

⚠️ Two gotchas: `Ctrl+]` is unreachable on keyboard layouts where `]` sits on the shifted layer (Latin American among them) — set `collapseKey` to something like `"alt+o"`. And if a package manager replaces the dialog's modules on disk while Pi is running, the dialog fails to load and the model falls back to asking in chat text; repair the install and restart, because it isn't recoverable inside the running process.

## 12. pi-cc-extensions: Claude Code styling and themes<span id="pi-cc-extensions"></span>

[minuque/pi-cc-extensions](https://pi.dev/packages/pi-cc-extensions) is the only entry here that declares both **extension and theme**: it re-skins Pi's TUI output in a Claude Code-like style and ships two bundled themes, `cc-dark` and `cc-light`, switchable with `/theme`.

| Feature | What it does | Entry point |
| --- | --- | --- |
| Claude Code UI | Tool summaries, collapse/expand, rich edit/write diffs, `on` / `compact` / `off` modes | `/ccstyle` |
| Themes | CC Dark, CC Light | `/theme` |
| Context inspection | Context usage plus previews of system prompt, memory, skills and tool definitions | `/context` |
| Session / subagent reference | Search and inject context from a past session or an existing subagent | `@` |
| Markdown extras | Mermaid diagrams, callouts, URL linking | automatic |
| Fullscreen mode | Click a tool card to expand, hover highlighting, jump-to-bottom button | `TUIMODE=fullscreen` |
| Status bar | Model, context, cache, cost, git; adapts to `@narumitw/pi-usage` for live quota | `/ccstyle` |

`/ccstyle` is a six-tab settings panel (Style / Features / UI / Diff / Thinking / Footer); config lives in `~/.pi/agent/pi-cc-extensions.json`.

```bash
pi install npm:pi-cc-extensions
```

Requires Node.js ≥ 22.19.0 and Pi `^0.84.0`. It's MIT licensed, and the rich diff is adapted from [`MasuRii/pi-tool-display`](https://github.com/MasuRii/pi-tool-display).

### Footer icons and the Nerd Font fallback<span id="nerd-font"></span>

The footer uses Nerd Font icons by default (`footerNerdIcons: true`): git branch, cache hits, and the MCP connection count at `U+F06A5` (`md-power_plug`).

When the font is wrong, the chain breaks like this:

```text
pi-cc-extensions wants to draw U+F06A5
        ↓
JetBrains Mono NL has no such glyph
        ↓
the terminal asks fontconfig for a fallback
        ↓
fontconfig finds no Nerd Font Symbols
        ↓
you get □ (tofu)
```

First check whether you're actually missing it:

```bash
fc-list ':charset=f06a5'      # who has U+F06A5; empty means nobody
fc-match ':charset=f06a5'     # where the fallback actually lands
```

If it's missing, install Symbols Only (a few hundred KB — it adds icons only and leaves your text font alone):

```bash
mkdir -p ~/.local/share/fonts && cd ~/.local/share/fonts
curl -LO https://github.com/ryanoasis/nerd-fonts/releases/latest/download/NerdFontsSymbolsOnly.zip
unzip -o NerdFontsSymbolsOnly.zip && rm NerdFontsSymbolsOnly.zip
fc-cache -fv
```

On macOS just unzip into `~/Library/Fonts/`. If you'd rather swap the text font for a patched build too, the same repo also ships `JetBrainsMono.zip`.

If you don't want to install a font at all, set `"footerNerdIcons": false` in `~/.pi/agent/pi-cc-extensions.json` — the footer falls back to plain text and nothing else changes.

## How to combine them

Pick by pain point; you don't need all twelve:

```text
Research all the time     → pi-web-access
Big repo, lost call paths → pi-codegraph
Agent over-engineers      → ponytail
Context always runs out   → context-mode
Want fixed rules/persona  → pi-custom-system-prompt
Afraid of missing a done  → @pi-unipi/notify
Needs interactive CLIs    → pi-interactive-shell
Third-party models        → pi-custom-provider-fix
Parallel work             → @mjakl/pi-subagent
Want a full eng playbook  → addyosmani/agent-skills
Model guesses your intent → @juicesharp/rpiv-ask-user-question
Want a nicer TUI theme    → pi-cc-extensions
```

One overlap is worth knowing about: `context-mode` and `pi-web-access` both influence how tools get called. context-mode is more aggressive (it enforces sandboxed execution), pi-web-access is narrower (web access only). Installing both is fine, but verify the actual routing behaviour after a restart or `ctx_purge`.

## Install everything at once

```bash
pi install npm:pi-web-access
pi install npm:@vndv/pi-codegraph
pi install npm:@dietrichgebert/ponytail
pi install npm:context-mode
pi install npm:pi-custom-system-prompt
pi install npm:@pi-unipi/notify
pi install npm:pi-interactive-shell
pi install git:github.com/youugiuhiuh/pi-custom-provider-fix
pi install npm:@mjakl/pi-subagent
pi install npm:@juicesharp/rpiv-ask-user-question
pi install npm:pi-cc-extensions
bunx skills add addyosmani/agent-skills
```

Then `/reload` inside Pi, and confirm with `pi list`.

## One caveat worth repeating

Every Pi package page carries the same security note, and it's worth quoting verbatim: **Pi packages can execute code and influence agent behavior. Review the source before installing third-party packages.**

Several of the above are not risk-free: `context-mode` takes over tool routing, `pi-custom-provider-fix` writes your model credentials, and `pi-web-access` reads the search API keys you configure. On a work machine or a sensitive repo, run them through a container first.

## References

- [pi.dev/packages](https://pi.dev/packages)
- [ryanoasis/nerd-fonts](https://github.com/ryanoasis/nerd-fonts)
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
- [vercel-labs/skills CLI](https://github.com/vercel-labs/skills)

For the Chinese version of this article, see [Pi 插件推荐：12 个真正提升日常开发体验的扩展](/blog/posts/zh/2026-09-21-pi-essential-extensions).
