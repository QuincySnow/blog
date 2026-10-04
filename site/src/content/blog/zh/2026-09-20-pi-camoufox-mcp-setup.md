---
title: "Pi + Camoufox MCP：让 AI Agent 直接操作反检测浏览器"
description: "在 Linux 上安装 Camoufox，通过 MCP 接入 Pi Coding Agent，让 AI 直接控制反检测浏览器：uv 安装、GeoIP、npx 启动、mcp.json 配置、Proxy 与 Cookie 持久化"
pubDatetime: 2026-09-20T00:00:00Z
modDatetime: 2026-09-20T00:00:00Z
draft: false
tags:
  - AI
  - MCP
  - 浏览器自动化
  - 教程
lang: zh
---

普通网页抓取工具遇到 JavaScript 重度渲染的网站时，经常只能拿到空壳 HTML，甚至完全得不到浏览器实际看到的内容。

Camoufox 是真正运行浏览器页面，再通过 MCP 把这份浏览器能力交给 AI Agent。最终架构只有一条链路：

```text
Pi → MCP → Camoufox → 网页
```

本文记录一次实际配置：在 Linux 上安装 Camoufox，并接入 Pi Coding Agent。

## 为什么是 Camoufox + MCP

Camoufox 官方提供 Python 包，`geoip` extra 可以根据代理出口 IP 自动处理地理位置、时区、国家、locale 和 WebRTC IP。官方也明确建议在使用代理时安装 `geoip`。

```text
┌──────────────┐
│ Pi Coding    │
│ Agent        │
└──────┬───────┘
       │ MCP
       ▼
┌────────────────────┐
│ camoufox-mcp-server│
└─────────┬──────────┘
          ▼
┌────────────────────┐
│      Camoufox      │
│ Firefox-based      │
│ anti-detect browser│
└─────────┬──────────┘
          ▼
       Websites
```

## 环境

需要：

- Python
- `uv`
- Node.js 22+
- Pi Coding Agent
- Camoufox
- `camoufox-mcp-server`

当前 Camoufox MCP Server 的发布运行时要求 Node.js 22+。

```bash
node --version
uv --version
pi --version
```

## 安装 Camoufox

用 `uv tool` 安装，并同时带上 GeoIP 支持：

```bash
uv tool install "camoufox[geoip]"
```

`[gui]` 是另一个官方 extra（装 PySide6，提供 `camoufox gui` 这个 Qt 管理器）。需要的话可以和 geoip 一起写，extras 之间的逗号是 PEP 508 合法分隔符：

```bash
uv tool install "camoufox[geoip,gui]"
```

真正会报错的是**用逗号分隔两个 requirement**：

```bash
uv tool install "camoufox[geoip],camoufox[geoip]"
```

`uv` 会把整个字符串当成一个 package requirement 解析，于是报：

```text
Expected one of `@`, `(`, `<`, `=`, `>`, `~`, `!`, `;`, found `,`
```

区别只在于逗号出现的位置：在方括号**里面**是列 extra，在方括号**外面**是列多个包。

Camoufox 官方安装文档目前同样推荐：

```bash
pip install -U "camoufox[geoip]"
```

`geoip` 是可选组件，但在使用 Proxy 时官方强烈推荐安装。

## 下载浏览器

安装 Python 包之后，还需要下载实际的浏览器：

```bash
python -m camoufox fetch
```

检查安装：

```bash
camoufox version
camoufox list
```

Camoufox 官方提供了 `sync`、`set`、`active`、`fetch`、`list`、`remove`、`path`、`version` 等版本管理命令，`camoufox version` 会打印包版本、浏览器版本和 GeoIP 数据库状态。

> 这套 Python CLI 是给直接用 Camoufox Python API 的场景准备的。走 MCP 这条路时，浏览器二进制由 `camoufox-mcp-server` 自行获取：第一次调用 `browse` 时如果提示缺少浏览器，按报错提示执行其自带的 fetch 脚本后重试即可。

## 为什么装 GeoIP

假设走代理，出口 IP 在美国。Camoufox 结合 GeoIP 可以自动匹配：

```text
IP → 国家 → 经纬度 → 时区 → Locale → 语言 → WebRTC IP
```

官方 GeoIP/Proxy 文档明确说明，启用 `geoip=True` 后会依据目标 IP 处理 longitude、latitude、timezone、country、locale，并 spoof WebRTC IP。

这对反检测 Profile 很重要，因为下面这组环境比明显互相矛盾的环境合理得多：

```text
IP：美国
Timezone：美国
Locale：en-US
WebRTC：美国
```

## 安装 Camoufox MCP

npm 包名是 `camoufox-mcp-server`。不必全局安装，直接用 `npx` 拉起：

```bash
npx -y camoufox-mcp-server@latest
```

官方仓库目前的默认版本组合会固定 Camoufox/Playwright 相关依赖，并提供 doctor / fetch 等机制来检查浏览器环境。

## 接入 Pi

先说一个容易踩的坑：**现在 Pi 原生支持 MCP，不需要再装 `pi-mcp-adapter`。** Camoufox MCP Server 的 README 里还写着

```bash
pi install npm:pi-mcp-adapter
```

那是 Pi 内置 MCP 支持之前的写法，现在属于多余步骤。

最省事的是用 Pi 自带的命令直接注册（默认写入用户级 `~/.pi/agent/mcp.json`）：

```bash
pi mcp add camoufox -- npx -y camoufox-mcp-server@latest
pi mcp list
```

加 `--local`（或 `-l`）则写到项目级 `.pi/mcp.json`：

```bash
pi mcp add -l camoufox -- npx -y camoufox-mcp-server@latest
```

也可以手写配置文件：

```bash
nano ~/.pi/agent/mcp.json
```

```json
{
  "mcpServers": {
    "camoufox": {
      "command": "npx",
      "args": [
        "-y",
        "camoufox-mcp-server@latest"
      ]
    }
  }
}
```

Pi 的 MCP 配置分两级：用户级 `~/.pi/agent/mcp.json`，项目级 `.pi/mcp.json`（需信任项目后才生效）；同名条目以项目级为准。配置格式与其他 MCP 客户端一致。

启动 `pi` 后，在会话里用 `/mcp` 可以查看已配置的 server 及其状态、工具数量和配置来源。如果是在会话外改的配置，记得执行 `/reload` 重新加载。

工具在 Pi 里的名字是 `mcp__<server>__<tool>`，也就是 `mcp__camoufox__browse` 这种形式。

## MCP 提供了什么

Camoufox MCP Server 不是简单的网页搜索接口，而是完整的浏览器自动化能力。目前共 17 个工具：

```text
camoufox_status
browse
browse_snapshot
browse_sequence
browse_screenshot
browse_console
browse_network_summary
browse_links
browse_forms
browse_outline
browse_find
browse_session_start
browse_session_navigate
browse_session_action
browse_session_snapshot
browse_session_resume
browse_session_close
```

其中几个关键的：

- **`browse`**：访问网页并返回页面内容。
- **`browse_snapshot`**：返回可见文本、ARIA snapshot 和交互元素。
- **`browse_sequence`**：执行一系列动作（`click`、`hover`、`fill`、`type`、`select`、`press`、`waitFor`、`scroll`），一次最多 25 个。
- **`browse_forms`**：识别表单字段和提交控件。
- **`browse_links`**：提取可导航链接。
- **`browse_screenshot`** / **`browse_console`** / **`browse_network_summary`**：截图、控制台诊断、失败请求摘要。
- **`browse_session_*`**：管理短生命周期的隔离浏览器会话，支持验证码挑战的暂停/恢复。

所以 AI 不再只是「搜索 → 获取文本」，而是可以打开网页、观察页面、找到按钮、点击、填写输入框、滚动、继续操作。官方文档也把登录流程、多步骤表单、购物车、Dashboard 列为应当使用 Session 工具的场景。

## Proxy

Camoufox MCP 的浏览工具支持 Proxy 参数：

```text
Pi → MCP → Camoufox → Proxy → Website
```

支持的参数包括：

```text
proxy
geoip
humanize
block_webrtc
locale
viewport
window
```

例如：

```json
{
  "proxy": "http://user:password@proxy.example.com:8080",
  "geoip": true,
  "humanize": true,
  "block_webrtc": true
}
```

具体代理格式按代理服务商提供的协议和认证方式填写。

## Cookie 与 Session

想长期保持某个网站的登录状态，核心不是每次重新登录，而是持久化的浏览器 Profile：

```text
Profile
├── Fingerprint
├── Cookies
├── LocalStorage
├── IndexedDB
├── Cache
└── 登录状态
```

**Cookie 很可能就是登录凭证。** 因此不要把真实 Cookie 提交到 Git、放进公开仓库、发到公共 MCP Server、暴露公网，或随意复制给第三方。

推荐链路：

```text
Pi → 本机 MCP → 本机 Camoufox Profile
```

而不是：

```text
Pi → 公网 MCP → 第三方服务器
```

## Cookie Warm-up

两个概念要分清。

**Cookie 导入**是把已有 Cookie 导入 Profile 以恢复登录状态。

**Cookie Warm-up** 是新 Profile 访问真实网站，逐渐产生 Cookie / Storage / Cache，形成浏览器活动状态——一些商业反检测浏览器提供独立的 Cookie Robot。

Camoufox MCP 目前偏向提供**浏览器控制能力**，而不是现成的 Cookie Robot。Warm-up 可以由 Agent 自己驱动完成：访问指定站点 → 等待 → 滚动 → 打开其他页面 → 继续浏览。但不要把普通的 Cookie 持久化误称为自动 Warm-up。

## 实际测试

测试场景是 Google 网页版——典型的 JavaScript 渲染页面，直接抓取失败，于是改用 Exa 搜索 MCP 获取「今天有什么新闻」。结果能正常拿到 Google News 首页的相关来源：

```text
BBC 中文
新华网
新浪
Yahoo 新闻台湾
世界新闻网
```

也就是说：

```text
传统抓取 → JS 页面 → 失败
```

而：

```text
AI Agent → Camoufox MCP → 真实浏览器 → JavaScript 页面 → 页面内容
```

是另一套工作方式。

## 最终工作流

```text
                         ┌──────────────┐
                         │     Pi       │
                         │  AI Agent    │
                         └──────┬───────┘
                                │
                               MCP
                                │
                                ▼
                    ┌────────────────────┐
                    │ camoufox-mcp-server│
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │      Camoufox      │
                    │  Anti-detect Web   │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
           Proxy           Cookie          GeoIP
              └───────────────┼───────────────┘
                              ▼
                           Website
```

AI Agent 从「搜索网页」升级为拥有一个真正的浏览器操作环境：「打开这个网站」「搜索某个商品」「比较三个商品」「加入购物车」都能变成浏览器操作。

涉及支付、验证码、2FA 等高风险操作时，建议让 AI 在最终确认阶段停下来，由用户本人完成确认。

## 配置速查

Camoufox：

```bash
uv tool install "camoufox[geoip]"
# 需要 Qt 管理器时
uv tool install "camoufox[geoip,gui]"
python -m camoufox fetch
camoufox version
```

注册：

```bash
pi mcp add camoufox -- npx -y camoufox-mcp-server@latest
```

MCP 配置（`~/.pi/agent/mcp.json`）：

```json
{
  "mcpServers": {
    "camoufox": {
      "command": "npx",
      "args": [
        "-y",
        "camoufox-mcp-server@latest"
      ]
    }
  }
}
```

启动 `pi`，然后用 `/mcp` 确认 Camoufox 已连接、工具已加载。

## 总结

最终搭起来的是 Pi 1.0.0 + MCP + camoufox-mcp-server + Camoufox + GeoIP。核心价值是把 **AI Agent + 真正的浏览器 + Anti-detect + Proxy + Session** 组合起来：AI 不再只能「获取网页内容」，而是可以真正操作网页。

### 参考资料

- [Camoufox 安装文档](https://camoufox.com/python/installation/)
- [Camoufox GeoIP / Proxy](https://camoufox.com/python/geoip/)
- [Camoufox MCP Server](https://github.com/whit3rabbit/camoufox-mcp)
- [Camoufox MCP 配置](https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/configuration.md)
- [Camoufox MCP 工具参数](https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/tool-parameters.md)
- [Camoufox MCP 使用示例](https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/examples.md)
