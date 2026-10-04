---
title: "Pi + Camoufox MCP: giving your AI agent a real anti-detect browser"
description: "Install Camoufox on Linux and wire it into Pi Coding Agent over MCP, so the AI can drive an anti-detect browser: uv install, GeoIP, npx launcher, mcp.json, proxies, and cookie persistence"
pubDatetime: 2026-09-20T00:00:00Z
modDatetime: 2026-09-20T00:00:00Z
draft: false
tags:
  - AI
  - MCP
  - Browser Automation
  - Tutorial
lang: en
---

Ordinary web-scraping tools hit a wall on JavaScript-heavy sites: they often get an empty shell of HTML, or nothing resembling what the browser actually renders.

Camoufox actually runs the page in a real browser, then hands that browser capability to the AI agent over MCP. The whole chain is one line:

```text
Pi → MCP → Camoufox → the web
```

This is a record of an actual setup: installing Camoufox on Linux and connecting it to Pi Coding Agent.

## Why Camoufox + MCP

Camoufox ships a Python package whose `geoip` extra can derive geolocation, timezone, country, locale, and WebRTC IP from the proxy's exit IP. Upstream explicitly recommends installing `geoip` whenever you use a proxy.

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

## Requirements

You need:

- Python
- `uv`
- Node.js 22+
- Pi Coding Agent
- Camoufox
- `camoufox-mcp-server`

The published runtime of the Camoufox MCP Server requires Node.js 22 or higher.

```bash
node --version
uv --version
pi --version
```

## Installing Camoufox

Install it as a `uv tool`, with GeoIP support included:

```bash
uv tool install "camoufox[geoip]"
```

This form is wrong:

```bash
uv tool install "camoufox[geoip],camoufox[geoip]"
```

`uv` parses the whole string as a single package requirement, so it fails with:

```text
Expected one of `@`, `(`, `<`, `=`, `>`, `~`, `!`, `;`, found `,`
```

The official installation docs currently recommend:

```bash
pip install -U "camoufox[geoip]"
```

The `geoip` extra is optional, but heavily recommended if you use proxies.

## Downloading the browser

After installing the Python package you still need the browser itself:

```bash
python -m camoufox fetch
```

Then check:

```bash
camoufox version
camoufox list
```

Camoufox ships version-management commands: `sync`, `set`, `active`, `fetch`, `list`, `remove`, `path`, and `version`. `camoufox version` prints package versions, the active browser build, and GeoIP database status.

> That Python CLI is for driving the Camoufox Python API directly. If you go through MCP, the browser binary is fetched by `camoufox-mcp-server` itself: the first `browse` call on a fresh machine needs it once, and if a call reports it missing, run the server's own fetch script and retry.

## Why GeoIP matters

Say your proxy exits from a US IP. With GeoIP, Camoufox can match automatically:

```text
IP → country → lat/long → timezone → locale → language → WebRTC IP
```

The official GeoIP/Proxy docs state that with `geoip=True` Camoufox derives longitude, latitude, timezone, country and locale from the target IP, and spoofs the WebRTC IP.

This matters for anti-detect profiles, because the following is far more plausible than a self-contradicting environment:

```text
IP: United States
Timezone: United States
Locale: en-US
WebRTC: United States
```

## Installing the MCP server

The npm package is `camoufox-mcp-server`. No global install needed:

```bash
npx -y camoufox-mcp-server@latest
```

The project's default version pins fix the Camoufox/Playwright dependency set, and it ships doctor / fetch mechanisms for checking the browser environment.

## Wiring it into Pi

One easy mistake here: this setup uses Pi's MCP config file at `~/.pi/agent/mcp.json`.

Install the adapter first:

```bash
pi install npm:pi-mcp-adapter
```

Then create or edit:

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

Restart Pi afterwards. This is verified against Pi 1.0.0, which registers MCP servers directly in `~/.pi/agent/mcp.json`. (The adapter also reads the standard `.mcp.json` / `~/.config/mcp/mcp.json` locations.)

## What MCP actually gives you

The Camoufox MCP Server is not a search interface — it is full browser automation. It currently exposes 17 tools:

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

The key ones:

- **`browse`** — navigate to a URL and return page content.
- **`browse_snapshot`** — return visible text, an ARIA snapshot, and interactive elements.
- **`browse_sequence`** — run a bounded action list (`click`, `hover`, `fill`, `type`, `select`, `press`, `waitFor`, `scroll`, `evaluate`), up to 25 actions per call.
- **`browse_forms`** — identify form fields and submit controls.
- **`browse_links`** — extract navigable links.
- **`browse_screenshot`** / **`browse_console`** / **`browse_network_summary`** — screenshots, console diagnostics, failed-request summaries.
- **`browse_session_*`** — manage short-lived isolated browser sessions, with pause/resume support for challenge pages.

So the agent is no longer limited to "search → get text". It can open a page, observe it, find a button, click it, fill a field, scroll, and keep going. The official docs list login flows, multi-step forms, shopping carts and dashboards as exactly the cases the session tools are for.

## Proxies

The browsing tools accept proxy parameters:

```text
Pi → MCP → Camoufox → Proxy → Website
```

Supported parameters include:

```text
proxy
geoip
humanize
block_webrtc
locale
viewport
window
```

For example:

```json
{
  "proxy": "http://user:password@proxy.example.com:8080",
  "geoip": true,
  "humanize": true,
  "block_webrtc": true
}
```

Fill in the proxy format according to the protocol and authentication your provider gives you.

## Cookies and sessions

To keep a logged-in state on some site long-term, the point is not to log in again every time — it's a persistent browser profile:

```text
Profile
├── Fingerprint
├── Cookies
├── LocalStorage
├── IndexedDB
├── Cache
└── login state
```

**A cookie is very likely the credential itself.** So never commit real cookies to Git, put them in a public repo, send them to a public MCP server, expose them to the internet, or casually hand them to a third party.

Prefer this chain:

```text
Pi → local MCP → local Camoufox profile
```

over:

```text
Pi → public MCP → third-party server
```

## Cookie warm-up

Two different concepts.

**Cookie import** means loading existing cookies into a profile to restore a logged-in state.

**Cookie warm-up** means letting a fresh profile visit real sites so cookies, storage and cache accumulate, until the browser looks like it has been alive — some commercial anti-detect browsers ship a dedicated Cookie Robot for this.

The Camoufox MCP Server leans toward providing *browser control* rather than a ready-made Cookie Robot. Warm-up can be driven by the agent itself: visit a site → wait → scroll → open another page → keep browsing. But don't call plain cookie persistence automated warm-up.

## A real test

The test scenario was Google — a textbook JavaScript-rendered site where direct fetching fails — so the search fell back to the Exa search MCP to answer "what's in the news today". It returned the expected sources from the Google News front page:

```text
BBC 中文
新华网
新浪
Yahoo 新闻台湾
世界新闻网
```

In other words:

```text
traditional scraping → JS page → failure
```

versus:

```text
AI agent → Camoufox MCP → real browser → JavaScript page → page content
```

which is a fundamentally different way to work.

## The resulting workflow

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

The agent goes from "searching the web" to owning a real browser environment. "Open this site", "search for this product", "compare these three", "add to cart" all become browser operations.

For high-risk steps — payment, CAPTCHAs, 2FA — let the AI stop before the final confirmation and hand that step back to you.

## Quick reference

Camoufox:

```bash
uv tool install "camoufox[geoip]"
python -m camoufox fetch
camoufox version
```

MCP config (`~/.pi/agent/mcp.json`):

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

Start `pi`, then check that the Camoufox tools appear in the tool list.

## Summary

What this ends up being is Pi 1.0.0 + MCP + camoufox-mcp-server + Camoufox + GeoIP. The real value is combining **AI agent + a real browser + anti-detect + proxy + session**: the AI can no longer only "fetch web content", it can actually operate the page.

For the Chinese version of this article, see [Pi + Camoufox MCP：让 AI Agent 直接操作反检测浏览器](/blog/posts/zh/2026-09-20-pi-camoufox-mcp-setup).

### References

- [Camoufox installation](https://camoufox.com/python/installation/)
- [Camoufox GeoIP & proxy support](https://camoufox.com/python/geoip/)
- [camoufox-mcp-server](https://github.com/whit3rabbit/camoufox-mcp)
- [Configuration for AI assistants](https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/configuration.md)
- [Tool parameters](https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/tool-parameters.md)
- [Usage examples](https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/examples.md)
