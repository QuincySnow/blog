---
title: "Pi 插件推荐：10 个真正提升日常开发体验的扩展"
description: "推荐 10 个实测可用的 Pi 扩展与技能：pi-web-access、pi-codegraph、ponytail、context-mode、pi-custom-system-prompt、pi-notify、pi-interactive-shell、pi-custom-provider-fix、pi-subagent 与 addyosmani/agent-skills，附安装命令与适用场景"
pubDatetime: 2026-09-21T00:00:00Z
modDatetime: 2026-09-21T00:00:00Z
draft: false
tags:
  - AI
  - Pi
  - 工具链
  - 效率
lang: zh
---

Pi 本身内置 MCP、Codemode、Subagent 调度等能力，但真正决定「用得顺不顺手」的，往往是几个扩展和技能包。这篇文章推荐 10 个我实际在用的，每个都给出安装命令、核心能力、适用场景，以及一些需要注意的地方。

先给个速查表：

| 包 | 一句话 | 类型 |
| --- | --- | --- |
| `pi-web-access` | 搜索 + 网页/视频内容提取，零配置 | extension |
| `@vndv/pi-codegraph` | 用 tree-sitter 图索引代替 grep/read 循环 | extension |
| `ponytail` | 让 Agent 少写代码（实测 -54% LOC） | extension + skill |
| `context-mode` | 沙箱执行 + 知识库，省上下文窗口 | extension + skill |
| `pi-custom-system-prompt` | 从 Markdown 注入自定义系统提示词 | extension |
| `@pi-unipi/notify` | 任务完成后推送到手机/桌面 | extension + skill |
| `pi-interactive-shell` | 在 TUI 浮层里跑交互式 CLI 和子 Agent | extension + skill |
| `pi-custom-provider-fix` | 向导式配置自定义 LLM 接口 | extension |
| `@mjakl/pi-subagent` | 委派给专职子 Agent | extension |
| `addyosmani/agent-skills` | 25 个工程技能 + 9 个生命周期命令 | skills |

## 1. pi-web-access：联网能力<span id="pi-web-access"></span>

[pi-web-access](https://pi.dev/packages/pi-web-access) 提供 5 个工具：

```text
web_search
fetch_content
get_search_content
source_check
web_fetch
```

亮点是**零配置**：装完直接可用，搜索走 Exa MCP，不需要任何 API key。如果你用 `/login` 登录了 ChatGPT 订阅，OpenAI 搜索还能直接复用那份凭证。

内容提取覆盖网页、GitHub 仓库、PDF、YouTube 视频（含按时间戳抽帧）。GitHub URL 会被**克隆到本地**再给 Agent 真实文件内容，而不是抓渲染后的 HTML。

API key 写在 `~/.pi/agent/web-search.json`：

```json
{
  "openaiApiKey": "sk-...",
  "braveApiKey": "BSA_...",
  "exaApiKey": "exa-..."
}
```

支持的服务商很多：OpenAI、Brave、Parallel、Tavily、Firecrawl、Jina、Perplexity、Gemini、Kimi、Exa、SearXNG（自建）等，每项能力都有 fallback 链。

```bash
pi install npm:pi-web-access
```

## 2. pi-codegraph：别再 grep 循环<span id="pi-codegraph"></span>

[@vndv/pi-codegraph](https://pi.dev/packages/@vndv/pi-codegraph) 给 Pi 挂上 8 个结构化代码工具：

```text
codegraph_search    codegraph_node       codegraph_files
codegraph_callers   codegraph_callees    codegraph_impact
codegraph_explore   codegraph_status
```

它用 tree-sitter 给项目建索引，然后回答「X 怎么走到 Y」这类问题，而不是让 Agent 一遍遍 grep + read。

注意它**依赖外部 CLI**，光装扩展没用：

```bash
npm install -g @colbymchenry/codegraph   # 必须在 PATH 上
cd /path/to/project && codegraph init -i # 每个项目都要初始化
pi install npm:@vndv/pi-codegraph
```

要求 Node.js ≥ 22.19.0。纯 extension，不需要额外配 MCP server。

## 3. ponytail：让它少写代码<span id="ponytail"></span>

[@dietrichgebert/ponytail](https://pi.dev/packages/@dietrichgebert/ponytail) 的定位很直白：「最好的代码是你没写的那些代码。」

它给 Agent 装了一套「偷懒阶梯」，写码前从最低的一级开始试：

```text
这东西需要存在吗？      → 不需要就跳过（YAGNI）
代码库里已经有了？      → 复用，别重写
标准库能做？            → 用标准库
平台原生能做？          → 用原生
已装的依赖能做？        → 用它
一行能写完？            → 就一行
否则                    → 才写真正需要的最小实现
```

官方给了一组实测数字（headless Claude Code 改 tiangolo 的 full-stack-fastapi-template，12 个 feature ticket，n=4，Haiku 4.5）：

| 指标 | vs 无 skill 基线 |
| --- | --- |
| LOC | **-54%** |
| tokens | -22% |
| 成本 | -20% |
| 时间 | -27% |
| 安全项保留 | 100% |

对照组里，单纯「YAGNI + 一行流」的 prompt 也能减 LOC，但 token、成本、时间反而上升；ponytail 是唯一各项全降且不牺牲安全性的方案——校验、错误处理、安全、可访问性明确不在它的削减范围内。

命令：`/ponytail`、`/ponytail-review`、`/ponytail-audit`、`/ponytail-debt` 等。

```bash
pi install npm:@dietrichgebert/ponytail
```

## 4. context-mode：省上下文<span id="context-mode"></span>

[context-mode](https://pi.dev/packages/context-mode) 针对的是另一个问题：每次 MCP 工具调用都把原始数据灌进上下文——一次 Playwright snapshot 56 KB，20 个 GitHub issue 59 KB。

核心是 **Think in Code**：与其把 50 个文件读进上下文让模型自己数函数，不如让它写个脚本来数，只把结果 `console.log` 出来。

```text
// 之前：47 × Read() = 700 KB
// 之后：1 × ctx_execute() = 3.6 KB
```

它提供 6 个沙箱工具（`ctx_execute`、`ctx_execute_file`、`ctx_batch_execute`、`ctx_index`、`ctx_search`、`ctx_fetch_and_index`）加 5 个元工具，以及 `/context-mode:ctx-stats`、`ctx-doctor`、`ctx-index` 等命令。压缩会话后它靠 SQLite + FTS5 索引把上下文找回来，而不是让 Agent 重新读文件。

⚠️ **许可证是 Elastic-2.0，不是 MIT**，商用前自己看一眼。

```bash
pi install npm:context-mode
```

## 5. pi-custom-system-prompt：自己的系统提示词<span id="pi-custom-system-prompt"></span>

[pi-custom-system-prompt](https://pi.dev/packages/pi-custom-system-prompt) 从 `~/.pi/agent/system-prompts/*.md` 读取提示词，每轮对话注入，不绑定任何模型或 provider。

目录里可以放多个 `.md`，切换后**下一条消息就生效**，不用 `/new` 或重启：

```text
/system-prompt-info     查看路径、大小、模式、状态
/system-prompt-toggle   启用/停用
/system-prompt-reload   重新读取
/system-prompt-mode     replace | append
/system-prompt-show     预览前 800 字符
/system-prompt-select   切换文件
```

两种模式：`append`（默认，保留 Pi 默认提示词，额外追加，最安全）和 `replace`（用自定义提示词作基底，但 Pi 仍会补上工具列表、项目上下文、skills 块、日期和工作目录，所以不会丢东西）。

```bash
pi install npm:pi-custom-system-prompt
mkdir -p ~/.pi/agent/system-prompts
```

## 6. @pi-unipi/notify：完成时推送到手机<span id="pi-notify"></span>

长任务跑完人不在电脑前是常事。[@pi-unipi/notify](https://pi.dev/packages/@pi-unipi/notify) 把 Agent 生命周期事件推到你手机上。

支持平台：

- **原生桌面通知**：Windows 用 SnoreToast（无需管理员），macOS 用 terminal-notifier，Linux 用 notify-send / libnotify，零配置
- **Gotify**
- **Telegram**
- **ntfy**

还支持「输入后静默」——你刚敲过键盘就说明人在盯着，此时不再打扰。配置在 `/unipi:notify-settings`，也可用 `/unipi:notify-set-gotify`、`notify-set-tg`、`notify-set-ntfy`、`notify-test` 分别设置和测试。

```bash
pi install npm:@pi-unipi/notify
```

## 7. pi-interactive-shell：跑交互式 CLI 和子 Agent<span id="pi-interactive-shell"></span>

有些活儿必须交互式：`vim`、`psql`、`ssh`、`git rebase -i`、`docker logs -f`。[pi-interactive-shell](https://pi.dev/packages/pi-interactive-shell) 让 Pi 在一个可观察的 TUI 浮层里跑它们——你看得到全程，随时能接管。

四种模式：

| 模式 | 行为 | 适合 |
| --- | --- | --- |
| `interactive` | 浮层，你随时接管 | 编辑器、REPL、SSH |
| `hands-free` | 轮询状态，安静更新 | dev server、构建 |
| `dispatch` | 完成时通知，不轮询 | 派活给子 Agent |
| `monitor` | 只在触发条件命中时唤醒 | 守 watcher、日志、测试 |

用户侧命令是 `/spawn`、`/attach`、`/dismiss`——不需要手写工具调用。

```bash
pi install npm:pi-interactive-shell
```

## 8. pi-custom-provider-fix：配置自定义 LLM 接口<span id="pi-custom-provider-fix"></span>

想接第三方 OpenAI 兼容接口，手改 `models.json` 很痛苦。[youugiuhiuh/pi-custom-provider-fix](https://github.com/youugiuhiuh/pi-custom-provider-fix) 提供 `/provider-setup` 向导，支持接口类型选择、模型发现、模型元数据、兼容性覆盖、API Key 和 OAuth 流程。

它是 [`d4rw1nz/pi-custom-provider`](https://github.com/d4rw1nz/pi-custom-provider) 的 fork，修的核心问题是**模型预设列表为空**。原因是预设选择器是同步的，而 models.dev 目录是异步拉取的——fork 加了缓存 + 预取（`prefetchModelCatalog`），并放宽了 `catalogApi` 过滤（models.dev 不声明 wire API，之前会把远程模型全部过滤掉）。改完之后较新的模型（比如 `deepseek-v4.1-flash` 及带区域后缀的变体）才会出现在预设里。

```bash
pi install git:github.com/youugiuhiuh/pi-custom-provider-fix
```

重启 Pi 后执行 `/provider-setup`。

## 9. @mjakl/pi-subagent：委派给专职 Agent<span id="pi-subagent"></span>

[@mjakl/pi-subagent](https://pi.dev/packages/@mjakl/pi-subagent) 让你像对主 Agent 说话一样派活：「review 这个 diff」「找一下认证在哪里实现的」，主 Agent 自己判断何时委派、把结果折回对话。

不用你写 JSON 或直接调工具。每个子 Agent 跑在独立的 Pi 进程里，delegated work 在 TUI 里带流式进度。第一次运行会自动创建一个只读的 `explore` 启动 Agent。

Agent 定义就是带 YAML frontmatter 的 Markdown：

```text
用户级：~/.pi/agent/agents/*.md
项目级：.pi/agents/*.md（需显式信任项目）
```

同名冲突项目级优先。description 决定主 Agent 何时选它，正文是子 Agent 的额外系统提示词。

⚠️ 升级到 3.1.0 前，先等正在跑的委派结束并重启所有父 Pi 进程——新旧版本不要并发访问同一个持久子会话。已有 session 文件不需要迁移。

```bash
pi install npm:@mjakl/pi-subagent
```

## 10. addyosmani/agent-skills：25 个工程技能<span id="agent-skills"></span>

最后是唯一一个非 Pi 包的：[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)，把资深工程师的工作流编码成技能，覆盖开发全生命周期。

```text
  DEFINE          PLAN           BUILD          VERIFY         REVIEW          SHIP
 ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐
 │ Idea │ ───▶ │ Spec │ ───▶ │ Code │ ───▶ │ Test │ ───▶ │  QA  │ ───▶ │  Go  │
 │Refine│      │ PRD  │      │ Impl │      │Debug │      │ Gate │      │ Live │
 └──────┘      └──────┘      └──────┘      └──────┘      └──────┘      └──────┘
  /spec          /plan          /build        /test         /review       /ship
```

9 个命令各自激活对应技能：`/spec`、`/plan`、`/build`、`/test`、`/constraints`、`/review`、`/webperf`、`/code-simplify`、`/ship`。其中 `/build auto` 会在你批准一次计划后自主跑完所有任务（但每项仍独立测试、独立提交，遇到失败或高风险步骤会暂停）。

共 25 个技能，包括 `code-review-and-quality`、`test-driven-development`、`frontend-ui-engineering`、`security-and-hardening`、`debugging-and-error-recovery`、`constraint-driven-development`、`doubt-driven-development` 等；也会按场景自动激活——设计 API 触发 `api-and-interface-design`，做 UI 触发 `frontend-ui-engineering`。

本仓库规定用 Bun，所以安装走 `bunx`：

```bash
bunx skills add addyosmani/agent-skills            # 装全部 25 个
bunx skills add addyosmani/agent-skills --list     # 先浏览
bunx skills add addyosmani/agent-skills --skill code-review-and-quality
```

⚠️ **单技能安装只复制 `skills/<name>/`，不含仓库根部的 `references/`**，所以引用共享 checklist 的路径会失效。要么整仓装，要么 clone 后手动补 `references/`。

## 怎么搭配

按痛点选，不用全装：

```text
经常查资料        → pi-web-access
大项目、找不到调用链 → pi-codegraph
嫌 Agent 过度设计  → ponytail
上下文老是不够    → context-mode
想固定人设/纪律    → pi-custom-system-prompt
长任务怕错过      → @pi-unipi/notify
要跑交互式 CLI    → pi-interactive-shell
接第三方模型      → pi-custom-provider-fix
想并行干活        → @mjakl/pi-subagent
想要成套工程规范  → addyosmani/agent-skills
```

有两个功能重叠需要注意：`context-mode` 和 `pi-web-access` 都会影响工具调用方式，`context-mode` 更激进（强制沙箱执行），`pi-web-access` 更聚焦联网能力；同时装没问题，但路由规则可能需要用 `ctx_purge` / 重启确认一下实际生效行为。

## 一键安装

```bash
pi install npm:pi-web-access
pi install npm:@vndv/pi-codegraph
pi install npm:@dietrichgebert/ponytail
pi install npm:context-mode
pi install npm:pi-custom-system-prompt
pi install npm:@pi-unipi/notify
pi install npm:pi-interactive-shell
pi install git:github.com/youugiuhiuh/pi-custom-provider-fix
pi install npm:@mjakl/pi-subagent
bunx skills add addyosmani/agent-skills
```

装完在 Pi 里 `/reload`，用 `pi list` 确认加载。

## 一句提醒

Pi 官方的包页面都挂着同一句安全提示，我觉得值得原样转述：**Pi 包可以执行代码并影响 Agent 行为，安装第三方包前请先看源码。**

上面这些里 `context-mode` 会接管工具路由、`pi-custom-provider-fix` 会写你的模型凭证、`pi-web-access` 会读你配的搜索 API key——都不是零风险的。公司设备或敏感仓库，建议先在容器里过一遍。

## 参考

- [pi.dev/packages](https://pi.dev/packages)
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
- [vercel-labs/skills CLI](https://github.com/vercel-labs/skills)
