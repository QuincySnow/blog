---
title: 从 fnm/Node、手动 Go 到 mise：一键统一管理 uv、Bun、Rust、Node.js、Go 等开发工具
description: 厌倦了 nvm/fnm/rustup/go 各自为政？用 mise (前 rtx) 一键安装/切换/更新所有工具，项目自动切版本。亲测清理旧工具 + 全局 latest 配置全过程。
pubDatetime: 2026-03-21T00:00:00Z
modDatetime: 2026-03-21T00:00:00Z
draft: false
tags:
  - DevOps
  - Tooling
  - Rust
  - Node.js
  - Go
  - mise
  - uv
  - Bun
lang: zh
---

# 从 fnm/Node、手动 Go 到 mise：一键统一管理 uv、Bun、Rust、Node.js、Go 等开发工具

2026 年了，还在用 nvm/fnm 管 Node、rustup 管 Rust、手动 tar 解压 Go、二进制 curl 装 uv/Bun 吗？

这些工具各自维护版本、PATH、更新方式，项目间切换麻烦，升级还得一个个命令敲。**mise**（前身 rtx，Rust 编写）是目前最强的跨语言版本管理器，能统一管理 Node、Bun、Rust、Go、uv（甚至 Deno、Python、Terraform 等），速度快、shims 干净、项目级/全局配置随意。

## 我的实际版本（2026 年 3 月 21 日）

在清理完旧工具后，用 `mise use --global ...@latest` 一键安装：

- **Node.js**：v25.8.1（Current 通道 latest，LTS 是 v24.14.0）
- **Bun**：1.3.11（当前最新）
- **uv**：0.10.12（aqua backend 拉取最新）
- **Rust**：1.94.0 (stable，2026-03-02 发布)
- **Go**：1.26.1（最新 patch）

这些版本是 mise 根据官方源实时查询的最新稳定版。Node 用 `@latest` 拉 Current，如果你想要 LTS 改成 `node@lts` 或 `node@24`。

## 为什么选择 mise 而不是 asdf / proto / 手动脚本？

| 工具       | 一键升级所有？          | 支持 uv/Bun/Rust/Node/Go？ | 配置文件统一？ | 速度 / 社区活跃度 |
|------------|--------------------------|-----------------------------|------------------|-------------------|
| **mise**   | 是（`mise upgrade --bump`） | 原生/内置 + aqua 全覆盖    | 是（.mise.toml） | ★★★★★            |
| asdf       | 半（多步）               | 靠插件                     | 是（.tool-versions） | ★★★☆☆           |
| proto      | 部分                     | 成熟度稍低                 | 是               | ★★★☆☆           |
| 手动脚本   | 自定义                   | 看你写                     | 无               | ★★☆☆☆           |

mise 胜在：Rust 写得快、shims 真实路径（非软链）、内置 core backends 多、aqua registry 支持 uv 等新兴工具、还能跑任务（类似 Makefile）。

## 第一步：彻底清理旧工具（避免冲突）

**警告**：操作前备份重要全局包（如 `~/.cargo/bin` 工具、`node_modules` 全局等）。

### 1. 卸载 fnm + Node

```bash
rm -rf ~/.fnm ~/.local/share/fnm
# 编辑 ~/.zshrc / ~/.bashrc，删除 fnm 相关行（如 eval "$(fnm env --use-on-cd)"）
# 手动删残留二进制
rm -f ~/.local/bin/node ~/.local/bin/npm ~/.local/bin/npx /usr/local/bin/node*
```

### 2. 卸载 rustup

```bash
rustup self uninstall
```

### 3. 卸载手动安装的 Go

```bash
# 找到并删除 Go 安装目录
rm -rf /usr/local/go ~/.go
# 编辑 PATH，删除 /usr/local/go/bin
```

### 4. 卸载 curl 安装的 uv/Bun

```bash
rm -f ~/.local/bin/uv ~/.local/bin/bun ~/.cargo/bin/uv ~/.cargo/bin/bun
```

## 第二步：安装 mise

### macOS / Linux 一键安装

```bash
# 通用安装（自动检测 shell）
curl https://mise.run | sh
```

通用安装会将 mise 安装到 `~/.local/bin/mise`，然后手动添加激活命令：

```bash
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc
```

```bash
# 或按 shell 选择对应命令（自动配置激活）
zsh curl https://mise.run/zsh | sh
bash curl https://mise.run/bash | sh
fish curl https://mise.run/fish | sh

# 或使用 Homebrew
brew install mise
```

按 shell 选择对应命令时，安装脚本会自动将激活命令添加到对应配置文件：

- **zsh** → 自动添加到 `~/.zshrc`
- **bash** → 自动添加到 `~/.bashrc`
- **fish** → 自动添加到 `~/.config/fish/config.fish`

### 验证安装

```bash
mise doctor
```

## 第三步：配置全局工具（@latest）

创建或编辑 `~/.config/mise/config.toml`：

```toml
[tools]
node = "latest"
bun = "latest"
uv = "latest"
rust = "latest"
go = "latest"
```

或者一行命令搞定：

```bash
mise use --global node@latest bun@latest uv@latest rust@latest go@latest
```

## 第四步：项目级自动切换（.mise.toml）

在项目根目录放 `.mise.toml`：

```toml
[tools]
node = "20"
python = "3.12"
```

这样进入项目目录自动切换版本，出了目录自动切回全局。

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `mise ls` | 查看已安装工具及版本 |
| `mise upgrade` | 升级所有工具到最新 |
| `mise upgrade --bump` | 升级所有工具并更新配置文件中的版本号 |
| `mise use -g <tool>@<version>` | 全局安装/切换工具（如 `mise use -g node@latest`） |
| `mise use <tool>` | 读取当前目录 .mise.toml，联网搜索并安装对应版本 |
| `mise uninstall --all <tool> && mise unuse -g <tool>` | 卸载指定工具（全局） |
| `mise unuse <tool>` | 从当前目录 .mise.toml 移除并卸载指定工具 |
| `mise run <task>` | 运行 .mise.toml 中定义的 Task |
| `mise settings` | 查看/修改 mise 配置 |
| `mise doctor` | 检查 mise 状态和潜在问题 |

## mise 的 backends：core vs aqua

- **core**：mise 内置支持 Node.js、Rust、Go、Python、Ruby、Deno 等主流语言。
- **aqua**：通过 aqua-installer 插件，支持 uv、Bun、Buf、Cargo 等新兴工具。

如果某个工具在 core 里找不到，用 aqua：

```bash
mise use --global uv@latest   # 默认走 core
# 或强制 aqua
MISE_AQUA_VERSION_RESOLVER=latest mise use -g uv@latest
```

## 常见问题

### Q: shims 是什么？为什么比软链好？

A: mise 在 `$PATH` 前置真实可执行文件的 shims（桩），调用时直接走真实路径，不会污染 `$HOME` 下的 `.node-version` 等文件。asdf 用的是软链，有时会冲突。

### Q: 与 direnv 配合？

A: 完美配合。`.mise.toml` 会自动触发 direnv 切换，配合 `mise direnv` 生成 `.envrc`：

```bash
mise direnv export bash >> ~/.config/direnv/direnvrc
```

### Q: 速度如何？

A: Rust 编写，秒级切换。实际测试 `mise use node@20` 约 0.5s 搞定（包括下载解压）。

## 总结

使用 mise 后：

- ✅ 一个命令升级所有工具
- ✅ 一个配置文件管理全局 + 项目级版本
- ✅ 卸载旧工具，PATH 干净
- ✅ 速度极快，shims 可靠
- ✅ 支持 uv、Bun 等新兴工具

从 fnm/rustup/手动脚本迁移到 mise，是 2026 年 DevOps 效率提升的最快方式之一。

---

**相关阅读**：

- [用 uv 替代 pip/conda 管理 Python 环境](2026-02-12-migrate-to-uv)
- [fish shell + Mise = 更顺滑的版本切换体验](2026-03-01-zsh)
