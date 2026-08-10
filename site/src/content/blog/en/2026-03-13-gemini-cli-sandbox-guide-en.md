---
title: Gemini CLI Sandbox Overview
description: Protect your local dev environment with isolated execution
pubDatetime: 2026-03-13T00:00:00Z
modDatetime: 2026-03-13T00:00:00Z
draft: false
tags:
  - gemini-cli
  - sandbox
  - security
  - isolation
  - docker
  - seatbelt
lang: en
---

The Gemini CLI sandbox adds a layer of security by isolating potentially risky operations (such as shell commands and file changes) from your host system.

---

## Core features

- **Process isolation**: Prevents unauthorized access to system resources.
- **Filesystem limits**: Restricts file access to the project directory.
- **Reproducible environment**: Ensures consistent execution across machines.
- **Multiple backends**: Supports different isolation technologies depending on your OS.

---

## Supported isolation methods

| Method             | Platform         | Description                                                |
| ------------------ | ---------------- | ---------------------------------------------------------- |
| **macOS Seatbelt** | macOS            | Native macOS sandbox profile.                              |
| **Docker / Podman**| Linux/macOS/Win  | Container isolation using standard images.                 |
| **gVisor**         | Linux            | User-space kernel by Google for stronger container security.|
| **LXC / LXD**      | Linux            | Linux container daemons for system-level isolation.        |

---

## How to enable

Use a CLI flag or environment variable.

### Command line

```bash
gemini --sandbox docker run "npm install"
```

### Config file

Add to your config:

```yaml
sandbox:
  enabled: true
  provider: docker
  image: node:20-slim
```

---

## Benefits

1. **Stronger security**: Run untrusted code or scripts without risking the host.
2. **Clean environment**: Avoid polluting the global system with temporary deps.
3. **Audit trail**: Easier to monitor and log what runs in the sandbox.

Using the sandbox lets you keep security high while using Gemini CLI’s automation.
