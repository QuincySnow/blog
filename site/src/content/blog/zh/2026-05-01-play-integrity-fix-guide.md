---
title: "Play Integrity Fix 指南 2025 — Magisk / KernelSU / KSU Next"
description: "在已Root的安卓设备上通过强Play Integrity检查的完整指南，支持所有ROM"
pubDatetime: 2026-05-01T00:00:00Z
modDatetime: 2026-05-01T00:00:00Z
draft: false
tags:
  - Android
  - Root
  - Magisk
  - KernelSU
  - Play Integrity
  - 安全
lang: zh
---

⚠️ **警告：请根据你的Root方案选择正确的方法，切勿混用Magisk和KernelSU/APatch。**

---

## 方法一：Magisk（已启用Zygisk）

### 所需下载

- Play Integrity Fork（v14.1）
- Tricky Store（v1.4.0）
- TSupport-Advance
- Key Attestation
- Play Integrity API Checker

### 步骤 1：移除冲突模块

卸载之前安装的 Play Integrity Fix 或其他 root 隐藏模块。

### 步骤 2：安装所需模块

在 Magisk > Modules 中按顺序安装上述模块。

🔁 重启设备。

### 步骤 3：配置 Magisk DenyList

1. 打开 Magisk > Settings
2. 启用 Enforce DenyList
3. 添加以下应用：
   - com.google.android.gms
   - com.android.vending
   - com.google.android.gsf
   - 其他需要通过 integrity 的应用（如 WhatsApp、银行应用等）

🔁 重启设备。

### 步骤 4：配置 TSupport-Advance

1. 打开 Magisk > Modules
2. 点击 TSupport-Advance > Action Button
3. 按提示按音量上键选择所有选项
4. 等待模块完成

🔁 重启设备。

### 步骤 5：清除应用数据并验证

1. 进入 Settings > Apps > Google Play Store / Play Services / 目标应用
2. 清除缓存和数据

🔁 重启设备。

安装 Play Integrity API Checker，确认以下检查全部通过：

- ✅ Basic Integrity
- ✅ Device Integrity
- ✅ Strong Integrity

### 步骤 6：修复 Strong Integrity（如需要）

如果 Strong Integrity 失败或仅通过 Basic Integrity：

1. 在 Magisk 中安装 Pixel prop 模块
2. 重启设备
3. 重新运行 Play Integrity API Checker

---

## 方法二：KernelSU / KSU Next / APatch

### 所需下载

1. [Zygisk Next（推荐）](https://github.com/Dr-TSNG/ZygiskNext) / [ReZygisk](https://github.com/PerformanC/ReZygisk) / [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
2. [Play Integrity Fork](https://github.com/osm0sis/PlayIntegrityFork)
3. [microG](https://microg.org/)（两个组件）
4. [SUSFS4KSU](https://github.com/sidex15/susfs4ksu-module)

### 步骤 1：安装 Zygisk 变体

安装与你的 root 环境兼容的 Zygisk 实现。

### 步骤 2：安装所需模块

安装上述所有模块。

🔁 重启设备。

### 步骤 3：安装Aurora Store

可安装F-Droid去安装管理开源软件们 [F-Droid](https://f-droid.org/en/)最推荐
或在[Aurora Store](https://store.auroraoss.com/)安装也行
