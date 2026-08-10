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

## Six Layers, Clear Responsibilities

1. **Superpowers: workflow layer.** It turns requirements clarification, debugging, testing, and pre-completion verification into explicit steps instead of jumping straight to implementation.
2. **CodeGraph: symbols and call paths.** After building a local code graph for a repository, it provides source-plus-call-path exploration from a symbol, file, or question.
3. **codebase-memory-mcp: knowledge-graph layer.** Use the MCP tool `index_repository` to create a persistent graph index, then use `search_graph` for structured objects such as functions, classes, and routes. `trace_path` follows calls or data paths, and graph queries support more targeted investigation.
4. **context-mode: context-processing layer.** `ctx_execute` and `ctx_execute_file` process analysis in a sandbox; `ctx_batch_execute` collects command results in batches; and `ctx_search` retrieves only the indexed material needed next, including searchable session context.
5. **DCP: context-pruning layer.** It prunes stale context automatically during a session or through its commands, keeping the active task focused on more relevant information.
6. **Notificator: optional notification layer.** Configure WSL/Windows desktop notifications only when it is useful to leave the terminal while a task runs.

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
opencode plugin @tarquinen/opencode-dcp@latest --global
```

## A Daily Workflow

Start with the task, not the tool. Use Superpowers to establish whether the work is investigation, implementation, or review. When existing behavior needs explanation, use CodeGraph or the knowledge graph to find the relevant symbols and paths before repeatedly searching the full repository.

For large files, build logs, or several independent commands, use context-mode. `ctx_execute` runs and distills command output, `ctx_execute_file` analyzes a file without bringing all of it into the session, `ctx_batch_execute` collects a group of results, and `ctx_search` retrieves only the material needed for the next step.

After making a change, run the smallest complete verification command for the project. DCP maintains stale tool context in the background without changing that workflow.

## Optional: WSL Desktop Notifications

This setup is entirely optional and only applies to people using WSL who want notifications on the Windows desktop. It retains the PowerShell BurntToast installation command and `notificator` configuration. If you do not use WSL/Windows, you do not need either.

Install the BurntToast module before first use in PowerShell:

```powershell
Install-Module -Name BurntToast -Force -Scope CurrentUser
```

Then configure WSL-specific PowerShell notifications:

```json
{
  "notificator": {
    "command": {
      "enabled": true,
      "path": "pwsh.exe",
      "args": [
        "-NoProfile",
        "-Command",
        "$event = '{event}'; if ($event -in @('permission','complete','error','question')) { New-BurntToastNotification -Text $event, '{message}' -Sound 'Default' }"
      ]
    },
    "events": {
      "user_message": {
        "notification": false,
        "sound": false,
        "command": false
      },
      "session_started": {
        "notification": false,
        "sound": false,
        "command": false
      },
      "permission": {
        "notification": true,
        "sound": true,
        "command": true
      },
      "complete": {
        "notification": true,
        "sound": true,
        "command": true
      },
      "error": {
        "notification": true,
        "sound": true,
        "command": true
      },
      "question": {
        "notification": true,
        "sound": true,
        "command": true
      }
    },
    "suppressWhenFocused": true,
    "suppressInterval": 5
  }
}
```

## Closing Notes

This is not a single-plugin answer to every development problem. Assign workflow discipline, repository understanding, and context management to the appropriate tools: Superpowers provides the working steps; CodeGraph and codebase-memory-mcp provide repository-level navigation; context-mode processes and retrieves large outputs; DCP maintains session context; and Windows notifications remain an opt-in convenience.
