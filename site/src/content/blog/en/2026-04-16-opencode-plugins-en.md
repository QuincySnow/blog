---
title: "An OpenCode Local Tool Stack: Superpowers, CodeGraph, Knowledge Graphs, and Context Management"
description: "A local OpenCode workflow for engineering discipline, codebase navigation, context control, and notifications"
pubDatetime: 2026-04-16T00:00:00Z
lang: en
tags:
  - OpenCode
  - AI Programming
  - Productivity Tools
---

# An OpenCode Local Tool Stack: Superpowers, CodeGraph, Knowledge Graphs, and Context Management

In a long OpenCode session, the hard part is rarely model capability alone. Process drifts, code becomes difficult to locate, and old tool output crowds out the work that matters. This local stack assigns each problem to a focused tool: Superpowers guides the workflow; CodeGraph and a knowledge graph help explain the repository; context-mode handles large outputs; and DCP removes stale context. Desktop notifications are optional.

## What This Stack Solves

Complex repositories should not require starting from the file tree on every task. Long sessions also do not need to retain every command result forever. With clear boundaries, OpenCode can locate symbols and call paths when needed, keep large outputs in local searchable indexes, and leave workflow discipline and context maintenance to dedicated tools.

The projects covered here are:

- [CodeGraph](https://github.com/colbymchenry/codegraph)
- [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)
- [context-mode](https://github.com/mksglu/context-mode)
- [Dynamic Context Pruning](https://github.com/Opencode-DCP/opencode-dynamic-context-pruning)
- [agent-skills](https://github.com/addyosmani/agent-skills): production-grade engineering skills for AI coding agents
- [ponytail](https://github.com/DietrichGebert/ponytail): makes the agent take the smallest change, lazy-senior-dev style

## Six Layers, Clear Responsibilities

1. **Superpowers: workflow layer.** It turns requirements clarification, debugging, testing, and pre-completion verification into explicit steps instead of jumping straight to implementation. [agent-skills](https://github.com/addyosmani/agent-skills) and [ponytail](https://github.com/DietrichGebert/ponytail) sit in the same layer and can be layered on per task.
2. **CodeGraph: symbols and call paths.** After building a local code graph for a repository, it provides source-plus-call-path exploration from a symbol, file, or question.
3. **codebase-memory-mcp: knowledge-graph layer.** Use the MCP tool `index_repository` to create a persistent graph index, then use `search_graph` for structured objects such as functions, classes, and routes. `trace_path` follows calls or data paths, and graph queries support more targeted investigation.
4. **context-mode: context-processing layer.** `ctx_execute` (with its `file` parameter) processes analysis in a sandbox; `ctx_batch` collects command results in batches; `ctx_index` makes docs or large files searchable in advance; and `ctx_search` retrieves only the indexed material needed next.
5. **DCP: context-pruning layer.** It prunes stale context automatically during a session or through its commands, keeping the active task focused on more relevant information.
6. **Built-in notifications: optional notification layer.** V2 ships system notifications and sounds; enable them in `cli.json` only when it is useful to leave the terminal while a task runs.

## Install and Initialize

Follow each project's official documentation for its installation requirements. CodeGraph's official CLI flow is:

```bash
codegraph install
codegraph init
```

After initialization, start with a concrete question about the codebase:

```bash
codegraph explore "authentication flow"
```

Use codebase-memory-mcp and context-mode through their OpenCode MCP tool surfaces. For the former, index the repository with `index_repository`, then use `search_graph` and `trace_path` as needed. For the latter, keep expensive command output and large-file analysis in searchable local context. This article intentionally does not provide installation commands that are not verified by the projects' official sources.

Install Dynamic Context Pruning globally with its documented command:

```bash
opencode plugin add @tarquinen/opencode-dcp@latest
```

## A Daily Workflow

Start with the task, not the tool. Use Superpowers to establish whether the work is investigation, implementation, or review. When existing behavior needs explanation, use CodeGraph or the knowledge graph to find the relevant symbols and paths before repeatedly searching the full repository.

For large files, build logs, or several independent commands, use context-mode. `ctx_execute` runs and distills command output (its `file` parameter analyzes a file without bringing all of it into the session), `ctx_batch` collects a group of results, `ctx_index` builds a searchable index, and `ctx_search` retrieves only the material needed for the next step.

After making a change, run the smallest complete verification command for the project. DCP maintains stale tool context in the background without changing that workflow.

## Optional: Desktop Notifications

System notifications are built into V2, so the `notificator` plugin is no longer needed. Write the following to `~/.config/opencode/cli.json` to get a system notification and sound when the terminal is not focused:

```json
{
  "$schema": "https://opencode.ai/v2/cli.json",
  "attention": {
    "notifications": true,
    "sound": true,
    "volume": 0.4,
    "sound_pack": "opencode.default"
  }
}
```

To override the sound for a specific event, use `attention.sounds` for `default`, `question`, `permission`, `error`, `done`, or `subagent_done`. This is entirely optional; skip it if you do not want desktop notifications.

## Closing Notes

This is not a single-plugin answer to every development problem. Assign workflow discipline, repository understanding, and context management to the appropriate tools: Superpowers provides the working steps; CodeGraph and codebase-memory-mcp provide repository-level navigation; context-mode processes and retrieves large outputs; DCP maintains session context; and system notifications remain an opt-in convenience.
