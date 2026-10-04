# Pi + Camoufox MCP：让 AI Agent 直接操作反检测浏览器

> 本文记录一次实际配置：在 Linux 上安装 Camoufox，并通过 MCP 接入 Pi Coding Agent，让 AI 可以直接控制 Camoufox 浏览网页。
>
> 最终效果：**Pi → MCP → Camoufox → 网页**。

## 1. 为什么要用 Camoufox + MCP？

普通网页抓取工具遇到 JavaScript 重度渲染的网站时，经常只能拿到空壳 HTML，或者根本无法得到浏览器实际看到的内容。

Camoufox 则是真正运行浏览器页面，再通过 MCP 把浏览器能力提供给 AI Agent。

最终架构：

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

Camoufox 官方提供 Python 包，`geoip` extra 可以根据代理出口 IP 自动处理地理位置、时区、国家、locale 和 WebRTC IP 等信息。官方也明确建议在使用代理时安装 `geoip`。 

## 2. 环境

本文以 Linux + Pi Coding Agent 为例。

需要：

- Python
- `uv`
- Node.js 22+
- Pi Coding Agent
- Camoufox
- `camoufox-mcp-server`

当前 Camoufox MCP Server 的发布运行时要求 Node.js 22+。

检查：

```bash
node --version
uv --version
pi --version
```

## 3. 安装 Camoufox

这里使用 `uv tool` 安装 Camoufox，并同时安装 GeoIP 支持：

```bash
uv tool install "camoufox[geoip]"
```

注意，下面这种写法是错误的：

```bash
uv tool install "camoufox[geoip],camoufox[geoip]"
```

`uv` 会把整个字符串当成一个 package requirement 解析，因此会出现：

```text
Expected one of `@`, `(`, `<`, `=`, `>`, `~`, `!`, `;`, found `,`
```

正确写法只有：

```bash
uv tool install "camoufox[geoip]"
```

Camoufox 官方安装文档目前同样推荐：

```bash
pip install -U "camoufox[geoip]"
```

其中 `geoip` 是可选组件，但官方强烈推荐在使用 Proxy 时安装。

## 4. 下载 Camoufox 浏览器

安装 Python 包之后，还需要下载实际的浏览器：

```bash
python -m camoufox fetch
```

检查安装：

```bash
camoufox version
```

也可以：

```bash
camoufox list
```

Camoufox 官方提供了 `fetch`、`list`、`active`、`set`、`remove` 等浏览器版本管理命令。

## 5. 为什么安装 GeoIP？

如果使用代理，例如：

```text
Proxy → 美国出口 IP
```

Camoufox 可以结合 GeoIP 自动匹配：

```text
IP
 ↓
国家
 ↓
经纬度
 ↓
时区
 ↓
Locale
 ↓
语言
 ↓
WebRTC IP
```

Camoufox 官方的 GeoIP/Proxy 文档明确说明，启用 `geoip=True` 后，它可以根据目标 IP 自动处理 longitude、latitude、timezone、country、locale，并 spoof WebRTC IP。

这对于反检测 Profile 很重要，因为：

```text
IP：美国
Timezone：美国
Locale：en-US
WebRTC：美国
```

比出现明显互相矛盾的浏览器环境更加合理。

## 6. 安装 Camoufox MCP

Camoufox MCP Server 的 npm 包是：

```text
camoufox-mcp-server
```

最简单的方式是不全局安装，直接使用 `npx`：

```bash
npx -y camoufox-mcp-server@latest
```

它会负责启动 MCP Server。

官方仓库目前使用的默认版本组合会固定 Camoufox/Playwright 相关依赖，并提供 doctor / fetch 等机制用于检查浏览器环境。

## 7. 接入 Pi

这里有一个容易踩坑的地方：

当前这套配置实际使用 Pi 的 MCP 配置文件：`~/.pi/agent/mcp.json`。

安装：

```bash
pi install npm:pi-mcp-adapter
```

然后创建或编辑：

```bash
nano ~/.pi/agent/mcp.json
```

加入：

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

保存后重新启动 Pi。

> 注意：本文以已经验证成功的 Pi 1.0.0 配置为准：直接在 `~/.pi/agent/mcp.json` 注册 MCP Server。

## 8. MCP 提供了什么？

Camoufox MCP Server 并不是简单的网页搜索接口，而是提供浏览器自动化能力。

当前主要工具包括：

```text
camoufox_status
browse
browse_snapshot
browse_sequence
browse_links
browse_forms
browse_outline
browse_find
```

其中：

### `browse`

访问网页并返回页面内容。

### `browse_snapshot`

返回可见文本、ARIA snapshot 和交互元素。

### `browse_sequence`

执行一系列浏览器动作，例如：

```text
click
hover
fill
type
select
press
waitFor
scroll
```

一次最多执行 25 个动作。

### `browse_forms`

识别页面上的表单字段和提交控件。

### `browse_links`

提取页面中的可导航链接。

因此 AI 不再只是：

```text
搜索 → 获取文本
```

而是可以：

```text
打开网页
 ↓
观察页面
 ↓
找到按钮
 ↓
点击
 ↓
填写输入框
 ↓
滚动
 ↓
继续操作
```

官方文档也明确将登录流程、多步骤表单、购物车、Dashboard 等场景列为应该使用 Session 工具的场景。

## 9. Proxy

Camoufox MCP 的浏览工具支持 Proxy 参数。

例如概念上：

```text
Pi
 ↓ MCP
Camoufox
 ↓
Proxy
 ↓
Website
```

MCP 工具参数支持：

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

具体代理格式应按照代理服务商提供的协议和认证方式填写。

Camoufox 官方也支持 HTTP/HTTPS 等 Proxy 配置，并可配合 GeoIP 使用。

## 10. Cookie / Session

如果需要长期使用某个网站的登录状态，核心思路不是每次都重新登录，而是使用持久化的浏览器 Session/Profile 状态。

概念上：

```text
Profile
├── Fingerprint
├── Cookies
├── LocalStorage
├── IndexedDB
├── Cache
└── 登录状态
```

这样可以形成长期浏览器状态。

**注意：Cookie 很可能就是登录凭证。**

因此不要把真实 Cookie：

- 提交到 Git
- 放进公开仓库
- 发到公共 MCP Server
- 暴露公网
- 随意复制给第三方

建议：

```text
Pi
 ↓
本机 MCP
 ↓
本机 Camoufox Profile
```

而不是：

```text
Pi
 ↓
公网 MCP
 ↓
第三方服务器
```

## 11. Cookie Warm-up

这里要区分两个概念。

### Cookie 导入

```text
已有 Cookie
 ↓
导入 Profile
 ↓
恢复登录/Session
```

### Cookie Warm-up

```text
新 Profile
 ↓
访问真实网站
 ↓
产生 Cookie / Storage / Cache 等状态
 ↓
逐渐形成浏览器活动状态
```

一些商业反检测浏览器已经提供独立的 Cookie Robot / Warm-up 功能。

Camoufox MCP 当前更偏向于提供**浏览器控制能力**，而不是提供一个现成的 Cookie Robot。

因此，如果需要 Warm-up，可以由 Agent 自己控制浏览器完成：

```text
Pi
 ↓
MCP
 ↓
Camoufox
 ↓
访问指定网站
 ↓
等待
 ↓
滚动
 ↓
打开其他页面
 ↓
继续浏览
```

但不要把普通的 Cookie 持久化误称为自动 Warm-up。

## 12. 实际测试：JavaScript 网页

这次测试的实际场景是：

> Google 网页版属于 JavaScript 渲染页面，直接抓取失败，因此改用 Exa 搜索 MCP 获取“今天有什么新闻”。

测试结果能够正常获得 Google News 首页相关来源，例如：

```text
BBC 中文
新华网
新浪
Yahoo 新闻台湾
世界新闻网
```

这说明：

```text
传统抓取
    ↓
JS 页面
    ↓
失败
```

而：

```text
AI Agent
    ↓
Camoufox MCP
    ↓
真实浏览器
    ↓
JavaScript 页面
    ↓
页面内容
```

是另一种完全不同的工作方式。

## 13. 最终工作流

配置完成后，整个系统可以理解成：

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
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                           Website
```

这意味着 AI Agent 不只是“搜索网页”，而是可以获得一个真正的浏览器操作环境。

例如：

```text
“打开这个网站”
“搜索某个商品”
“比较三个商品”
“打开商品详情”
“加入购物车”
```

都可以变成浏览器操作。

对于涉及支付、验证码、2FA 等高风险操作，建议让 AI 在最终确认阶段停下来，由用户本人完成确认。

## 14. 配置速查

### Camoufox

```bash
uv tool install "camoufox[geoip]"
python -m camoufox fetch
camoufox version
```

### MCP 配置

文件：

```text
~/.pi/agent/mcp.json
```

内容：

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

### 启动

```bash
pi
```

然后检查 MCP 工具列表中是否出现 Camoufox。

## 15. 总结

这次最终搭建的是：

```text
Pi 1.0.0
   +
MCP
   +
camoufox-mcp-server
   +
Camoufox
   +
GeoIP
```

核心价值是把：

> **AI Agent + 真正的浏览器 + Anti-detect + Proxy + Session**

组合起来。

相比单纯的搜索 MCP，它最大的区别是：

> **AI 不再只能“获取网页内容”，而是可以真正操作网页。**

---

### 参考资料

- Camoufox 官方安装文档：<https://camoufox.com/python/installation/>
- Camoufox GeoIP / Proxy：<https://camoufox.com/python/geoip/>
- Camoufox MCP Server：<https://github.com/whit3rabbit/camoufox-mcp>
- Camoufox MCP 配置：<https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/configuration.md>
- Camoufox MCP 工具参数：<https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/tool-parameters.md>
- Camoufox MCP 使用示例：<https://github.com/whit3rabbit/camoufox-mcp/blob/main/docs/examples.md>
