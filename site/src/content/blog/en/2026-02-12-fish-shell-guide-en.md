---
title: Fish Shell Setup Guide
description: From install to a full-stack dev environment
pubDatetime: 2026-02-12T00:00:00Z
modDatetime: 2026-02-12T00:00:00Z
draft: false
tags:
  - fish
  - shell
  - terminal
  - development
lang: en
---

Fish (Friendly Interactive Shell) focuses on out-of-the-box usability. This guide covers install, default shell setup, and a dev-friendly environment.

## Install

- **macOS**: `brew install fish`
- **Ubuntu/Debian**: `sudo apt update && sudo apt install fish`

Set as default: `chsh -s $(which fish)` (path may be `/usr/bin/fish` or `/opt/homebrew/bin/fish`).

## Config

Edit `~/.config/fish/config.fish`. Add paths, aliases, and plugins (e.g. Fisher) as needed. For Python/Node/Bun/Go/Rust integration and full snippets, see the [Chinese version](2026-02-12-fish-shell-guide) of this guide.
