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

And the end state of this is worth being explicit about: **you end up with your own workflow rather than adjusting to whatever a tool decided to ship.** The official tagline puts it best — *Adapt Pi to your workflows, not the other way around.*

Concretely, the difference shows up in a few places:

- **You decide how many tools exist.** Four by default (read / write / edit / bash); add one capability by installing one package, instead of accepting a pile of tool descriptions you never use — which, remember, get re-sent into context on every turn.
- **Behavior can be rewritten.** Extensions hook the agent lifecycle, so in principle you can transform context before a request, intercept tool calls, and inject your own logic — not just "add a command."
- **The workflow is packageable and shareable.** A tuned set of skills + prompts + extensions becomes a Pi package others can `pi install`. That also explains why packages like `context-mode`, `ponytail`, and `pi-subagent` exist at all.

By contrast, the extension points of OpenCode / Codex / Claude Code are mostly "add things to a fixed shape" — commands, agents, hooks, plugins. Pi's extension points get closer to "change how the agent runs." That's the often-cited finding, which does hold up: *the harness that ships four tools beat the harness that ships everything.*

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

## Measured data: what a harness is worth once the model is fixed

All of the above is design comparison, and design doesn't tell you how things perform. More convincing is a controlled experiment that **holds the model fixed and swaps only the harness**.

First, what this class of experiment actually answers:

> "I already have a strong model — which harness should drive it?"

Not "which model is strongest."

### Experiment 1: Tensorlake, four-way

[Tensorlake's 14-day test](https://www.tensorlake.ai/blog/best-ai-coding-agents-2026) ran 30 hard agentic tool-use tasks on DeepSeek V4 Flash across all four harnesses:

| Harness | Passed | Median time | Avg tokens/task | Total cost | Cost/success |
| --- | --- | --- | --- | --- | --- |
| **Pi** | **20/30 (66.7%)** | 132.2s | 558,885 | **$0.56** | **$0.028** |
| Claude Code | 16/30 (53.3%) | **122.7s** | 741,659 | $3.12 | $0.195 |
| Codex | 16/30 (53.3%) | 245.0s | 664,772 | $1.29 | $0.081 |
| OpenCode | 14/30 (46.7%) | 129.7s | 692,195 | $1.03 | $0.073 |

The author's conclusion is blunt: Pi won, and not narrowly on cost — the harness that ships four tools beat the harness that ships everything.

In the same run, Claude Code was fastest but the most token-hungry; Codex matched Claude Code's pass rate at under half the cost, but took a 245s median — roughly double everyone else. Tensorlake's TL;DR calls Pi "best if you pay per token" while flagging **almost no guardrails**.

### Experiment 2: Composio, eight-way

[Composio's test](https://composio.dev/content/best-agent-harness-deepseek-v4-flash) covers more ground (eight harnesses), again DeepSeek V4 Flash on the same 30 tasks:

| Harness | Passed | Median time | Cost per success |
| --- | --- | --- | --- |
| **Pi** | **20/30 (66.7%)** | 132.2s | **$0.028** ⚠️ |
| Prime Agent | 15/24 valid (62.5%) | ~4 min | $0.131 |
| OMP (Oh My Pi) | 17/30 (56.7%) | 272.4s | $0.103 |
| Claude Code | 16/30 (53.3%) | **122.7s** | $0.195 |
| Codex | 16/30 (53.3%) | ~4 min | $0.081 |
| DeepAgents | 16/30 (53.3%) | 187.1s | $0.045 |
| Hermes | 15/30 (50%) | 175.5s | $0.056+ |
| OpenCode | 14/30 (46.7%) | 129.7s | $0.073 |

⚠️ **The official caveat has to come with this**:

> Pi had the lowest reported cost. It cost $0.028 for each successful task. **However, Pi used a different reasoning setting, and it used two model providers. This limits a direct comparison.**

So Pi's **cost** number is not strictly comparable — different reasoning settings and two providers. The pass-rate column doesn't have that problem.

The most instructive part of this test isn't who won, it's **why Claude Code was most expensive**. Its total token use was similar to Codex and OMP, but only **1.5% of its tokens came from cache**, versus roughly 70% for Codex and 57% for OMP — and fresh input costs five times cached input. The original conclusion: *token count alone does not explain cost.* What matters is the mix of fresh input, cached input, and output.

Note that time and tokens don't track each other: Claude Code and OMP both used about 742,000 tokens per task, yet Claude Code finished in under half the time; Hermes used only about 192,000 tokens and was still slower than Claude Code.

### Experiment 3: Pi head-to-head

[Composio's second round](https://composio.dev/content/pi-vs-opencode) switched to DeepSeek V4 Pro (0813) at max reasoning, same 30 hard tasks:

| Harness | Passed | Cost/success | Cost per shared success | Avg tokens | Avg turns |
| --- | --- | --- | --- | --- | --- |
| **Pi Agent** | **21/30 (70%)** | $0.078 | $0.031 | 924,990 | 16.3 |
| Codex | 20/30 (66.7%) | n/a\* | $0.031 | 383,722 | n/a |
| DeepSeek Harness | 20/30 (66.7%) | $0.076 | $0.028 | 88,562 | 0.9 |
| OpenCode | 19/30 (63.3%) | $0.119 | $0.032 | 710,140 | 13.1 |
| Claude Code | 19/30 (63.3%) | n/a\* | $0.074 | 649,900 | 12.1 |
| Hermes | 18/30 (60%) | n/a\* | $0.037 | 113,894 | 6.5 |

\* Cost measurement incomplete; not comparable.

Here **Pi is not the most token-frugal** — 925k tokens per task against Codex's 384k. But the two more meaningful metrics are: **Pi had the highest pass rate (70%)**, and **on tasks both harnesses passed, Pi and Codex cost exactly the same** ($0.031). The original explanation is a good one: OpenCode looks expensive not because it costs more when it succeeds, but because **it fails more tasks, and failed runs burn tokens too.**

Pi spent $1.64 for the full run; OpenCode $2.25.

### Cold-start overhead: a number to read carefully

The most-cited evidence for "Pi is lighter" actually comes from [Systima's measurement](https://systima.ai/blog/claude-code-vs-opencode-token-overhead), and it compares **Claude Code vs OpenCode — Pi is not in it**:

The conditions are unusually controlled — same machine, pinned `claude-sonnet-4-5`, fresh config directories (no MCP, no user settings, no memory), empty workspace (no instruction files), permissions bypassed. The task is to reply `Reply with exactly: OK` (22 characters), three runs per harness.

| | Claude Code | OpenCode |
| --- | --- | --- |
| System prompt | 27,344 chars, 3 blocks | 9,324 chars, 1 block |
| Tool schemas | **27 tools**, 99,778 chars | 10 tools, 20,856 chars |
| First-message `<system-reminder>` blocks | 7,997 chars | none |
| The actual prompt | 22 chars | 22 chars |
| **First-turn payload (calibrated)** | **~32,800 tokens** | **~6,900 tokens** |

Tool schemas are the dominant term: roughly 24,000 of Claude Code's ~33,000 tokens are tool definitions, versus roughly 4,800 of OpenCode's ~6,900.

Pi's own numbers come from the project's own description: **four tools by default (read / write / edit / bash), system prompt under 1,000 tokens**, everything else opt-in via packages.

But Systima's author adds an important qualifier, worth quoting:

> raw input token count is not a meaningful benchmark... What really matters is the mix of tools the harness exposes, the steering it embeds into tool descriptions, and how effectively it takes advantage of model and provider features such as prompt caching.

So the defensible claim is narrower: **Pi really is much cheaper on a single interaction** (fewer tools, shorter prompt). Lower fixed context overhead is not by itself "better outcomes" — Claude Code's 27 tools include background agents, orchestration, and worktree management. The extra spend buys something.

## One important timing gap: the benchmarks aren't of 1.0

All four benchmarks above share a detail worth noticing: **they all predate Pi 1.0.**

```text
Systima (cold-start overhead)     2026-07
Composio (DeepSeek V4 Flash)      2026-08-06
Composio (DeepSeek V4 Pro)        2026-08-21
────────────────────────────────────────
Pi 0.86.0 adds prompt cache warming  2026-09-19
Pi 0.99.0                              2026-09-29
Pi 1.0.0                               2026-10-01   ← after every benchmark
```

So that $0.028 was measured on a **0.8x-era Pi**. Since then Pi shipped another round of cost-targeted work, item by item in the official CHANGELOG:

| Version | Date | Cost-relevant change |
| --- | --- | --- |
| 0.86.0 | 2026-09-19 | **Prompt cache warming** — keeps valuable caches alive during long tool runs and while idle, using cost-aware refreshes |
| 0.86.0 | 2026-09-19 | **Transcript-aware prompt/tool updates** — instruction and tool changes survive resume and branch navigation while **retaining cached prefixes** |
| 0.99.0 | 2026-09-29 | Fixed usage from tools called through `ctx.executeTool()` (e.g. codemode scripts) being **dropped from session cost**; it now counts |
| **1.0.0** | **2026-10-01** | **Leaner codemode: about 40% fewer prompt tokens** |
| 1.0.1 | 2026-10-03 | Anthropic tools added or redefined mid-conversation are defined inline, so redefining one under the same name **keeps the prompt cache instead of resending the full tool list** |
| 1.0.1 | 2026-10-03 | Fixed Bedrock OpenAI models being billed at the short-context rate above 272k input tokens; pricing tiers from models.dev now apply |

1.0.0 gives a concrete number: **with default tools and codemode active, a GPT-5.6 request shrinks from about 5,300 tokens to about 3,300** (roughly −38%).

The method wasn't removing features — it was rewriting how they're described:

- In the `codemode` description, each script global takes one line, and the `models` API points to a reference doc the model **reads when it needs it**
- Declared tools say in one line how scripts call them and what the call resolves to, **instead of repeating the full declaration**
- The system prompt's codemode guidance and MCP server section were shortened at the same time

That's the design paying off in cost terms: **fewer tools plus shorter descriptions means a smaller fixed overhead per turn.** Cache warming, cached-prefix preservation, and billing fixes are all about squeezing value out of context you've *already paid for*.

### Reproducing the −40%

The CHANGELOG gives a concrete figure: a GPT-5.6 request shrinking from about 5,300 to 3,300 tokens. I tested that locally — `codemode` on, one fixed `Reply with exactly: OK`, Pi version as the only variable.

| Model | 0.99.2 | 1.0.2 | Change |
| --- | --- | --- | --- |
| deepseek-v4-flash | 4,127 | **2,403** | **−41.8%** |
| gpt-5.6-luna | 3,211 | **1,703** | **−47.0%** |
| *official changelog (GPT-5.6)* | *5,300* | *3,300* | *−37.7%* |

Five runs per group, medians, measured as total context sent per turn (`input + cacheRead + cacheWrite`). Absolute values differing from the official numbers is expected — different model, different tokenizer — but **the magnitude lands in the same range and slightly exceeds it.** The "about 40%" claim can be treated as independently reproduced, not just a changelog line.

Reproducing it needs no installation of an old version:

```bash
PI_CODING_AGENT_DIR=/tmp/clean \
bunx @earendil-works/pi-coding-agent@0.99.2 \
  --mode json --print --tools read,bash,edit,write,codemode \
  --model opencode-go/deepseek-v4-flash "Reply with exactly: OK"
```

`bunx` fetches a pinned version without touching your global install, and `PI_CODING_AGENT_DIR` points at an empty directory holding only credentials — no packages — so installed extensions stay out of the measurement.

### A trap worth recording: `input` is not context size

The first run made `input` look tiny — a few tokens:

| Model | input | cacheRead | cacheWrite |
| --- | --- | --- | --- |
| deepseek-v4-flash (0.99.2) | 31 | **4,096** | 0 |
| gpt-5.6-luna (0.99.2) | 3 | 0 | **3,208** |

The truth is that **the whole context was absorbed by the cache.** The real metric is `input + cacheRead + cacheWrite`.

Money amplifies this distinction hard. On `deepseek-v4-flash` list pricing:

| | USD / 1M tokens |
| --- | --- |
| input | 0.15 |
| output | 0.6 |
| **cacheRead** | **0.003** |

**Cache reads are 50x cheaper than fresh input.** So "bigger context = more expensive" stops being true once caching is on — what costs is always the part that *missed* the cache.

That is the same mechanism Composio found from the other direction: Claude Code is expensive not because it uses more tokens, but because only 1.5% of them hit cache.

### Where your own overhead actually lives

Measuring the same way also shows the gap between bare Pi and Pi with packages installed (same model, same prompt):

| Configuration | Context per turn |
| --- | --- |
| Bare Pi · four default tools · no packages · no codemode | **1,940** |
| Bare Pi · four default tools + codemode | 2,403 |
| With 11 Pi packages installed | **25,651** |

Bare Pi's fixed overhead really is around 1,940 tokens, which supports the "the harness itself is light" claim above. But **in day-to-day use, over 90% of that overhead comes from extensions, not from Pi.**

Thanks to caching, though, that last row is also the *cheapest* of the three in real money ($0.000086 per turn versus $0.000299 for bare Pi) — nearly all 25k arrives as cacheRead. That's exactly what cache warming buys you.

### The conclusion

So the fuller statement is: **the benchmarks show 0.8x Pi already leading; 1.0's codemode slimming measurably cuts fixed overhead by more than 40%; and the cache-warming work turns context you've already paid for into something close to free reads.**

As for how much further that pushes the $0.028 in those benchmarks — that needs the full three-way comparison re-run on a fixed task set with repeats. There is no data for it yet, so don't speculate.

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

Pi isn't the most feature-complete agent, but it may be the easiest one to turn into exactly what you want: any model, forkable sessions, scriptable tool calls, embeddable in a program, and extensibility you can package and share. Its stance is *adapt Pi to your workflows, not the other way around* — you end up with your own workflow instead of adjusting to the tool.

The measured data so far points the same way: in head-to-head tests that hold the model fixed and vary only the harness, Pi posts the highest pass rate (20/30 to 21/30) and the lowest cost per successful task ($0.028), and under tight controls its cold-start context overhead is far below Claude Code's.

The trade-offs are just as clear: it delegates a lot of "should have been built in" to community packages, and it leaves sandboxing entirely to you.

If you care more about working out of the box and ecosystem depth, Codex and Claude Code are the safer bet. If you care about open-source freedom, OpenCode is excellent. And if you keep finding yourself bending a tool around your workflow instead of the other way around — that's the signal to try Pi.

## References

- [earendil-works/pi](https://github.com/earendil-works/pi) · [pi.dev](https://pi.dev)
- [Pi documentation](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/docs)
- [anomalyco/opencode](https://github.com/anomalyco/opencode)
- [openai/codex](https://github.com/openai/codex) · [Codex security docs](https://developers.openai.com/codex/security)
- [anthropics/claude-code](https://github.com/anthropics/claude-code)
- [Tensorlake: Best AI Coding Agents in 2026](https://www.tensorlake.ai/blog/best-ai-coding-agents-2026)
- [Composio: Finding the Best Harness for DeepSeek V4 Flash](https://composio.dev/content/best-agent-harness-deepseek-v4-flash)
- [Composio: Pi vs OpenCode](https://composio.dev/content/pi-vs-opencode)
- [Systima: Claude Code vs OpenCode token overhead](https://systima.ai/blog/claude-code-vs-opencode-token-overhead)

For the Chinese version of this article, see [为什么我推荐 Pi Agent：与 OpenCode、Codex、Claude Code 的对比](/blog/posts/zh/2026-09-21-pi-agent-vs-codex-claude-code-opencode).
