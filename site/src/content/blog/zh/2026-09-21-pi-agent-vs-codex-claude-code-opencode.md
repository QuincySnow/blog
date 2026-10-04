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

而这一步的终点是：**你最终拥有的是一个自己的工作流，而不是「用着某个工具将就一下」**。官方一句话概括得最准——*Adapt Pi to your workflows, not the other way around.*

具体差别体现在几个地方：

- **工具数量是你定的。** 默认 4 个工具（read / write / edit / bash），要多一个能力就装一个包，不用接受一整套用不上的工具描述——而工具描述是要反复进上下文的。
- **行为可以改写。** extension 能挂 Agent 生命周期钩子，理论上你能在模型请求前后改写上下文、拦截工具调用、插入自己的逻辑，而不只是「加个命令」。
- **工作流可以打包分享。** 调好的一套 skills + prompts + extensions 可以作为一个 Pi package 分发，别人 `pi install` 就能用你的工作流。反过来也解释了为什么 `context-mode`、`ponytail`、`pi-subagent` 这类包会存在。

对比之下，OpenCode / Codex / Claude Code 的扩展点大多是「往既定形态里加东西」——命令、agent、hook、plugin；而 Pi 的扩展点更接近「改 Agent 的运行方式」。这就是那个常被引用、也确实成立的说法：*the harness that ships four tools beat the harness that ships everything*。

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

## 实测数据：固定模型之后，harness 值多少

上面全是设计对比，但设计说明不了实际效果。更有说服力的是**把底层模型固定住、只换 harness** 的对照实验。

先说清这类实验回答的是哪个问题：

> 「我已经有很强的模型了，该用哪个 harness 驱动它？」

而不是「哪个模型本身最强」。

### 实验一：Tensorlake 四方对比

[Tensorlake 的 14 天实测](https://www.tensorlake.ai/blog/best-ai-coding-agents-2026)在 30 个高难度 agentic tool-use 任务上统一使用 DeepSeek V4 Flash，只换 harness：

| Harness | 通过 | 中位耗时 | 平均 tokens/任务 | 总成本 | 每成功任务成本 |
| --- | --- | --- | --- | --- | --- |
| **Pi** | **20/30 (66.7%)** | 132.2s | 558,885 | **$0.56** | **$0.028** |
| Claude Code | 16/30 (53.3%) | **122.7s** | 741,659 | $3.12 | $0.195 |
| Codex | 16/30 (53.3%) | 245.0s | 664,772 | $1.29 | $0.081 |
| OpenCode | 14/30 (46.7%) | 129.7s | 692,195 | $1.03 | $0.073 |

原作者的结论相当直接：*Pi 赢了，而且成本上不是小赢——只交付四个工具的 harness，赢过了交付全套功能的 harness。*

同一次测试里，Claude Code 耗时最短但最费 token；Codex 通过率与 Claude Code 持平、成本不到一半，但中位耗时 245 秒，基本是其他人的两倍。Tensorlake 的 TL;DR 给 Pi 的评语是「按 token 计费时的最优选择」，同时提醒 **almost no guardrails**。

### 实验二：Composio 八方对比

[Composio 的测试](https://composio.dev/content/best-agent-harness-deepseek-v4-flash)覆盖面更广（8 个 harness），同样是 DeepSeek V4 Flash + 30 个任务：

| Harness | 通过 | 中位耗时 | 每成功任务成本 |
| --- | --- | --- | --- |
| **Pi** | **20/30 (66.7%)** | 132.2s | **$0.028** ⚠️ |
| Prime Agent | 15/24 有效 (62.5%) | ~4 min | $0.131 |
| OMP (Oh My Pi) | 17/30 (56.7%) | 272.4s | $0.103 |
| Claude Code | 16/30 (53.3%) | **122.7s** | $0.195 |
| Codex | 16/30 (53.3%) | ~4 min | $0.081 |
| DeepAgents | 16/30 (53.3%) | 187.1s | $0.045 |
| Hermes | 15/30 (50%) | 175.5s | $0.056+ |
| OpenCode | 14/30 (46.7%) | 129.7s | $0.073 |

⚠️ **官方 caveat 必须一起看**：

> Pi had the lowest reported cost. It cost $0.028 for each successful task. **However, Pi used a different reasoning setting, and it used two model providers. This limits a direct comparison.**

也就是说 Pi 那行的**成本数字不是严格可比的**——推理设置不同，且用到了两家 provider。成功率那列没有这个问题。

这个测试里最值得学的其实不是谁赢，而是**为什么 Claude Code 最贵**。原文拆解：它总 token 量与 Codex、OMP 接近，但**只有 1.5% 的 token 命中缓存**，而 Codex 约 70%、OMP 约 57%；未命中输入的价格是缓存输入的 5 倍。原文结论：*token count alone does not explain cost*——真正决定成本的是「新鲜输入 / 缓存输入 / 输出」的配比。

注意耗时与 token 并不正相关：Claude Code 和 OMP 都用了约 742,000 tokens/任务，但前者快了一倍以上；Hermes 只用了约 192,000 tokens，却仍比 Claude Code 慢。

### 实验三：Pi 与其他 harness 的正面比较

[Composio 第二轮](https://composio.dev/content/pi-vs-opencode)换用 DeepSeek V4 Pro (0813)、max reasoning，同样 30 个高难度任务：

| Harness | 通过 | 每成功任务 | 每共同成功任务 | 平均 tokens | 平均轮次 |
| --- | --- | --- | --- | --- | --- |
| **Pi Agent** | **21/30 (70%)** | $0.078 | $0.031 | 924,990 | 16.3 |
| Codex | 20/30 (66.7%) | n/a\* | $0.031 | 383,722 | n/a |
| DeepSeek Harness | 20/30 (66.7%) | $0.076 | $0.028 | 88,562 | 0.9 |
| OpenCode | 19/30 (63.3%) | $0.119 | $0.032 | 710,140 | 13.1 |
| Claude Code | 19/30 (63.3%) | n/a\* | $0.074 | 649,900 | 12.1 |
| Hermes | 18/30 (60%) | n/a\* | $0.037 | 113,894 | 6.5 |

\* 成本统计不完整，不可比。

这组数据里 **Pi 不是 token 最省的**——平均 925k tokens/任务，Codex 只有 384k。但两个更有意义的指标是：**Pi 通过率最高（70%）**，且**在双方都通过的任务上，Pi 和 Codex 成本完全持平**（都是 $0.031）。原文的解释很到位：OpenCode 看起来贵，不是因为它成功时更费钱，而是**它失败得更多，而失败的运行照样烧 token**。

Pi 全程花费 $1.64，OpenCode $2.25。

### 冷启动开销：一个需要谨慎解读的数字

「Pi 更轻」最常被引用的一组数据，实际来自 [Systima 的实测](https://systima.ai/blog/claude-code-vs-opencode-token-overhead)，而它测的是 **Claude Code vs OpenCode，并不包含 Pi**：

测试条件相当克制——同一台机器、固定 `claude-sonnet-4-5`、全新配置目录（无 MCP、无用户设置、无 memory）、空工作区（无指令文件）、绕过权限。任务是回一句 `Reply with exactly: OK`（22 个字符），每个 harness 跑三次。

| | Claude Code | OpenCode |
| --- | --- | --- |
| System prompt | 27,344 字符，3 个 block | 9,324 字符，1 个 block |
| 工具 schema | **27 个工具**，99,778 字符 | 10 个工具，20,856 字符 |
| 首轮注入的 `<system-reminder>` | 7,997 字符 | 无 |
| 用户输入 | 22 字符 | 22 字符 |
| **首轮载荷（标定后）** | **~32,800 tokens** | **~6,900 tokens** |

大头在工具 schema：Claude Code 那 ~33k tokens 里约 24k 是 27 个工具的定义，OpenCode 那 ~6.9k 里约 4.8k 是工具定义。

Pi 自身的数据来自项目侧描述：**默认 4 个工具（read / write / edit / bash），系统提示词在 1,000 tokens 以内**，其余能力按需装包。

不过 Systima 作者自己给了一个很重要的限定，值得原样记住：

> raw input token count is not a meaningful benchmark... What really matters is the mix of tools the harness exposes, the steering it embeds into tool descriptions, and how effectively it takes advantage of model and provider features such as prompt caching.

所以更稳妥的表述是：**Pi 在单次交互上确实便宜得多**（工具更少、提示词更短），但「固定上下文开销小」本身不等于「结果更好」——Claude Code 那 27 个工具里包含后台 agent、编排、worktree 管理，它多花的钱买的是别的东西。

## 一个重要的时间差：benchmark 测的不是 1.0

上面四组 benchmark 有个共同点值得注意：**它们都跑在 Pi 1.0 之前。**

```text
Systima（冷启动开销）        2026-07
Composio（DeepSeek V4 Flash） 2026-08-06
Composio（DeepSeek V4 Pro）   2026-08-21
───────────────────────────────────────
Pi 0.86.0 引入 prompt cache warming   2026-09-19
Pi 0.99.0                            2026-09-29
Pi 1.0.0                             2026-10-01   ← benchmark 之后
```

也就是说表里那个 $0.028，测的是 **0.8x 时期的 Pi**。而在那之后 Pi 又做了一轮直接指向成本的优化，从官方 CHANGELOG 能逐条对上：

| 版本 | 日期 | 成本相关的改动 |
| --- | --- | --- |
| 0.86.0 | 2026-09-19 | **Prompt cache warming**：长时间工具运行和空闲时用「成本感知的刷新」保活缓存 |
| 0.86.0 | 2026-09-19 | **Transcript-aware prompt/tool updates**：resume 和分支切换时保留指令与工具变更，同时**保住已缓存前缀** |
| 0.99.0 | 2026-09-29 | 修复经 `ctx.executeTool()`（如 codemode 脚本）调用的工具**用量被漏记**，现在计入会话成本 |
| **1.0.0** | **2026-10-01** | **Leaner codemode：提示词 token 减少约 40%** |
| 1.0.1 | 2026-10-03 | Anthropic 工具在会话中途新增/重定义时改为**内联定义**，重定义同名工具**不再重发整份工具列表**，从而保住 prompt cache |
| 1.0.1 | 2026-10-03 | 修复 Bedrock 上 OpenAI 模型在输入超过 272k token 时仍按短上下文费率计费的定价分层错误 |

做法不是删功能，而是改写法：

- `codemode` 描述里，每个脚本全局对象只占一行，`models` API 指向一份参考文档，**模型需要时才去读**
- 声明工具时只写一行「脚本怎么调、调完 resolve 成什么」，**不再重复完整声明**
- 系统提示词里的 codemode 指引和 MCP server 段落也同时缩短

### 复现验证：−40% 是不是真的

CHANGELOG 给的数字是「一次 GPT-5.6 请求从约 5,300 降到约 3,300 tokens」。我在本地实测了这条：固定 `codemode` 开启，固定一句 `Reply with exactly: OK`，只换 Pi 版本。

| 模型 | 0.99.2 | 1.0.2 | 变化 |
| --- | --- | --- | --- |
| deepseek-v4-flash | 4,127 | **2,403** | **−41.8%** |
| gpt-5.6-luna | 3,211 | **1,703** | **−47.0%** |
| *官方 changelog（GPT-5.6）* | *5,300* | *3,300* | *−37.7%* |

每组 5 次取中位数，指标是每轮实际发送的上下文总量（`input + cacheRead + cacheWrite`）。绝对值和官方不同是正常的（模型与 tokenizer 不同），但**降幅落在同一量级、且略大**——「−40%」这个说法可以当成已被独立复现，而不只是 changelog 里的一句话。

复现方式很简单，不需要装旧版本：

```bash
PI_CODING_AGENT_DIR=/tmp/clean \
bunx @earendil-works/pi-coding-agent@0.99.2 \
  --mode json --print --tools read,bash,edit,write,codemode \
  --model opencode-go/deepseek-v4-flash "Reply with exactly: OK"
```

`bunx` 按版本拉起，不碰全局安装；`PI_CODING_AGENT_DIR` 指向一个只放凭证、不放任何包的空目录，隔离掉已安装的扩展。

### 顺带发现：别拿 `input` 当上下文大小

测这个的时候有个坑值得记下来。第一次跑出来 `input` 只有个位数，看着像上下文极小：

| 模型 | input | cacheRead | cacheWrite |
| --- | --- | --- | --- |
| deepseek-v4-flash（0.99.2） | 31 | **4,096** | 0 |
| gpt-5.6-luna（0.99.2） | 3 | 0 | **3,208** |

真相是**整段上下文被缓存接走了**。真实指标是 `input + cacheRead + cacheWrite`，而不是 `input`。

这个区别在钱上被放大得很厉害。以 `deepseek-v4-flash` 的标价为例：

| | USD / 1M tokens |
| --- | --- |
| input | 0.15 |
| output | 0.6 |
| **cacheRead** | **0.003** |

**缓存读取比新鲜输入便宜 50 倍。** 所以「上下文变大了 = 变贵了」这个直觉，在开了缓存之后就不成立——真正贵的永远是**没命中缓存的那部分**。

这正好从反面印证了前面 Composio 的观察：Claude Code 贵，不是因为 token 多，而是因为它只有 1.5% 命中了缓存。

### 那你的实际开销在哪

顺手用同一套方法量了一下「裸 Pi」和「装了一堆包之后」的差别（同样 `deepseek-v4-flash`、同样 prompt）：

| 配置 | 每轮上下文 |
| --- | --- |
| 裸 Pi · 默认四工具 · 无包 · 无 codemode | **1,940** |
| 裸 Pi · 默认四工具 + codemode | 2,403 |
| 装了 11 个 Pi 包之后 | **25,651** |

裸 Pi 的固定开销确实只有约 1,940 tokens，这坐实了前面那个「harness 本身很轻」的说法。但**日常开销里 90% 以上来自扩展包，不是 Pi 本身**。

好在因为缓存的存在，这一组的实际计费反而是三组里最低的（$0.000086/轮，vs 裸 Pi 的 $0.000299）——25k 上下文几乎全走了 cacheRead。这正是 cache warming 这类优化的价值。

### 结论

所以更完整的说法是：**benchmark 显示 0.8x 的 Pi 已经领先；1.0 的 codemode 瘦身又实测降了 40% 以上的固定开销；而 cache warming 那一系列改动，则把「已经付过钱的上下文」几乎完全变成免费读取。**

至于「1.0 能把 benchmark 里那个 $0.028 再压多少」——那需要重跑完整的三方对照测试（固定任务集、多次重复），目前没有数据，不宜推测。

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

Pi 不是功能最多的 Agent，但它可能是**最容易被改造成你自己想要的样子**的那个：模型随便换、会话能分叉、工具能编排、程序能嵌入、扩展能打包分享。它的基本立场是 *adapt Pi to your workflows, not the other way around*——你拥有的应该是自己的工作流，而不是在迁就工具。

而现有实测数据也支持这个方向：在固定同一个底层模型、只换 harness 的对照测试里，Pi 的通过率最高（20/30 ~ 21/30），每成功任务成本最低（$0.028）；在更严格的条件控制下，它的首轮固定上下文开销也远小于 Claude Code。

代价同样明确：它把很多「本该内置」的东西交给了社区包，也把沙箱这件事完全留给了你自己。

如果你更看重开箱即用和生态成熟度，Codex 和 Claude Code 是更稳妥的选择；如果你更看重开源自由，OpenCode 很香。而当你发现自己在「凑合」某个工具的工作流时，那就该试试 Pi 了。

## 参考

- [earendil-works/pi](https://github.com/earendil-works/pi) · [pi.dev](https://pi.dev)
- [Pi 官方文档](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/docs)
- [anomalyco/opencode](https://github.com/anomalyco/opencode)
- [openai/codex](https://github.com/openai/codex) · [Codex 安全文档](https://developers.openai.com/codex/security)
- [anthropics/claude-code](https://github.com/anthropics/claude-code)
- [Tensorlake: Best AI Coding Agents in 2026](https://www.tensorlake.ai/blog/best-ai-coding-agents-2026)
- [Composio: Finding the Best Harness for DeepSeek V4 Flash](https://composio.dev/content/best-agent-harness-deepseek-v4-flash)
- [Composio: Pi vs OpenCode](https://composio.dev/content/pi-vs-opencode)
- [Systima: Claude Code vs OpenCode token overhead](https://systima.ai/blog/claude-code-vs-opencode-token-overhead)
