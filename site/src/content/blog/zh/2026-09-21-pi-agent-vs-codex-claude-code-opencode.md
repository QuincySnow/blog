---
title: "为什么我推荐 Pi Agent：与 OpenCode、Codex、Claude Code 的对比"
description: "Pi 是一个极简、可改造的终端 Agent harness：模型无关、会话是树、Codemode、四种集成形态、扩展可打包分发。对比 OpenCode、Codex CLI、Claude Code 的许可证、模型策略、扩展方式与安全模型，给出选型建议"
pubDatetime: 2026-09-21T00:00:00Z
modDatetime: 2026-09-21T00:00:00Z
draft: false
tags:
  - AI
  - Pi
  - 工具链
  - 对比
lang: zh
---

市面上的终端 AI Agent 不少，但大多数是「造好一个产品，你来适应它」。Pi 反过来：它自称是一个 **minimal, extensible agent harness that you can make your own**——提供骨架，工作流由你自己长出来。

这篇文章分两部分：先讲 Pi 到底做了什么设计选择，再把它和 OpenCode、Codex CLI、Claude Code 摆在一起对比，最后给选型建议。

## Pi 是什么

Pi 由 Earendil（Mario Zechner，badlogicgames）开发，仓库是 [earendil-works/pi](https://github.com/earendil-works/pi)，npm 包名 `@earendil-works/pi-coding-agent`。本文基于本地实测的 **v1.0.2**。

先说结论式的一句话：**如果你想要一个「什么模型都能用、什么工作流都能改、还能嵌进自己程序里」的 Agent，Pi 是目前最合适的底座；如果你是 OpenAI/Anthropic 订阅用户且只想开箱即用，Codex 或 Claude Code 更省事。**

### 安装

```bash
curl -fsSL https://pi.dev/install.sh | sh          # 推荐，锁定依赖版本，pi update 升级
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
nix profile add github:earendil-works/pi/stable
```

要求 **Node.js 22.19+**。装完在项目目录里直接 `pi`，然后 `/login` 连订阅或填 API key。

## Pi 的五个关键设计

### 1. 模型无关，不绑定单一厂商

Pi 没有「只能用自家模型」这回事。`/login` 里可以接订阅（OAuth）或 API key，也支持环境变量认证、本地模型（llama.cpp 等），以及任何 OpenAI 兼容的自定义端点。

这点和 Codex（有 OpenAI 血缘、深度绑定 ChatGPT 订阅）、Claude Code（绑定 Anthropic）形成对比：换模型在 Pi 里是 `/model` 的事，不是换工具的事。

### 2. 会话是一棵树，不是一条线

这是 Pi 最被低估的设计。会话里的消息和事件构成一棵树，每条从根到叶的路径是一个 **branch**，当前所在的分支叫 **active branch**，只有它会被拼进下一次模型请求。

```text
                    ┌─ branch A（active）
root ──┬── msg1 ──┬── msg2 ── msg3
       │           │
       │           └── branch B（备选方案，保留完整历史）
       └── msg1' ── msg2'（另一种走法）
```

想试另一种做法就 `/fork`，原路完整保留，随时切回；`/tree` 打开树状导航器，`/resume` 挑别的会话，`pi --continue` 恢复最近一次。

对日常开发来说，这解决了「Agent 走错一条路，想退回上一步但上下文已经污染」的真实痛点。

### 3. Codemode：脚本编排，而不是逐次调用

`codemode` 工具让模型写一段 JavaScript，在里面调用其他工具并跑非 LLM 模型。只有脚本的输出回到模型眼前。

```javascript
const results = await Promise.allSettled([
  tools.codegraph_search({ query: "auth" }),
  tools.codegraph_callers({ symbol: "login" }),
]);
// 只打印你需要的部分
for (const r of results) if (r.status === "fulfilled") text(r.value);
```

带来的好处很直接：并行调用省时间；先过滤再回传省上下文。命名规则是把非法字符换成 `_`，所以 MCP 工具 `mcp__dev-radius__search` 在脚本里是 `tools.mcp__dev_radius__search`。

另外 `bash` 在 codemode 里 resolve 出来的对象带 `full_output_path`——模型看到的是 2000 行/50KB 的截断版本，但脚本拿到的是最多 1 MiB，所以「大输出只取尾部」这种需求不用把全文塞进上下文。

### 4. 四种集成形态

```text
交互式 TUI      → 日常用
print 模式      → 一次性/脚本化任务（pi -p "..."）
JSON 事件流     → 消费结构化事件
RPC 模式        → 用 JSONL 控制独立 Pi 进程
TypeScript SDK  → 在自己的应用里内嵌 Pi
```

官方给的选择依据：

| 接口 | 进程边界 | 控制方式 | 适合 |
|---|---|---|---|
| SDK | 同进程 | 直接 TS 方法与事件 | Node.js / Bun 宿主，要完整 API |
| RPC | 子进程 | JSONL 命令/响应/事件 | 其他语言、进程隔离、IDE、自定义客户端 |

想给 Pi 写个 IDE 插件或接进 CI，RPC 这条路是现成的，不用自己造轮子。

### 5. 扩展体系：四种资源，打包成分发

Pi 的可定制单元有四种：

- **extensions** —— TypeScript/JavaScript，可执行，接 Agent 生命周期钩子
- **skills** —— `SKILL.md`，按需加载完整指令
- **prompt templates** —— 展开编辑器输入的 Markdown
- **themes** —— JSON 主题

这四类可以打包成 **Pi package**，通过 npm 或 git 分发；带上 `pi-package` keyword 就能出现在 [pi.dev/packages](https://pi.dev/packages) 画廊里。包的身份标识规则：npm 按包名、git 按仓库 URL（不含 ref）、本地按绝对路径——目的是防止同一份声明被加载两次。

**关键点：Pi 明确「不做」某些功能。** 官方原话是 ships with powerful defaults but skips features like sub-agents and plan mode。你要的 subagent、plan mode，装包或自己写。

这不是偷工减料，而是把选择权交给你：默认塞一堆用不上的功能，是大多数产品的做法；Pi 选择让你按需引入。

顺带一提，Pi 内置 MCP，原生支持：

```bash
pi mcp add camoufox -- npx -y camoufox-mcp-server@latest
pi mcp list
```

用户级配置 `~/.pi/agent/mcp.json`，项目级 `.pi/mcp.json`（需信任项目），工具名 `mcp__<server>__<tool>`。

## 对比：Pi vs OpenCode vs Codex vs Claude Code

### 速查表

| 维度 | **Pi** | **OpenCode** | **Codex CLI** | **Claude Code** |
|---|---|---|---|---|
| 定位 | 可改造的 Agent harness | 「开源 AI coding agent」 | 轻量终端 coding agent | 终端里的 agentic 工具 |
| 许可证 | 开源 | **MIT** | **Apache-2.0** | **闭源**（GitHub 仓库无 OSS 许可证） |
| 实现语言 | TypeScript | TypeScript | Rust | TypeScript |
| 发行 | npm / 安装脚本 / nix | npm / brew / pacman / mise 等 | npm `@openai/codex` / brew cask / 独立安装脚本 | npm `@anthropic-ai/claude-code` |
| 模型策略 | **模型无关**：订阅 / API key / 本地 / 兼容端点 | 多 provider（models.dev 目录驱动） | 主打 ChatGPT 订阅（Sign in with ChatGPT），也支持 API key | 绑定 Anthropic（订阅或 API key） |
| 沙箱 | **无内置沙箱** | — | **有**，独立的沙箱与审批文档 | — |
| 扩展方式 | extensions / skills / prompts / themes，打包分发 | 插件机制 + `opencode.json` | AGENTS.md + 配置 | hooks / skills / subagents / plugins / MCP |
| 会话分支 | **内置树状 branch / fork** | — | — | — |
| 脚本编排工具 | **内置 Codemode** | — | — | — |
| 嵌入自身程序 | **SDK + RPC + JSON 流 + print** | — | 非交互模式 | headless 模式 |
| 强项 | 可塑性、模型自由、嵌入能力 | 开源、provider 广、社区大 | 与 ChatGPT 生态贴合、**沙箱** | 生态成熟、skills/plugin 生态最丰富 |
| 短板 | 很多能力要自己装包 | 定制深度不如 Pi | 与 OpenAI 绑定较深 | 闭源、绑定 Anthropic |

> 表中「—」表示我没找到官方文档明确声明，不等于该工具没有该能力。竞品迭代很快，涉及具体行为请以各自最新文档为准。

### 各说两句

**OpenCode**（仓库已迁至 [anomalyco/opencode](https://github.com/anomalyco/opencode)，原 `sst/opencode` 会重定向）：MIT 协议，TypeScript，定位就是「the open source AI coding agent」，provider 覆盖广，桌面端（Beta）也有。如果你想要一个开箱即用、开源自由、可视化界面优先的方案，它很合适。跟 Pi 的区别主要在**定制的深度和形状**——Pi 的扩展能改 Agent 循环本身（钩子、可执行集成），不只是加命令。

**Codex CLI**：Apache-2.0，Rust 写的，安装渠道最正式（独立安装脚本 + npm + brew cask）。最值得注意的是它**有独立的沙箱与审批（sandbox & approvals）体系**，这是 Pi 明确没有的东西。如果你要在 CI 或共享机器上跑无人值守的 Agent，这一点比什么都重要。它支持 ChatGPT 订阅登录（Plus/Pro/Business/Edu/Enterprise），也有非交互模式做脚本化任务。

**Claude Code**：闭源，Anthropic 自家。生态成熟度最高的一档——hooks、skills、subagents、plugins、MCP 一应俱全，第三方技能（如 agent-skills 那类）适配也最顺。代价是绑定单一厂商，且闭源意味着你没法自己改 Agent 内核。

### 一个容易被忽略的差异：安全边界

Pi 官方文档把话说得很直白：

> Pi's tools and extensions run with the permissions of the Pi process. Project trust controls which project resources Pi loads, but it does not sandbox tool calls.

也就是说 `/trust` 只控制「加载不加载这个项目的资源」，**不等于沙箱**。Pi 的官方安全边界声明里，以下都算「预期内的本地 Agent 行为」而非漏洞：来自不可信内容的 prompt injection、没有内置沙箱、用户自己装的 extension/skill 的行为。

所以如果你要在 CI、共享服务器或处理不可信代码的环境里跑，**Pi 需要你自己配隔离**（容器 / Docker sandbox / 独立用户），而 Codex 那套内置沙箱开箱即用。这是我在对比中认为最实质的一个差距。

## 怎么选

```text
要最大可塑性 / 想嵌进自己的程序  → Pi
要在 CI 或共享机器上无人值守     → Codex（内置沙箱），或 Pi + 容器
只用 Anthropic 模型、想要最成熟生态 → Claude Code
想要开箱即用 + 开源 + 可视化    → OpenCode
想换着模型用、比较不同模型效果   → Pi（/model 就切）
```

个人日常开发我是这样分工的：Pi 当主力，浏览器/联网类的活儿交给扩展（之前写过一篇 [Pi 插件推荐](/blog/posts/zh/2026-09-21-pi-essential-extensions)，列了 10 个），需要并行时用 subagent 类扩展，需要无人值守就套容器。

## 一句话总结

Pi 不是功能最多的 Agent，但它可能是**最容易被改造成你自己想要的样子**的那个：模型随便换、会话能分叉、工具能编排、程序能嵌入、扩展能打包分享。代价是它把很多「本该内置」的东西交给了社区包，也把沙箱这件事留给了你自己。

如果你更看重开箱即用和生态成熟度，Codex 和 Claude Code 是更稳妥的选择；如果你更看重开源自由，OpenCode 很香。而当你发现自己在「凑合」某个工具的工作流时，那就该试试 Pi 了。

## 参考

- [earendil-works/pi](https://github.com/earendil-works/pi) · [pi.dev](https://pi.dev)
- [Pi 官方文档（本地 `docs/`）](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/docs)
- [anomalyco/opencode](https://github.com/anomalyco/opencode)
- [openai/codex](https://github.com/openai/codex) · [Codex 安全文档](https://developers.openai.com/codex/security)
- [anthropics/claude-code](https://github.com/anthropics/claude-code)
