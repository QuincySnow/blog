---
title: "OpenCode Plugin Combo: Superpowers + DCP + Notificator for Better AI Coding"
description: "A lightweight, cost-effective OpenCode plugin combo for individual developers"
pubDatetime: 2026-04-16T00:00:00Z
lang: en
tags:
  - OpenCode
  - AI Programming
  - Productivity Tools
---

# OpenCode Plugin Combo: Superpowers + DCP + Notificator for Better AI Coding

I tried oh-my-opencode-slim before but gave up due to provider compatibility issues. Later, I narrowed it down to **Superpowers + Dynamic Context Pruning (DCP) + Notificator** — a lightweight combo that's proven highly cost-effective for individual developers.

Today I'll share the installation steps, usage tips, and real-world effects of this combo.

## Why These Three Plugins?

- **Superpowers** ([obra/superpowers](https://github.com/obra/superpowers)): Gives AI a real software engineering SOP. It automatically strengthens Planning, TDD, code review, git worktree isolation, root cause analysis, and more. Avoids "random code generation" vibe coding, making Plan more rigorous and Build more reliable.
- **DCP** ([opencode-dynamic-context-pruning](https://github.com/Opencode-DCP/opencode-dynamic-context-pruning)): Token-saving magic! It non-destructively prunes outdated tool outputs (duplicate reads, old ls results, etc.), easily saving 30-60% tokens per long session (sometimes removing 50k+ useless context). Especially noticeable during long Build iterations.
- **Notificator** ([mohak34/opencode-notifier](https://github.com/mohak34/opencode-notifier) + BurntToast): Implements Windows desktop Toast notifications + sound alerts in WSL. Pops up when Build completes, errors occur, or human confirmation is needed — no more staring at the terminal.

These three plugins are **lightweight, conflict-free, and zero cloud dependency risk** (DCP and Superpowers are fully local), perfect for the "big model for planning, small model for iteration" setup.

## Installation Steps

1. **Superpowers** (most important, install first):
   In OpenCode TUI, input directly:
   ```
   Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
   ```
   Or add to `opencode.jsonc` plugin array:
   ```json
   "superpowers@git+https://github.com/obra/superpowers.git"
   ```

2. **DCP**:
   ```
   opencode plugin install opencode-dynamic-context-pruning@latest
   ```

3. **Notificator** (requires BurntToast module):
   Add to `opencode.jsonc`:
   ```json
   "@mohak34/opencode-notifier"
   ```
   Install BurntToast module before first use (in PowerShell):
   ```powershell
   Install-Module -Name BurntToast -Force -Scope CurrentUser
   ```
   Then configure WSL-specific PowerShell popup:

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

### Config Explanation

- **suppressWhenFocused: true**: When OpenCode window is focused, completely skip notifications and sounds (won't disturb you while typing or watching output).
- **events filtering**: Fully disable user_message and session_started, only trigger on important events (complete, error, permission, question).
- **PowerShell check**: Even if command is triggered, only handle important events to prevent accidents.
- **suppressInterval: 5**: Same event only triggers once within 5 seconds, avoiding duplicate popups.

Then run:
```bash
opencode reload
opencode doctor
```
Confirm all three plugins loaded successfully.

## Recommended Core Config (~/.config/opencode/opencode.jsonc)

```jsonc
{
  "model": "opencode-go/<your-plan-model>",
  "small_model": "opencode-go/<your-build-model>",
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "opencode-dynamic-context-pruning",
    "@mohak34/opencode-notifier"
  ],
  "temperature": 0.1,
  "dcp": {
    "enabled": true,
    "strategies": ["duplicate", "ai-analysis", "compress"],
    "protect_recent": 10
  }
}
```

## Real-World Experience

- **Superpowers** keeps AI from "going rogue." Every Plan phase systematically asks questions, breaks down tasks, and considers edge cases. Refactoring quality for complex projects has improved significantly.
- **DCP** is the most practical money-saving plugin. Long sessions used to burn tokens fast; now it stays down ~40%, directly reducing monthly costs.
- **Notificator** with BurntToast is super comfortable. After a big iteration, desktop pops up "Build Completed!" — no more window-switching.

Overall effect: Upgraded from "AI assistant" to "mini dev team with process discipline + cost savings + reminders." Perfect for solo developers, especially long-term projects.

## Use Cases & Tips

- Great for full-stack projects, refactoring, and security-sensitive projects.
- Start with Superpowers + DCP first, then add Notificator once familiar.
- For larger projects, consider adding opencode-vibeguard (private key masking), opencode-worktree (multi-task isolation), etc.

## Summary

**Superpowers + DCP + Notificator** is a lightweight, cost-effective combo. It doesn't chase fancy multi-agent setups — it focuses on **process quality + cost control + user experience**.

If you're using OpenCode, highly recommend trying this combo!

Feel free to share your plugin tips or token savings in the comments!