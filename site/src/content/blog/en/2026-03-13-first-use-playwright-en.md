---
title: First-time Playwright MCP Setup Guide
description: Configure Playwright MCP in your AI coding assistant for browser automation
pubDatetime: 2026-03-13T00:00:00Z
modDatetime: 2026-03-13T00:00:00Z
draft: false
tags:
  - playwright
  - mcp
  - browser-automation
  - tutorial
lang: en
---

Playwright MCP is a Model Context Protocol server by Microsoft that provides browser automation. Using MCP, you can automate the browser from various AI coding assistants without writing test code.

---

## Requirements

- **Node.js**: 18.0.0 or higher
- **OS**: Windows 10+ / macOS 10.14+ / Linux (Ubuntu 18.04+)

```bash
node --version
npm --version
```

---

## Install Playwright browsers

Two steps to get started:

```bash
# 1. Install system dependencies (required on Linux/macOS)
npx playwright install-deps

# 2. Install browsers
npx playwright install
```

---

## Client configuration

### Generic config

Most clients use this standard config:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### IDE-specific setup

#### VS Code

Install via button:

- [Install in VS Code](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522playwright%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522%2540playwright%252Fmcp%2540latest%2522%255D%257D)

Or manually: VS Code Settings → search "MCP" → add server

#### Cursor

Install via button:

- [Install in Cursor](https://cursor.com/en/install-mcp?name=Playwright&config=eyJjb21tYW5kIjoibnB4IEBwbGF5d3JpZ2h0L21jcEBsYXRlc3QifQ%3D%3D)

Or manually: Cursor Settings → MCP → Add new MCP Server

#### Windsurf

See [Windsurf MCP docs](https://docs.windsurf.com/windsurf/cascade/mcp) and use the standard config.

#### Claude Desktop

Follow the [MCP setup guide](https://modelcontextprotocol.io/quickstart/user) and use the standard config.

#### opencode

In `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

#### Claude Code

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

#### Cline

Add to `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "timeout": 30,
      "args": ["-y", "@playwright/mcp@latest"],
      "disabled": false
    }
  }
}
```

---

## Common parameters

| Parameter         | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `--browser`       | Browser: chrome, firefox, webkit, msedge              |
| `--headless`      | Run in headless mode                                  |
| `--viewport-size`| Viewport size, e.g. "1280x720"                        |
| `--device`        | Emulate device, e.g. "iPhone 15"                      |
| `--caps`          | Enable: vision, pdf, devtools                         |
| `--user-data-dir` | User data dir (persistent profile)                    |
| `--isolated`      | Isolated mode (separate session each time)            |
| `--allowed-origins` | Allowed request origins                             |
| `--blocked-origins` | Blocked request origins                             |

---

## Run with Docker

```json
{
  "mcpServers": {
    "playwright": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "--pull=always",
        "mcr.microsoft.com/playwright/mcp"
      ]
    }
  }
}
```

---

## MCP tools

Once configured, the AI assistant can use these browser tools:

- `browser_navigate` - Navigate to URL
- `browser_snapshot` - Get page snapshot (accessibility tree)
- `browser_click` - Click element
- `browser_type` - Type text
- `browser_hover` - Hover
- `browser_select_option` - Select dropdown option
- `browser_fill_form` - Fill form
- `browser_take_screenshot` - Screenshot
- `browser_console_messages` - Get console messages
- `browser_network_requests` - Get network requests
- `browser_tabs` - Manage tabs
- `browser_evaluate` - Run JavaScript

---

## Example: persistent user data

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--user-data-dir",
        "/path/to/persistent/profile"
      ]
    }
  }
}
```

This keeps login state so you don’t have to sign in every time.

---

## FAQ

### Browser download fails

If network issues prevent browser download, use a mirror:

```bash
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright
npx playwright install
```

### Permissions (Linux)

```bash
npx playwright install-deps chromium
```

Enjoy browser automation.
