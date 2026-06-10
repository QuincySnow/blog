---
title: AM4 平台在 Windows 11 25H2 及以上：兼容性、驱动支持与性能优化指南（2026 更新）
description: Ryzen 2000~5000 系列在 Windows 11 25H2 完全兼容，PBO 与 Curve Optimizer 优化指南
pubDatetime: 2026-03-12T00:00:00Z
modDatetime: 2026-03-12T00:00:00Z
draft: false
tags:
  - amd
  - ryzen
  - am4
  - windows11
  - 25h2
  - pbo
  - curve-optimizer
  - 教程
  - 硬件
lang: zh
---

AM4 平台（Ryzen 2000~5000 系列，包括 3000/5000 X3D 型号）在 **Windows 11 25H2**（2025 更新版，代号 Windows 11 2025 Update）及更高版本下**完全兼容且官方支持**。AMD 和 Microsoft 都没有在 25H2 引入针对 AM4 的新硬件门槛，平台仍能流畅运行，并通过最新驱动获得稳定性提升。

---

## 兼容性现状（2026 年）

- **Microsoft 官方支持**：Windows 11 25H2 支持 AMD Ryzen 2000 系列及以上（包括 Ryzen 3000、4000 G 系列、5000 系列及 X3D 变体）。Ryzen 5000（Zen 3）完全在支持列表中，无需绕过或补丁。
- **AMD 芯片组驱动**：AMD 已多次更新 Ryzen 芯片组驱动（例如 7.11.26.2142、8.01.20.513 等），明确添加 **Windows 11 25H2 支持**。覆盖 B450、B550、X570、A520 等 AM4 主板，包括 PMF、3D V-Cache 优化、RAID 等组件。
- **已知小问题**：
  - 旧 BIOS 或旧驱动下，升级 25H2 可能出现安装卡顿或重启循环。
  - 解决方案：升级主板 BIOS 到最新版（AGESA 1.2.0.x+），安装最新 AMD 芯片组驱动。
  - RAID 配置用户注意：用光驱安装时 RAID 驱动可能不加载，建议用 U 盘安装。
- **NPU/AI 要求**：25H2 的 NPU 优化仅为 Copilot+ PC 的可选特性，不是强制要求。AM4 平台无 NPU 也能正常使用所有功能。

升级方式：通过 Windows Update 直接获取 25H2（开启"尽快获取最新更新"开关），或用微软官网 ISO 手动升级。

---

## 升级前准备

1. 更新主板 BIOS 到最新版（厂商官网下载）。
2. 下载并安装最新 AMD 芯片组驱动（AMD 官网，选择 AM4 平台）。
3. 备份数据，创建系统还原点。
4. 确认 BIOS 中 TPM 2.0（fTPM）和 Secure Boot 已启用。

---

## 性能优化指南（全部使用 AMD 官方 Ryzen Master）

Windows 11 25H2 + 最新驱动后，AM4 平台性能表现优秀。**所有超频、PBO、Curve Optimizer 等性能调优操作，强烈推荐且仅使用 AMD 官方 Ryzen Master 软件**（amd.com 下载）。请避免在 BIOS 中手动调整超频相关设置，以防冲突或不稳定。

### 为什么必须用 Ryzen Master 而不是其他方式？

- 实时调整（on-the-fly）：无需重启即可修改 PBO、Curve Optimizer 等，测试和迭代更快。
- AMD 官方保证：兼容性、安全性最高，避免电压异常、WHEA 错误或蓝屏。
- 避免冲突：BIOS 超频设置 + 第三方工具 + Ryzen Master 混用容易导致参数覆盖、系统不稳。
- 简单易用：图形界面、一键 profile 切换、自动监控，适合所有 AM4 用户。

**推荐步骤**：

1. **卸载所有非官方超频工具**（强烈建议）：
   - Clock Tuner for Ryzen (CTR)
   - Universal x86 Tuning Utility (UXTU)
   - PBO2 Tuner / SMU Debug Tool
   - 主板厂商工具（如 ASUS AI Suite、MSI Dragon Center、Gigabyte EasyTune 等）
   - 这些工具可能与 Ryzen Master 冲突，或已过时导致问题。
   - 控制面板 → 程序和功能 → 卸载干净，只保留 Ryzen Master。

2. **BIOS 基础设置**（仅限非超频选项）：
   - **CPPC**（Collaborative Processor Performance Control）：**Enabled**  
     简要介绍：AMD 与 Windows 协作的性能控制机制，让 CPU 以极细粒度（<1ms 切换）请求频率，提升响应速度和 boost 效率。没有它，频率切换慢，日常/游戏容易顿卡。
   - **CPPC Preferred Cores**（或 Dynamic Preferred Cores）：**Enabled**  
     简要介绍：利用 CPU 核心硅质差异（尤其是多 CCD 型号），让 Windows 优先把单线程/关键任务分配到"最好核心"（最高 boost 潜力）。对游戏帧率稳定性和单核响应特别重要。
   - **Global C-State Control**：**Enabled**  
     简要介绍：控制 CPU 核心进入深度休眠（C6/C7 状态），idle 时功耗/温度大幅降低，同时让 Precision Boost 算法更智能、更持久地提升频率。关闭后 idle 温度高、boost 不稳。
   - Core Performance Boost (CPB) → Enabled
   - XMP/DOCP → 开启内存频率（如果支持）
   - **不要在 BIOS 中调整 PBO、Curve Optimizer 等超频参数**，全部交给 Ryzen Master 处理。

3. **Ryzen Master 中的核心优化**：
   - **PBO**（Precision Boost Overdrive）：设为 Advanced
     - PPT：185–220W
     - TDC：125–160A
     - EDC：160–190A
     - Max Boost Override：+200MHz
   - **Curve Optimizer**（负值 undervolt）：
     - All Cores：从 Negative -20 开始，逐步到 -30（视硅质和散热）
     - Per Core：最佳核心 -15~-20，其余 -25~-35
   - **测试稳定性**：用 CoreCycler 或 OCCT 跑压力测试，避免 WHEA 错误或蓝屏。
   - **监控**：使用 Ryzen Master 自带监控，或 HWInfo（温度别超 90°C，理想 80–85°C）。

4. **Windows 系统调优**：
   - 电源计划：AMD Ryzen Balanced 或 High Performance。
   - 启用硬件加速 GPU 调度（设置 > 系统 > 显示 > 图形）。
   - 游戏模式开启，关闭不必要后台服务。

---

## 预期效果

- 兼容性：25H2 无问题，驱动优化后更稳。
- 性能：通过 Ryzen Master 的 PBO + Curve Optimizer，多核提升 5–10%，温度下降 5–15°C，游戏 1% lows 更好。
- 日常体验：响应更快，顿卡减少（CPPC 和 Preferred Cores Enabled 后尤为明显）。

AM4 平台虽已 EOL，但 2026 年仍能很好支持 Windows 11 25H2 及以上。**优先使用 AMD 官方 Ryzen Master 进行所有超频和性能调优**，保持 BIOS + 驱动更新，就能获得最佳表现。

欢迎分享你的 AM4 配置和 25H2 使用心得～
