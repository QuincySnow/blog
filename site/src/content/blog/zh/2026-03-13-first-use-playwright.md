---
title: 首次使用 Playwright MCP 完整指南
description: 在 AI 编程助手中配置 Playwright MCP，实现浏览器自动化
pubDatetime: 2026-03-13T00:00:00Z
modDatetime: 2026-03-13T00:00:00Z
draft: false
tags:
  - playwright
  - mcp
  - browser-automation
  - 教程
lang: zh
---

Playwright MCP 是 Microsoft 开发的 Model Context Protocol 服务器，提供浏览器自动化能力。使用 MCP 可以在各种 AI 编程助手中实现浏览器自动化，无需编写测试代码。

---

## 环境要求

- **Node.js**：18.0.0 或更高版本
- **操作系统**：Windows 10+ / macOS 10.14+ / Linux (Ubuntu 18.04+)

```bash
node --version
npm --version
```

---

## 安装 Playwright 浏览器

只需两步即可开始使用：

```bash
# 1. 安装系统依赖（Linux/macOS 必需）
npx playwright install-deps

# 2. 安装浏览器
npx playwright install
```

---

## 客户端配置

### 通用配置

大多数客户端使用以下标准配置：

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

### 主流 IDE 配置

#### VS Code

点击按钮安装：

- [Install in VS Code](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522playwright%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522%2540playwright%252Fmcp%2540latest%2522%255D%257D)

或手动配置：VS Code 设置 → 搜索 "MCP" → 添加服务器

#### Cursor

点击按钮安装：

- [Install in Cursor](https://cursor.com/en/install-mcp?name=Playwright&config=eyJjb21tYW5kIjoibnB4IEBwbGF5d3JpZ2h0L21jcEBsYXRlc3QifQ%3D%3D)

或手动配置：Cursor Settings → MCP → Add new MCP Server

#### Windsurf

参考 [Windsurf MCP 文档](https://docs.windsurf.com/windsurf/cascade/mcp)，使用标准配置

#### Claude Desktop

按照 [MCP 安装指南](https://modelcontextprotocol.io/quickstart/user)，使用标准配置

#### opencode

在 `~/.config/opencode/opencode.json` 中配置：

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

添加到 `cline_mcp_settings.json`：

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

## 常用参数

| 参数                | 说明                                        |
| ------------------- | ------------------------------------------- |
| `--browser`         | 浏览器类型：chrome, firefox, webkit, msedge |
| `--headless`        | 无头模式运行                                |
| `--viewport-size`   | 视口大小，如 "1280x720"                     |
| `--device`          | 模拟设备，如 "iPhone 15"                    |
| `--caps`            | 启用功能：vision, pdf, devtools             |
| `--user-data-dir`   | 用户数据目录（持久化配置）                  |
| `--isolated`        | 隔离模式（每次会话独立）                    |
| `--allowed-origins` | 允许的请求来源                              |
| `--blocked-origins` | 阻止的请求来源                              |

---

## 使用 Docker 运行

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

## MCP 提供的工具

配置完成后，AI 助手可以使用以下浏览器自动化工具：

- `browser_navigate` - 导航到 URL
- `browser_snapshot` - 获取页面快照（可访问性树）
- `browser_click` - 点击元素
- `browser_type` - 输入文本
- `browser_hover` - 悬停
- `browser_select_option` - 选择下拉选项
- `browser_fill_form` - 填写表单
- `browser_take_screenshot` - 截图
- `browser_console_messages` - 获取控制台消息
- `browser_network_requests` - 获取网络请求
- `browser_tabs` - 管理标签页
- `browser_evaluate` - 执行 JavaScript

---

## 配置示例：持久化用户数据

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

这样可以保持登录状态，无需每次重新登录。

---

## 常见问题

### 浏览器下载失败

如果网络问题导致浏览器下载失败，可以使用镜像：

```bash
export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright
npx playwright install
```

### 权限问题（Linux）

```bash
npx playwright install-deps chromium
```

祝你的浏览器自动化之旅愉快！🎭
