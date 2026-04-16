---
title: OpenCode 插件组合实战：Superpowers + DCP + Notificator 让我的 AI 编码效率起飞
description: 分享一套轻量、高性价比的 OpenCode 插件组合，适合个人开发者
pubDatetime: 2026-04-16T00:00:00Z
lang: zh
tags: ["OpenCode", "AI 编程", "效率工具"]
---

# OpenCode 插件组合实战：Superpowers + DCP + Notificator 让 AI 编码效率起飞

之前试过 oh-my-opencode-slim，但因为 provider 兼容性问题放弃了。后来精简到 **Superpowers + Dynamic Context Pruning (DCP) + Notificator** 这三个插件组合，实测下来性价比极高，适合个人开发者。

今天分享一下这个轻量组合的安装、使用心得和实际效果。

## 为什么选择这三个插件？

- **Superpowers**（obra/superpowers）：给 AI 装上真正的软件工程 SOP（Standard Operating Procedure）。它会自动强化 Planning、TDD（测试驱动开发）、代码审查、git worktree 隔离、根因分析等流程。避免了"随便生成代码"的 vibe coding，让 Plan 更严谨，Build 更可靠。
- **DCP (opencode-dynamic-context-pruning)**：省 token 神器！它非破坏性地剪枝过时工具输出（重复 read file、旧 ls 结果等），单次长会话能轻松节省 30-60% token（有时一次去掉 50k+ 无用上下文）。长迭代 Build 时特别明显，预算敏感的朋友一定会爱上它。
- **Notificator**（mohak34/opencode-notifier + BurntToast）：在 WSL 环境下实现 Windows 桌面 Toast 通知 + 声音提醒。Build 完成、出错、需要人工确认时自动弹窗不用一直盯着终端。

这三个插件**轻量、不冲突、零云依赖风险**（DCP 和 Superpowers 完全本地），完美适配大模型做规划、小模型做迭代的搭配。

## 安装步骤

1. **Superpowers**（最重要，先装）：
   在 OpenCode TUI 中直接输入：
   ```
   Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
   ```
   或者在 `opencode.jsonc` 的 `plugin` 数组中添加：
   ```json
   "superpowers@git+https://github.com/obra/superpowers.git"
   ```

2. **DCP**：
   ```
   opencode plugin install opencode-dynamic-context-pruning@latest
   ```

3. **Notificator**（已配置 BurntToast）：
   在 `opencode.jsonc` 中添加：
   ```json
   "@mohak34/opencode-notifier"
   ```
   并配置 WSL 专用 PowerShell 弹窗（已搞定）。

装完后运行：
```bash
opencode reload
opencode doctor
```
确认三个插件都加载成功。

## 推荐核心配置（~/.config/opencode/opencode.jsonc）

```jsonc
{
  "model": "opencode-go/<your-plan-model>",           // Plan 用强推理模型
  "small_model": "opencode-go/<your-build-model>", // Build/迭代用性价比模型
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "opencode-dynamic-context-pruning",
    "@mohak34/opencode-notifier"
  ],
  "temperature": 0.1,
  "dcp": {
    "enabled": true,
    "strategies": ["duplicate", "ai-analysis", "compress"],
    "protect_recent": 10
  }
}
```

## 实际使用感受

- **Superpowers** 让 AI 不再"随性发挥"，每次 Plan 阶段都会系统性地问问题、拆任务、考虑边缘案例。复杂项目的重构质量明显提升。
- **DCP** 是最实用的省钱插件。以前长会话 token 消耗爆炸，现在稳定下降 40% 左右，月成本直接降下来。
- **Notificator** 用 BurntToast 弹窗非常舒服。跑完一个大迭代后，桌面直接弹出"Build Completed!"，不用一直切换窗口。

整体效果：从"AI 助手"升级成了"带流程纪律 + 省钱 + 提醒"的 mini 开发团队。适合独立开发者，尤其是长期项目。

## 适用场景 & 小建议

- 非常适合全栈项目、重构场景、安全敏感项目。
- 建议先用 Superpowers + DCP 跑熟，再加 Notificator。
- 如果项目更大，可以后续补充 opencode-vibeguard（脱敏私钥）、opencode-worktree（多任务隔离）等。

## 总结

**Superpowers + DCP + Notificator** 是一套高性价比轻量方案。它不追求花里胡哨的多 Agent，而是专注**流程质量 + 成本控制 + 使用体验**。

如果你也在用 OpenCode，强烈推荐试试这套组合！

欢迎评论区交流你的插件心得，或者分享你的 token 节省数据～