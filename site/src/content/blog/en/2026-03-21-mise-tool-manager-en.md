---
title: "From fnm/Node & Manual Go to mise: Unified Management for uv, Bun, Rust, Node.js, Go"
description: Tired of nvm/fnm/rustup/go managing versions separately? Use mise (formerly rtx) to install, switch, and update all tools with one command, plus automatic per-project version switching.
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
lang: en
---

# From fnm/Node & Manual Go to mise: Unified Management for uv, Bun, Rust, Node.js, Go

Still using nvm/fnm for Node, rustup for Rust, manual tar extraction for Go, and curl for uv/Bun in 2026?

Each tool has its own version management, PATH handling, and update process. Switching between projects is a hassle, and upgrading means running commands one by one. **mise** (formerly rtx, written in Rust) is the most powerful cross-language version manager, capable of managing Node, Bun, Rust, Go, uv (even Deno, Python, Terraform, etc.), with fast performance, clean shims, and flexible global/project-level configuration.

## My Actual Versions (March 21, 2026)

After cleaning up old tools, install everything with one command `mise use --global ...@latest`:

- **Node.js**: v25.8.1 (Current channel latest, LTS is v24.14.0)
- **Bun**: 1.3.11 (latest)
- **uv**: 0.10.12 (via aqua backend)
- **Rust**: 1.94.0 (stable, released 2026-03-02)
- **Go**: 1.26.1 (latest patch)

These versions are queried in real-time from official sources. Using `@latest` pulls Current; for LTS use `node@lts` or `node@24`.

## Why Choose mise Over asdf / proto / Manual Scripts?

| Tool       | One-command upgrade all? | Supports uv/Bun/Rust/Node/Go? | Unified config? | Speed / Community |
|------------|--------------------------|--------------------------------|------------------|-------------------|
| **mise**   | Yes (`mise upgrade --bump`) | Native + aqua full coverage   | Yes (.mise.toml) | ★★★★★            |
| asdf       | Partial (multi-step)     | Via plugins                   | Yes (.tool-versions) | ★★★☆☆       |
| proto      | Partial                  | Less mature                   | Yes              | ★★★☆☆           |
| Manual     | Custom                   | Depends on you               | No               | ★★☆☆☆           |

mise wins: written in Rust for speed, real shims (not symlinks), built-in core backends, aqua registry for new tools like uv, and task running (like Makefile).

## Step 1: Clean Up Old Tools Completely (Avoid Conflicts)

**Warning**: Back up important global packages (like `~/.cargo/bin` tools, global `node_modules`, etc.) before proceeding.

### 1. Uninstall fnm + Node

```bash
rm -rf ~/.fnm ~/.local/share/fnm
# Edit ~/.zshrc / ~/.bashrc, remove fnm lines (e.g., eval "$(fnm env --use-on-cd)")
# Remove residual binaries
rm -f ~/.local/bin/node ~/.local/bin/npm ~/.local/bin/npx /usr/local/bin/node*
```

### 2. Uninstall rustup

```bash
rustup self uninstall
```

### 3. Uninstall Manually Installed Go

```bash
# Find and remove Go installation directory
rm -rf /usr/local/go ~/.go
# Edit PATH, remove /usr/local/go/bin
```

### 4. Uninstall curl-installed uv/Bun

```bash
rm -f ~/.local/bin/uv ~/.local/bin/bun ~/.cargo/bin/uv ~/.cargo/bin/bun
```

## Step 2: Install mise

### macOS / Linux One-liner

```bash
# Universal (auto-detects shell)
curl https://mise.run | sh
```

The universal install puts mise at `~/.local/bin/mise`, then manually add activation:

```bash
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
source ~/.zshrc
```

```bash
# Or choose by shell (auto-configures activation)
zsh curl https://mise.run/zsh | sh
bash curl https://mise.run/bash | sh
fish curl https://mise.run/fish | sh

# Or via Homebrew
brew install mise
```

When using shell-specific commands, the installer automatically adds activation to the corresponding config:

- **zsh** → `~/.zshrc`
- **bash** → `~/.bashrc`
- **fish** → `~/.config/fish/config.fish`

### Verify Installation

```bash
mise doctor
```

## Step 3: Configure Global Tools (@latest)

Create or edit `~/.config/mise/config.toml`:

```toml
[tools]
node = "latest"
bun = "latest"
uv = "latest"
rust = "latest"
go = "latest"
```

Or one-liner:

```bash
mise use --global node@latest bun@latest uv@latest rust@latest go@latest
```

## Step 4: Project-level Auto-switching (.mise.toml)

Place `.mise.toml` in your project root:

```toml
[tools]
node = "20"
python = "3.12"
```

Now entering the project directory automatically switches versions; leaving reverts to global.

## Quick Command Reference

```bash
mise list              # List installed tools and versions
mise upgrade           # Upgrade all tools to latest
mise upgrade --bump    # Upgrade all and update version numbers in config
mise run <task>        # Run Task defined in .mise.toml
mise settings          # View/modify mise settings
mise doctor            # Check mise status and potential issues
```

## mise Backends: core vs aqua

- **core**: Built-in support for Node.js, Rust, Go, Python, Ruby, Deno, and more.
- **aqua**: Via aqua-installer plugin, supports uv, Bun, Buf, Cargo, and other emerging tools.

For tools not in core, use aqua:

```bash
mise use --global uv@latest   # Default uses core
# Or force aqua
MISE_AQUA_VERSION_RESOLVER=latest mise use -g uv@latest
```

## FAQ

### Q: What are shims? Why better than symlinks?

A: mise places shims (stubs) ahead in `$PATH` that directly invoke real executables, keeping `$HOME` clean (no `.node-version` etc.). asdf uses symlinks which can cause conflicts.

### Q: Works with direnv?

A: Perfect combo. `.mise.toml` triggers direnv automatically; use `mise direnv` to generate `.envrc`:

```bash
mise direnv export bash >> ~/.config/direnv/direnvrc
```

### Q: How fast?

A: Written in Rust, switches instantly. Actual test: `mise use node@20` takes ~0.5s (including download and extraction).

## Summary

With mise:

- ✅ One command to upgrade all tools
- ✅ One config file for global + project-level versions
- ✅ Clean PATH after removing old tools
- ✅ Blazing fast, reliable shims
- ✅ Supports emerging tools like uv and Bun

Migrating from fnm/rustup/manual scripts to mise is one of the fastest DevOps efficiency gains in 2026.

---

**Related Reading**:

- [Chinese version](2026-03-21-mise-tool-manager)
- [Migrate to uv: Replace pip/conda for Python Environment Management](2026-02-12-migrate-to-uv-en)
- [fish shell + Mise = Smoother Version Switching Experience](2026-03-01-zsh-en)
