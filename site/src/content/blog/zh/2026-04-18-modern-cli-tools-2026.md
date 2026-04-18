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

**快捷键**：Ctrl+R（历史）、Ctrl+T（文件）。

**高级用法**：
```bash
fzf --preview 'bat --style=numbers --color=always {}'
fd -e go | fzf
```

## 2. ripgrep（代码搜索）

超快代码搜索，自动忽略 .gitignore。

```bash
sudo apt install ripgrep
```

**常用示例**：
```bash
rg "TODO"                    # 搜索 TODO
rg -t go "func main"         # 只在 Go 文件中搜索
rg -l "error"                # 只显示包含匹配的文件名
rg -C 3 "panic"              # 显示匹配行前后 3 行上下文
```

## 3. zoxide（智能 cd）

记住你常去的目录，`z proj` 就能跳到项目目录。

```bash
sudo apt install zoxide
eval "$(zoxide init zsh)"
```

**常用示例**：
```bash
z projects                   # 跳转到经常去的 projects 目录
z proj                       # 模糊匹配也行
zi projects                  # 用 fzf 交互选择
```

## 4. eza（文件列表）

`ls` 的现代替代，带图标、Git 状态、颜色、树状显示。

```bash
sudo apt install eza
alias ls='eza --icons --git'
alias ll='eza -l --icons --git'
```

**常用示例**：
```bash
eza                          # 普通列表（带图标）
eza -l                       # 长格式
eza -la                      # 显示隐藏文件
eza --tree                   # 树状显示目录
eza --git                    # 显示 Git 状态
```

## 5. bat（文件查看）

`cat` + 语法高亮 + Git 集成 + 分页。

```bash
sudo apt install bat
alias cat='bat'
```

**常用示例**：
```bash
bat main.go                  # 带高亮查看文件
bat -n main.go               # 只显示行号
bat header.md content.md     # 合并多个文件
```

## 6. fd-find（文件查找）

更快、更简单，支持 .gitignore。

```bash
sudo apt install fd-find
```

**常用示例**：
```bash
fd main.go                   # 找文件
fd -e go                     # 只找 .go 文件
fd -t d projects             # 只找目录
fd "test" --changed-within 7d # 最近 7 天修改的文件
```

## 7. btop（系统监控）

更漂亮、资源监控（CPU、内存、磁盘、网络），支持主题。

```bash
sudo apt install btop
```

**界面操作**：箭头键/鼠标切换面板，k 杀死进程，q 退出。

## 8. gdu（磁盘空间分析）

Go 编写，比 ncdu 更快（尤其是 SSD），交互式 TUI，支持鼠标、颜色更漂亮、可直接删除。

```bash
sudo apt install gdu
gdu /home/asus
```

**界面操作**：↑↓ 移动，Enter 进入目录，← 返回上级，d 删除，q 退出。

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