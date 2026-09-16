---
title: "Modern CLI Tools You Need in 2026: From ncdu to gdu, from ls to eza"
description: "A curated list of modern CLI tools for 2026 covering disk analysis, file browsing, search, and system monitoring"
pubDatetime: 2026-04-18T00:00:00Z
modDatetime: 2026-09-16T00:00:00Z
draft: false
tags:
  - CLI
  - Tooling
  - Linux
  - Terminal
  - fzf
  - eza
  - bat
lang: en
---

# Modern CLI Tools You Need in 2026: From ncdu to gdu, from ls to eza

If you're still using `ncdu`, `ls`, `cat`, `find`, `grep`, `top`, it's time to upgrade. The CLI tool ecosystem in 2026 is booming—numerous Rust/Go-powered modern tools are faster, prettier, and more user-friendly.

**Most recommended 9 core tools**: **fzf**, **ripgrep**, **zoxide**, **eza**, **bat**, **fd-find**, **btop**, **gdu**, **dua-cli**. These tools cover high-frequency daily development scenarios—install them and you'll see immediate efficiency gains.

## 1. fzf (Fuzzy Finder, Must-Have!)

Fuzzy find anything (history, files, processes, etc.).

```bash
sudo apt install fzf
source <(fzf --zsh)
```

**Shortcuts**: Ctrl+R (history), Ctrl+T (files).

**Advanced usage**:
```bash
fzf --preview 'bat --style=numbers --color=always {}'
fd -e go | fzf
```

## 2. ripgrep (Code Search)

Ultra-fast code search, automatically ignores .gitignore.

```bash
sudo apt install ripgrep
```

**Common examples**:
```bash
rg "TODO"                    # Search for TODO
rg -t go "func main"         # Search only in Go files
rg -l "error"                # Show only filenames with matches
rg -C 3 "panic"              # Show 3 lines of context
```

## 3. zoxide (Smart cd)

Remembers your frequently visited directories, `z proj` jumps to your project directory.

```bash
sudo apt install zoxide
eval "$(zoxide init zsh)"
```

**Common examples**:
```bash
z projects                   # Jump to frequently visited projects
z proj                       # Fuzzy match works too
zi projects                  # Interactive selection with fzf
```

## 4. eza (File Listing)

Modern `ls` replacement with icons, Git status, colors, tree view.

```bash
sudo apt install eza
alias ls='eza --icons --git'
alias ll='eza -l --icons --git'
```

**Common examples**:
```bash
eza                          # Normal list with icons
eza -l                       # Long format
eza -la                      # Show hidden files
eza --tree                   # Tree view
eza --git                    # Show Git status
```

## 5. bat (File Viewing)

`cat` + syntax highlighting + Git integration + paging.

```bash
sudo apt install bat
alias cat='bat'
```

**Common examples**:
```bash
bat main.go                  # View with syntax highlighting
bat -n main.go               # Show line numbers only
bat header.md content.md     # Concatenate multiple files
```

## 6. fd-find (File Finding)

Faster, simpler, supports .gitignore.

```bash
sudo apt install fd-find
```

**Common examples**:
```bash
fd main.go                   # Find file
fd -e go                     # Find only .go files
fd -t d projects             # Find directories only
fd "test" --changed-within 7d # Files modified in last 7 days
```

## 7. btop (System Monitoring)

Prettier resource monitoring (CPU, memory, disk, network), theme support.

```bash
sudo apt install btop
```

**Controls**: Arrow keys/mouse to switch panels, k to kill process, q to quit.

## 8. gdu (Disk Space Analysis)

Written in Go, faster than ncdu (especially on SSD), interactive TUI, mouse support, prettier colors, can delete files directly.

```bash
sudo apt install gdu
gdu /home/asus
```

**Controls**: ↑↓ to move, Enter to enter directory, ← to go back, d to delete, q to quit.

## 9. dua-cli (Disk Space Analysis)

Written in Rust ([byron/dua-cli](https://github.com/byron/dua-cli)), a modern `du` replacement. It has both an interactive TUI (`dua i`) and a parallel aggregate mode suited to pipelines/scripts (`dua -A` prints the total). Faster than ncdu on folders with many small files, and **measurably faster than gdu in my own tests**; it also deduplicates hard links.

```bash
cargo install dua-cli

dua i                        # Interactive analysis of current dir
dua i /home/asus             # Analyze a specific directory
dua -A                       # Parallel aggregate, print total only
dua aggregate -t 8           # Set thread count
```

**Controls**: ↑↓ to move, →/Enter to enter directory, ← to go back, d to delete, q to quit.

## The Ultimate Combo: fzf + fd + rg + bat

These four tools together are unstoppable: fuzzy finding + fast search + beautiful preview.

```bash
# Use fzf to fuzzy search files, then preview with bat
fzf --preview 'bat --style=numbers --color=always {}'
```

## One-Click Install Recommendation

```bash
sudo apt update
sudo apt install -y gdu eza bat fd-find ripgrep fzf zoxide btop
cargo install dua-cli
```

Then add to your `~/.zshrc`:

```zsh
# fzf
source <(fzf --zsh)

# zoxide
eval "$(zoxide init zsh)"

# Alias examples
alias ls='eza --icons --git'
alias ll='eza -l --icons --git'
alias cat='bat'
```

After installing these 9 tools, your terminal will be noticeably more modern and efficient!