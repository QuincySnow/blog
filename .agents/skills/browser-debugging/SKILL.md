---
name: browser-debugging
description: Setup and use browser debugging for this project (Chrome CDP, MCP chrome-devtools, performance trace). Use when the user needs to run Lighthouse, performance tests, navigate or inspect pages from the agent, or when configuring Chrome remote debugging or MCP.
---

# 浏览器调试（本仓库）

需要**浏览器调试、性能测试或 MCP 连 Chrome** 时按本 Skill 操作：启动带 CDP 的 Chrome、配置 MCP、在 WSL/镜像网络下连通。

## 何时使用

- 用 **chrome-devtools-mcp** 做性能 trace、`list_pages`、`navigate_page`、Lighthouse（不含 Performance）等。
- 用 **cursor-ide-browser** 做页面快照、点击、填表、截图等自动化。
- 用户提到「连不上 9222」「404 /json/version」「Remote Target」「性能测试」「Lighthouse」时，按本 Skill 排查。

## 1. 启动 Chrome（Chrome 136+ 必须带 user-data-dir）

自 Chrome 136 起，**默认用户数据目录**下 CDP 的 `/json/version` 会返回 404，必须用 **`--user-data-dir`** 指定非默认目录。

- **PowerShell（推荐）：**
  ```powershell
  & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="$env:USERPROFILE\chrome-cdp-profile"
  ```
- **CMD：**
  ```bat
  "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir=%USERPROFILE%\chrome-cdp-profile
  ```

验证：浏览器打开 `http://127.0.0.1:9222/json/version` 应返回 JSON（含 `webSocketDebuggerUrl`），而不是 404。

## 2. MCP 配置（chrome-devtools）

用户级配置 `~/.cursor/mcp.json` 中，**只**用 `--browserUrl` 连接已有 Chrome，不要与 `--autoConnect` 混用：

```json
"chrome-devtools": {
  "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest", "--browserUrl", "http://localhost:9222"]
}
```

Cursor 中显示的服务名多为 **user-chrome-devtools**。调用前确保 Chrome 已用上面命令启动并监听 9222。

## 3. WSL 连 Windows 上的 Chrome

- **镜像网络**（`.wslconfig` 里 `networkingMode=mirrored`）：WSL 内 `localhost`/`127.0.0.1` 即指向 Windows，无需改 `CHROME_CDP_HOST`；在 WSL 终端执行 `curl -s http://127.0.0.1:9222/json/version` 应有 JSON。
- **非镜像（NAT）**：Chrome 启动时加 `--remote-debugging-address=0.0.0.0`，在 WSL 中查 Windows 主机 IP：`grep nameserver /etc/resolv.conf | awk '{print $2}'`，MCP 的 `--browserUrl` 改为 `http://<该IP>:9222`。

## 4. 常用 MCP 工具（user-chrome-devtools）

- `list_pages`：列出当前标签页。
- `navigate_page`：打开 URL（`type: "url", url: "http://localhost:4321/blog"`）。
- `performance_start_trace`：开始性能录制；`reload: true, autoStop: true` 可录整页加载。
- `performance_stop_trace`：结束并返回 trace 摘要（LCP、CLS、TTFB 等）。
- `lighthouse_audit`：跑 Lighthouse（不含 Performance；要 Performance 用 performance trace）。

站点开发地址：`http://localhost:4321/blog`（`site/` 下 `bun run dev`）。

## 5. 可选：cursor-ide-browser

不依赖 Chrome 9222，由 MCP 自管浏览器实例。适合页面自动化（`browser_navigate`、`browser_snapshot`、`browser_click` 等），不做 CDP 级性能 trace。需要性能数据时用 chrome-devtools 的 performance trace。

## 检查清单（连不上时）

- [ ] Chrome 是否用 **`--user-data-dir` + `--remote-debugging-port=9222`** 启动（PowerShell/CMD 命令见上）。
- [ ] 在 **Windows** 打开 `http://127.0.0.1:9222/json/version` 是否有 JSON。
- [ ] 若 Cursor 在 WSL：在 **WSL** 执行 `curl -s http://127.0.0.1:9222/json/version` 是否有 JSON；若无，检查镜像模式或改用主机 IP + `--remote-debugging-address=0.0.0.0`。
- [ ] MCP 是否只配了 `--browserUrl http://localhost:9222`（未混用 `--autoConnect`），且已重载 MCP / 重启 Cursor。
