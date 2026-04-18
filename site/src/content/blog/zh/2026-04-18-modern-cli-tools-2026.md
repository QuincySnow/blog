---
title: 2026 年必装的现代 CLI 工具：从 ncdu 到 gdu，从 ls 到 eza
description: 推荐一批 2026 年现代 CLI 工具，覆盖磁盘分析、文件浏览、搜索、系统监控等场景。这些工具都轻量、快速、美观，让终端从「可用」变成「享受」。
pubDatetime: 2026-04-18T00:00:00Z
modDatetime: 2026-04-18T00:00:00Z
draft: false
tags:
  - CLI
  - Tooling
  - Linux
  - Terminal
  - fzf
  - eza
  - bat
lang: zh
---

# 2026 年必装的现代 CLI 工具：从 ncdu 到 gdu，从 ls 到 eza

如果你还在用 `ncdu`、`ls`、`cat`、`find`、`grep`、`top`，是时候升级了。2026 年的 CLI 工具生态空前繁荣，大量 Rust/Go 编写的现代工具横空出世——更快、更漂亮、更易用。

**最推荐安装的 8 个核心工具**：**fzf**、**ripgrep**、**zoxide**、**eza**、**bat**、**fd-find**、**btop**、**gdu**。这八个工具覆盖日常开发的高频场景，装好后效率立竿见影。

## 1. fzf（模糊查找，必装！）

模糊查找一切（历史命令、文件、进程等）。

```bash
sudo apt install fzf
source <(fzf --zsh)
```

快捷键：Ctrl+R（历史）、Ctrl+T（文件）。

## 2. ripgrep（代码搜索）

超快代码搜索，自动忽略 .gitignore。

```bash
sudo apt install ripgrep
```

## 3. zoxide（智能 cd）

记住你常去的目录，`z proj` 就能跳到项目目录。

```bash
sudo apt install zoxide
eval "$(zoxide init zsh)"
```

## 4. eza（文件列表）

`ls` 的现代替代，带图标、Git 状态、颜色、树状显示。

```bash
sudo apt install eza
alias ls='eza --icons --git'
alias ll='eza -l --icons --git'
```

## 5. bat（文件查看）

`cat` + 语法高亮 + Git 集成 + 分页。

```bash
sudo apt install bat
alias cat='bat'
```

## 6. fd-find（文件查找）

更快、更简单，支持 .gitignore。

```bash
sudo apt install fd-find
```

## 7. btop（系统监控）

更漂亮、资源监控（CPU、内存、磁盘、网络），支持主题。

```bash
sudo apt install btop
```

## 8. gdu（磁盘空间分析）

Go 编写，比 ncdu 更快（尤其是 SSD），交互式 TUI，支持鼠标、颜色更漂亮、可直接删除。

```bash
sudo apt install gdu
gdu /home/asus
```

## fzf + fd + rg + bat 组合的无敌用法

这四个工具组合在一起堪称无敌：fuzzy 模糊查找 + 快速搜索 + 美观预览。

```bash
# 用 fzf 模糊搜索文件，然后用 bat 预览
fzf --preview 'bat --style=numbers --color=always {}'
```

## 一键安装推荐

```bash
sudo apt update
sudo apt install -y gdu eza bat fd-find ripgrep fzf zoxide btop
```

然后在 `~/.zshrc` 添加常用配置：

```zsh
# fzf
source <(fzf --zsh)

# zoxide
eval "$(zoxide init zsh)"

# 别名示例
alias ls='eza --icons --git'
alias ll='eza -l --icons --git'
alias cat='bat'
```

这 8 个工具装好后，你的终端会明显更现代、更高效！