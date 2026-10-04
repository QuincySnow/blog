---
title: "Why I recommend Pi — and how it compares to OpenCode, Codex, and Claude Code"
description: "Pi is a minimal, extensible agent harness: model-agnostic, session trees, Codemode, four integration surfaces, packages for extensibility. A comparison against OpenCode, Codex CLI, and Claude Code on licensing, model strategy, extensibility, and security model — plus when to pick which"
pubDatetime: 2026-09-21T00:00:00Z
modDatetime: 2026-09-21T00:00:00Z
draft: false
tags:
  - AI
  - Pi
  - Tooling
  - Comparison
lang: en
---

There are plenty of terminal AI agents, but most of them ship as a finished product you adapt to. Pi goes the other way: it describes itself as a **minimal, extensible agent harness that you can make your own** — it provides the skeleton, and your workflow grows out of it.

Two parts here: what Pi actually chose to do, then how it stacks up against OpenCode, Codex CLI, and Claude Code, and how to choose.

## What Pi is

Pi is built by Earendil (Mario Zechner, badlogicgames). The repo is [earendil-works/pi](https://github.com/earendil-works/pi), the npm package is `@earendil-works/pi-coding-agent`. Everything below is against the **v1.0.2** I have installed locally.

The one-sentence version: **if you want an agent that runs any model, reshapes into any workflow, and embeds into your own program, Pi is the best base. If you have an OpenAI or Anthropic subscription and just want something that works, Codex or Claude Code is less work.**

### Installing

```bash
curl -fsSL https://pi.dev/install.sh | sh          # pins deps; upgrade with pi update
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
nix profile add github:earendil-works/pi/stable
```

Requires **Node.js 22.19+**. Then run `pi` in a project directory and `/login` to connect a subscription or an API key.

## Five design choices that matter

### 1. Model-agnostic by default

Pi is not tied to one vendor. `/login` accepts a subscription (OAuth) or an API key; there's also environment-variable auth, local models, and any OpenAI-compatible custom endpoint.

Contrast that with Codex (OpenAI lineage, built around the ChatGPT subscription) and Claude Code (Anthropic). Switching models in Pi is a `/model` action, not a change of tool.

### 2. A session is a tree, not a line

This is Pi's most underrated design. Messages and events in a session form a **tree**; each root-to-leaf path is a **branch**, and the one ending at the current entry is the **active branch** — the only one that feeds the next model request.

```text
                    ┌─ branch A (active)
root ──┬── msg1 ──┬── msg2 ── msg3
       │           │
       │           └── branch B (alternative kept intact)
       └── msg1' ── msg2'
```

`/fork` to try another approach with history fully preserved, `/tree` for a tree navigator, `/resume` to pick another session, `pi --continue` to resume the last one.

In practice this solves a real problem: the agent took a wrong turn and you want to back up without poisoning the context.

### 3. Codemode: orchestrate with a script

The `codemode` tool lets the model write JavaScript that calls other tools and runs non-LLM models. Only the script's output reaches the model.

```javascript
const results = await Promise.allSettled([
  tools.codegraph_search({ query: "auth" }),
  tools.codegraph_callers({ symbol: "login" }),
]);
for (const r of results) if (r.status === "fulfilled") text(r.value);
```

Two concrete wins: parallel calls save time, and filtering before returning saves context. Identifiers replace invalid characters with `_`, so the MCP tool `mcp__dev-radius__search` is `tools.mcp__dev_radius__search`.

One detail worth knowing: `bash` resolves inside codemode to an object with `full_output_path`. The model sees the 2000-line/50KB view, but your script gets up to 1 MiB — so "just read the tail of a huge log" never requires pushing the whole thing into context.

### 4. Four integration surfaces

```text
Interactive TUI   → daily use
print mode        → one-off / scripted tasks (pi -p "...")
JSON event stream → consume structured events
RPC mode          → control a separate Pi process over JSONL
TypeScript SDK    → embed Pi inside your own app
```

The docs give this decision table:

| Interface | Process boundary | Control model | Best fit |
|---|---|---|---|
| SDK | In process | Direct TypeScript methods and events | Node.js or Bun hosts wanting full API access |
| RPC | Child process | JSONL commands, responses, events | Other languages, process isolation, IDEs, custom clients |

If you want to write an IDE plugin or wire Pi into CI, the RPC path is already there.

### 5. Four resource types, distributable as packages

- **extensions** — TypeScript/JavaScript, executable, hook into the agent lifecycle
- **skills** — `SKILL.md`, full instructions loaded on demand
- **prompt templates** — Markdown expanded from editor input
- **themes** — JSON

Bundle them as a **Pi package** and distribute via npm or git; add the `pi-package` keyword and it shows up in the [pi.dev/packages](https://pi.dev/packages) gallery. Identity rules matter: npm packages by name, git packages by repo URL (without the ref), local packages by resolved absolute path — which prevents the same package loading twice.

**The key point: Pi deliberately skips some features.** The docs say it ships with powerful defaults but skips things like sub-agents and plan mode. If you want those, install a package or write one.

That's not laziness — it's handing the choice back to you. Shipping features nobody uses is what most products do; Pi makes you pull them in deliberately.

Pi also has MCP built in:

```bash
pi mcp add camoufox -- npx -y camoufox-mcp-server@latest
pi mcp list
```

User-level config is `~/.pi/agent/mcp.json`, project-level is `.pi/mcp.json` (after project trust), and tools are named `mcp__<server>__<tool>`.

## Comparison: Pi vs OpenCode vs Codex vs Claude Code

### At a glance

| Dimension | **Pi** | **OpenCode** | **Codex CLI** | **Claude Code** |
|---|---|---|---|---|
| Positioning | agent harness you make your own | "the open source AI coding agent" | lightweight terminal coding agent | agentic coding tool in your terminal |
| License | open source | **MIT** | **Apache-2.0** | **Proprietary** (no OSS license on the GitHub repo) |
| Language | TypeScript | TypeScript | Rust | TypeScript |
| Distribution | npm / install script / nix | npm / brew / pacman / mise | npm `@openai/codex` / brew cask / standalone installer | npm `@anthropic-ai/claude-code` |
| Model strategy | **agnostic**: subscription / API key / local / compatible endpoint | multi-provider, models.dev-driven | ChatGPT subscription first ("Sign in with ChatGPT"), API key supported | Anthropic-bound (subscription or API key) |
| Sandbox | **none built in** | — | **yes**, dedicated sandbox & approvals docs | — |
| Extension model | extensions / skills / prompts / themes, packaged | plugin mechanism + `opencode.json` | AGENTS.md + config | hooks / skills / subagents / plugins / MCP |
| Session branching | **built-in tree, fork** | — | — | — |
| Script orchestration | **built-in Codemode** | — | — | — |
| Embedding | **SDK + RPC + JSON stream + print** | — | non-interactive mode | headless mode |
| Strength | malleability, model freedom, embeddability | open source, broad providers, large community | tight ChatGPT integration, **sandbox** | most mature ecosystem, richest skills/plugins |
| Weakness | many capabilities are packages | less deep customization | fairly bound to OpenAI | closed source, bound to Anthropic |

> A "—" means I didn't find an explicit official statement; it does not mean the tool lacks it. These tools move fast — check current docs for specifics.

### A few words on each

**OpenCode** (the repo has moved to [anomalyco/opencode](https://github.com/anomalyco/opencode); the old `sst/opencode` redirects): MIT, TypeScript, literally billed as "the open source AI coding agent", broad provider coverage, with a desktop app in beta. If you want open-source freedom with something that works out of the box, it's a strong pick. The difference from Pi is mostly the **depth and shape of customization** — Pi extensions can modify the agent loop itself, not just add commands.

**Codex CLI**: Apache-2.0, written in Rust, with the most formal distribution story (standalone installer + npm + brew cask). The stand-out is its **separate sandbox and approvals system** — the thing Pi explicitly lacks. If you intend to run an unattended agent in CI or on a shared machine, that matters more than anything else here. It supports ChatGPT plan sign-in (Plus/Pro/Business/Edu/Enterprise) and non-interactive mode for scripted work.

**Claude Code**: proprietary, Anthropic's own. It has the most mature ecosystem — hooks, skills, subagents, plugins, MCP — and third-party skill packs tend to support it first. The cost is a single-vendor lock and no ability to modify the agent's core.

### The difference people miss: the security boundary

Pi's docs are unusually blunt about this:

> Pi's tools and extensions run with the permissions of the Pi process. Project trust controls which project resources Pi loads, but it does not sandbox tool calls.

So `/trust` only controls *which project resources get loaded* — it is not a sandbox. Pi's stated security boundary treats prompt injection from untrusted content, the absence of a built-in sandbox, and behavior from user-installed extensions or skills as **expected local-agent behavior**, not vulnerabilities.

If you plan to run Pi in CI, on a shared server, or against untrusted code, **you have to supply the isolation yourself** (container, Docker sandbox, separate user). Codex's built-in sandboxing works out of the box. For my comparison, that's the most substantive gap.

## How to choose

```text
Maximum malleability / embed into your own app → Pi
Unattended runs in CI or on shared machines    → Codex (built-in sandbox), or Pi + container
Anthropic-only, want the richest ecosystem     → Claude Code
Open source, works immediately, GUI-friendly  → OpenCode
Switch models often to compare their output   → Pi (/model and go)
```

My own split for daily work: Pi as the primary, extensions for anything browser- or web-related (I wrote a [roundup of 10 Pi extensions](/blog/posts/en/2026-09-21-pi-essential-extensions-en) earlier), a subagent-style package when I want parallelism, and a container whenever it runs unattended.

## The one-line summary

Pi isn't the most feature-complete agent, but it may be the easiest one to turn into exactly what you want: any model, forkable sessions, scriptable tool calls, embeddable in a program, and extensibility you can package and share. The trade is that it delegates a lot of "should have been built in" to community packages, and it leaves sandboxing to you.

If you care more about working out of the box and ecosystem depth, Codex and Claude Code are the safer bet. If you care about open-source freedom, OpenCode is excellent. And if you keep finding yourself bending a tool around your workflow instead of the other way around — that's the signal to try Pi.

## References

- [earendil-works/pi](https://github.com/earendil-works/pi) · [pi.dev](https://pi.dev)
- [Pi documentation](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/docs)
- [anomalyco/opencode](https://github.com/anomalyco/opencode)
- [openai/codex](https://github.com/openai/codex) · [Codex security docs](https://developers.openai.com/codex/security)
- [anthropics/claude-code](https://github.com/anthropics/claude-code)

For the Chinese version of this article, see [为什么我推荐 Pi Agent：与 OpenCode、Codex、Claude Code 的对比](/blog/posts/zh/2026-09-21-pi-agent-vs-codex-claude-code-opencode).
