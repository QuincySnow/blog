---
title: OpenCode 本地工具链实战：Superpowers、CodeGraph、知识图谱与上下文管理
description: 一套面向长会话与复杂代码库的 OpenCode 本地工作流：流程、代码理解、上下文管理和通知
pubDatetime: 2026-04-16T00:00:00Z
lang: zh
tags: ["OpenCode", "AI 编程", "效率工具"]
---

# OpenCode 本地工具链实战：Superpowers、CodeGraph、知识图谱与上下文管理

一段长会话里，真正容易失控的通常不是模型能力，而是流程、代码定位和上下文。下面这套本地工具链把这些问题拆开处理：Superpowers 管流程，CodeGraph 和知识图谱负责理解代码，context-mode 管理工具输出，DCP 清理不再需要的上下文；桌面通知则只是可选的收尾体验。

## 这套组合解决什么问题？

复杂代码库不适合每次都从文件树开始搜索；长会话也不该把每一次命令输出都永久留在上下文中。把职责分开后，OpenCode 可以在需要时定位符号和调用路径，把大输出留在本地索引中，再把流程约束和上下文维护交给专门工具。

本文涉及的项目：

- [CodeGraph](https://github.com/colbymchenry/codegraph)
- [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp)
- [context-mode](https://github.com/mksglu/context-mode)
- [Dynamic Context Pruning](https://github.com/Opencode-DCP/opencode-dynamic-context-pruning)

## 六层职责分工

1. **Superpowers：流程层。** 用于把需求澄清、排查、测试和完成前验证变成明确步骤，避免直接跳到实现。
2. **CodeGraph：符号与调用路径层。** 为仓库建立本地代码图后，可以直接围绕符号、文件或问题探索关联代码。
3. **codebase-memory-mcp：知识图谱层。** 通过 MCP 工具 `index_repository` 建立索引，再用 `search_graph` 找到函数、类、路由等结构化对象，并用 `trace_path` 追踪调用或数据路径。
4. **context-mode：上下文处理层。** `ctx_execute` 和 `ctx_execute_file` 让分析在沙箱中完成；`ctx_batch_execute` 适合批量收集命令结果；`ctx_search` 用于从已索引内容中检索需要的片段。
5. **DCP：上下文修剪层。** 它负责在会话中清理不再需要的工具输出，让当前任务保留更相关的上下文。
6. **Notificator：可选通知层。** 仅在需要离开终端等待任务完成时，再为 WSL/Windows 配置桌面通知。

## 安装与初始化

先按各项目官方文档完成对应安装。CodeGraph 的官方 CLI 流程如下：

```bash
codegraph install
codegraph init
```

初始化后，可以从一个具体问题开始探索代码：

```bash
codegraph explore "authentication flow"
```

codebase-memory-mcp 和 context-mode 通过 OpenCode 的 MCP 工具面使用即可。前者的重点是先用 `index_repository` 索引仓库，再按需调用 `search_graph` 和 `trace_path`；后者则把耗时命令或大文件的分析结果留在可检索的本地上下文中。这里不提供未经官方来源验证的安装命令。

Dynamic Context Pruning 可按其官方命令全局安装：

```bash
opencode plugin @tarquinen/opencode-dcp@latest --global
```

## 每天如何使用

从任务而不是工具开始：先让 Superpowers 帮你确定是排查、实现还是审查；需要理解现有逻辑时，优先用 CodeGraph 或知识图谱定位符号和路径，而不是反复全文搜索。

遇到大文件、构建日志或多条独立命令时，把分析交给 context-mode。`ctx_execute` 适合执行并提炼命令输出，`ctx_execute_file` 适合在不把整份文件带入会话的前提下分析文件，`ctx_batch_execute` 用于成组收集，而 `ctx_search` 只取回后续真正需要的内容。

完成修改后，回到项目本身运行最小而完整的验证命令。DCP 在后台处理会话中已经过时的工具上下文，不需要改变上述工作顺序。

## 可选：WSL 桌面通知

下面的配置**完全可选**，只与使用 WSL 且希望通过 Windows 桌面接收通知的用户有关。它保留 PowerShell 的 BurntToast 安装命令和 `notificator` 配置；不使用 WSL/Windows 时不需要安装或配置它。

首次使用前安装 BurntToast 模块（ PowerShell 中执行）：

```powershell
Install-Module -Name BurntToast -Force -Scope CurrentUser
```

并配置 WSL 专用 PowerShell 弹窗：

```json
{
  "notificator": {
    "command": {
      "enabled": true,
      "path": "pwsh.exe",
      "args": [
        "-NoProfile",
        "-Command",
        "$event = '{event}'; if ($event -in @('permission','complete','error','question')) { New-BurntToastNotification -Text $event, '{message}' -Sound 'Default' }"
      ]
    },
    "events": {
      "user_message": {
        "notification": false,
        "sound": false,
        "command": false
      },
      "session_started": {
        "notification": false,
        "sound": false,
        "command": false
      },
      "permission": {
        "notification": true,
        "sound": true,
        "command": true
      },
      "complete": {
        "notification": true,
        "sound": true,
        "command": true
      },
      "error": {
        "notification": true,
        "sound": true,
        "command": true
      },
      "question": {
        "notification": true,
        "sound": true,
        "command": true
      }
    },
    "suppressWhenFocused": true,
    "suppressInterval": 5
  }
}
```

## 结论

这不是一个靠单一插件解决所有问题的配置。流程、代码理解和上下文管理分别交给合适的工具：Superpowers 提供工作步骤，CodeGraph 与 codebase-memory-mcp 提供仓库级定位能力，context-mode 处理和检索大输出，DCP 维护会话上下文；Windows 通知则按需添加即可。
