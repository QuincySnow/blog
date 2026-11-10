---
title: "Pi 插件推荐：11 个真正提升日常开发体验的扩展"
description: "推荐 11 个实测可用的 Pi 扩展与技能：pi-web-access、pi-hermes-memory、ponytail、context-mode、pi-custom-system-prompt、pi-notify、pi-interactive-shell、pi-subagent、addyosmani/agent-skills、@juicesharp/rpiv-ask-user-question 与 pi-cc-extensions，附安装命令与适用场景"
pubDatetime: 2026-10-06T00:00:00Z
modDatetime: 2026-10-07T00:00:00Z
draft: false
tags:
  - AI
  - Pi
  - 工具链
  - 效率
lang: zh
---

Pi 本身内置 MCP、Codemode、Subagent 调度等能力，但真正决定「用得顺不顺手」的，往往是几个扩展和技能包。这篇文章推荐 11 个我实际在用的，每个都给出安装命令、核心能力、适用场景，以及一些需要注意的地方。

先给个速查表：

| 包                                   | 一句话                                   | 类型              |
| ------------------------------------ | ---------------------------------------- | ----------------- |
| `pi-web-access`                      | 搜索 + 网页/视频内容提取，零配置         | extension         |
| `pi-hermes-memory`                   | 持久化记忆 + 会话搜索 + 技能管理         | extension + skill |
| `ponytail`                           | 让 Agent 少写代码（实测 -54% LOC）       | extension + skill |
| `context-mode`                       | 沙箱执行 + 知识库，省上下文窗口          | extension + skill |
| `pi-custom-system-prompt`            | 从 Markdown 注入自定义系统提示词         | extension         |
| `@pi-unipi/notify`                   | 任务完成后推送到手机/桌面                | extension + skill |
| `pi-interactive-shell`               | 在 TUI 浮层里跑交互式 CLI 和子 Agent     | extension + skill |
| `@mjakl/pi-subagent`                 | 委派给专职子 Agent                       | extension         |
| `addyosmani/agent-skills`            | 25 个工程技能 + 9 个生命周期命令         | skills            |
| `@juicesharp/rpiv-ask-user-question` | 让模型先问你，别替你猜                   | extension         |
| `pi-cc-extensions`                   | 类 Claude Code TUI + CC Dark/Light 主题  | extension + theme |

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

## 2. pi-hermes-memory：跨会话持久记忆与历史搜索<span id="pi-hermes-memory"></span>

每次退出终端或开启新会话，Agent 都会把之前的上下文忘得一干二净，偏好、踩过的坑、讨论过的架构决策每次都要重复交代。[chandra447/pi-hermes-memory](https://github.com/chandra447/pi-hermes-memory) 把 Hermes Agent 的两层记忆与技能进化系统完整移植到了 Pi 上。

它给 Pi 挂载了 5 个核心工具：

```text
session_search   memory_search    skill_manage
memory_add       memory_replace   memory_remove
```

核心能力包括：

- **会话全文检索（Session Search）**：基于 SQLite FTS5，随时用自然语言检索过往所有会话记录（例如「上周关于认证方案讨论了什么？」）
- **持久化分层记忆（Persistent Memory）**：支持全局记忆（`~/.pi/agent/pi-hermes-memory/`）与项目级记忆（`~/.pi/agent/projects-memory/<project>/`），分类管理用户画像（`user`）、项目规范（`project`）、通用事实（`memory`）以及踩坑教训（`failure`）
- **程序化技能（Procedural Skills）**：Agent 在解决复杂问题后，能通过 `skill_manage` 把「操作规程」提炼并保存为 Pi 原生的 `SKILL.md`，变成后续随时可自动调用的技能
- **后台自动学习与纠错捕获**：每 10 轮对话（或 15 次工具调用）在后台审视提炼记忆；检测到用户说「别这么做」或纠正指令时自动保存教训
- **内置安全扫描（Secret Scanning）**：在持久化前拦截 API Key、Token、私钥等敏感凭证，避免泄露进记忆库
- **记忆老化与自动整理（Auto-Consolidation）**：记忆带时间戳，空间占满时自动合并压缩，不会粗暴截断

### 装完必做的一步

安装完成后，在 Pi 交互界面中**先跑一次**历史索引：

```text
/memory-index-sessions   # 必跑：把装插件之前的所有历史会话批量建好 SQLite FTS5 索引
/memory-interview        # 可选：问答式交互，花两分钟生成你的初始个人画像与技术偏好
```

### 其余场景：基本完全全自动

跑完一次性索引后，日常使用**几乎不需要再手动敲命令**，整个系统全部在后台静默运转：

- **后台自动复盘提炼**：对话进行中自动审视并提炼关键事实，无需人工干预
- **纠错即时自动捕获**：指出「别这么写」或更正代码习惯时，立即自动持久化为踩坑教训
- **增量实时索引**：新产生的会话实时写入 SQLite，不再需要重复手动 run index
- **容量自动整理**：空间占满时自动做语义合并与淘汰，不会丢数据或报错中断
- **凭证自动拦截**：静默阻断 API Key、Token 与私钥落地
- **自然语言直接调用**：查历史只需直接问，模型会自动调用 `session_search` / `memory_search` 去翻库

唯一值得手动用用的日常命令是 **`/memory-pin <规则>`**——把某些不能妥协的硬性铁律（如「本项目强制使用 Bun」「回复只给代码 diff 不写废话」）永久置顶在每个会话的最前列；想看存了什么，随时 `/memory-insights` 瞄一眼即可。

```bash
pi install npm:pi-hermes-memory
```

要求 Node.js 22+。数据保存在本地 SQLite 和 Markdown 文件中，无需外部数据库或额外 MCP 服务。

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

| 指标       | vs 无 skill 基线 |
| ---------- | ---------------- |
| LOC        | **-54%**         |
| tokens     | -22%             |
| 成本       | -20%             |
| 时间       | -27%             |
| 安全项保留 | 100%             |

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

| 模式          | 行为                   | 适合                   |
| ------------- | ---------------------- | ---------------------- |
| `interactive` | 浮层，你随时接管       | 编辑器、REPL、SSH      |
| `hands-free`  | 轮询状态，安静更新     | dev server、构建       |
| `dispatch`    | 完成时通知，不轮询     | 派活给子 Agent         |
| `monitor`     | 只在触发条件命中时唤醒 | 守 watcher、日志、测试 |

用户侧命令是 `/spawn`、`/attach`、`/dismiss`——不需要手写工具调用。

```bash
pi install npm:pi-interactive-shell
```

## 8. @mjakl/pi-subagent：委派给专职 Agent<span id="pi-subagent"></span>

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

## 9. addyosmani/agent-skills：25 个工程技能<span id="agent-skills"></span>

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

## 10. @juicesharp/rpiv-ask-user-question：让它先问你<span id="ask-user-question"></span>

[@juicesharp/rpiv-ask-user-question](https://pi.dev/packages/@juicesharp/rpiv-ask-user-question) 只给 Pi 加一个工具——`ask_user_question`——但挡住的是最贵的一类损失：模型替你猜需求，猜错了你要花一小时撤销。

给一句带真实决策的指令（比如「给 API client 加缓存」），模型不再自己拍板，终端底部弹出问卷：

```text
 Feature Type │ Design Tab │ Testing │ Release │ Submit
───────────────────────────────────────────────────────
 Which real development task are we planning right now?

  1. Bug fix (Recommended)   a defect to reproduce and fix
  2. New feature             net-new behaviour or surface
  3. Refactor                same behaviour, better shape
  4. Perf tuning             make an existing path faster

 Type something.
 ↑↓ move · Enter choose · n note · Tab switch · Esc abandon
```

- 一次最多 **4 个问题**装进一个带页签的对话框，不是四次打断；Submit 页先列一遍答案，并点名哪些还空着
- 每题 **2–4 个作者写好的选项**，每个自带一行说明，讲代价而不只是标签
- 永远能自己写：每题都追加一行 `Type something.`。输入时 `Shift+Enter` 换行、`Ctrl+G` 拉外部编辑器、`Ctrl+U` 清空；翻别的选项再回来草稿还在
- 选项可以挂 markdown `preview`（ASCII 草图、代码、图表、配置），在选项旁边用带边框的盒子渲染；宽终端并排、窄于 100 列则堆到下方
- `n` 加备注：问题页上是单题备注，Submit 页上是全局备注，分别以 `user notes:` / `global note:` 交给模型，且备注不算作答
- `Ctrl+]` 折叠对话框去翻上面的对话记录，再展开答案不丢

```bash
pi install npm:@juicesharp/rpiv-ask-user-question
```

装完重启 Pi 会话，零配置可用。可选项在 `~/.config/rpiv-ask-user-question/config.json`（只读不写）：`collapseKey` 换折叠键（默认 `ctrl+]`，`"off"` 关闭）、`guidance.promptSnippet` 调它「多爱问」、`guidance.description` 整体替换工具描述。JSON 写坏退回默认并给警告，不会报错中断。

要求 Node.js 22+ 和带交互终端（或 RPC/ACP host）的 Pi。**非交互运行里工具会从列表里摘掉**，而不是每次调用都失败。没有原生依赖、不需要编译器、不需要 API key——它自己不发模型请求。

⚠️ 两个坑：`Ctrl+]` 在 `]` 位于上档的键盘布局（如拉美布局）上按不出来，把 `collapseKey` 改成 `"alt+o"` 即可；另外若 Pi 运行期间有包管理器改动了磁盘上的模块，对话框会加载失败并退回成在聊天里提问——修好安装后重启，进程内无法恢复。

## 11. pi-cc-extensions：Claude Code 风格界面与主题<span id="pi-cc-extensions"></span>

[minuque/pi-cc-extensions](https://pi.dev/packages/pi-cc-extensions) 是这批里唯一同时声明 **extension + theme** 的包：它把 Pi 的 TUI 输出改成类 Claude Code 的样式，并随包附带两套主题 `cc-dark` / `cc-light`，装完用 `/theme` 直接切换。

| 功能                    | 说明                                                                    | 入口                 |
| ----------------------- | ----------------------------------------------------------------------- | -------------------- |
| Claude Code UI          | 工具摘要、折叠展开、rich edit/write diff，`on` / `compact` / `off` 三档 | `/ccstyle`           |
| 主题                    | CC Dark、CC Light                                                       | `/theme`             |
| 上下文检查              | 看上下文占用，预览 System prompt、Memory、Skills、Tools definition      | `/context`           |
| Session / Subagent 引用 | 搜索并注入历史 Session 或现有 SubAgent 的上下文                         | `@`                  |
| Markdown 增强           | Mermaid 图、提示框、URL 链接化                                          | 自动生效             |
| Fullscreen mode         | 工具卡单击展开、hover 高亮、回到底部按钮                                | `TUIMODE=fullscreen` |
| 状态栏                  | 模型、上下文、缓存、费用、git，并适配 `@narumitw/pi-usage` 实时显额度   | `/ccstyle`           |

`/ccstyle` 是六页签配置面板（Style / Features / UI / Diff / Thinking / Footer），配置落在 `~/.pi/agent/pi-cc-extensions.json`。

```bash
pi install npm:pi-cc-extensions
```

要求 Node.js ≥ 22.19.0、Pi `^0.84.0`。MIT 许可，rich diff 改编自 [`MasuRii/pi-tool-display`](https://github.com/MasuRii/pi-tool-display)。

### 底栏图标与 Nerd Font 兜底<span id="nerd-font"></span>

底栏默认用 Nerd Font 图标（`footerNerdIcons: true`）：git 分支、缓存命中，以及 MCP 连接数 `U+F06A5`（`md-power_plug`）。

字体不对时，链路是这样断的：

```text
pi-cc-extensions 要画 U+F06A5
        ↓
JetBrains Mono NL 没有这个 glyph
        ↓
终端向 fontconfig 要 fallback
        ↓
fontconfig 找不到 Nerd Font Symbols
        ↓
渲染成 □（豆腐块）
```

先确认到底缺不缺：

```bash
fc-list ':charset=f06a5'      # 谁有 U+F06A5，空 = 没有
fc-match ':charset=f06a5'     # 实际会 fallback 到谁
```

缺就装 Symbols Only（几百 KB，只补图标、不动正文字体）：

```bash
mkdir -p ~/.local/share/fonts && cd ~/.local/share/fonts
curl -LO https://github.com/ryanoasis/nerd-fonts/releases/latest/download/NerdFontsSymbolsOnly.zip
unzip -o NerdFontsSymbolsOnly.zip && rm NerdFontsSymbolsOnly.zip
fc-cache -fv
```

macOS 解压到 `~/Library/Fonts/` 即可；想连正文字体一起换成打过补丁的版本，同仓库还有 `JetBrainsMono.zip`。

不想装字体也有退路——`~/.pi/agent/pi-cc-extensions.json` 里把 `"footerNerdIcons"` 设为 `false`，底栏退回纯文本，功能不受影响。

## 怎么搭配

按痛点选，不用全装：

```text
经常查资料        → pi-web-access
总记不住偏好/历史 → pi-hermes-memory
嫌 Agent 过度设计  → ponytail
上下文老是不够    → context-mode
想固定人设/纪律    → pi-custom-system-prompt
长任务怕错过      → @pi-unipi/notify
要跑交互式 CLI    → pi-interactive-shell
想并行干活        → @mjakl/pi-subagent
想要成套工程规范  → addyosmani/agent-skills
模型老替你猜需求  → @juicesharp/rpiv-ask-user-question
想要好看主题界面  → pi-cc-extensions
```

有两个功能重叠需要注意：`context-mode` 和 `pi-web-access` 都会影响工具调用方式，`context-mode` 更激进（强制沙箱执行），`pi-web-access` 更聚焦联网能力；同时装没问题，但路由规则可能需要用 `ctx_purge` / 重启确认一下实际生效行为。

## 一键安装

```bash
pi install npm:pi-web-access
pi install npm:pi-hermes-memory
pi install npm:@dietrichgebert/ponytail
pi install npm:context-mode
pi install npm:pi-custom-system-prompt
pi install npm:@pi-unipi/notify
pi install npm:pi-interactive-shell
pi install npm:@mjakl/pi-subagent
pi install npm:@juicesharp/rpiv-ask-user-question
pi install npm:pi-cc-extensions
bunx skills add addyosmani/agent-skills
```

装完在 Pi 里 `/reload`，用 `pi list` 确认加载。

## 一句提醒

Pi 官方的包页面都挂着同一句安全提示，我觉得值得原样转述：**Pi 包可以执行代码并影响 Agent 行为，安装第三方包前请先看源码。**

上面这些里 `context-mode` 会接管工具路由、`pi-web-access` 会读你配的搜索 API key、`pi-hermes-memory` 会在本地 SQLite 和 Markdown 记录历史上下文与记忆（虽有 Secret Scanning 拦截敏感凭证）——都不是零风险的。公司设备或敏感仓库，建议先在容器里过一遍。

## 参考

- [pi.dev/packages](https://pi.dev/packages)
- [chandra447/pi-hermes-memory](https://github.com/chandra447/pi-hermes-memory)
- [ryanoasis/nerd-fonts](https://github.com/ryanoasis/nerd-fonts)
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
- [vercel-labs/skills CLI](https://github.com/vercel-labs/skills)
