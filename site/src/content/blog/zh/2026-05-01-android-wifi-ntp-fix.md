---
title: "Past原生安卓解决WiFi网络受限以及修改NTP服务器"
description: "通过ADB命令解决原生安卓WiFi网络受限问题，并修改NTP服务器配置"
pubDatetime: 2026-05-01T00:00:00Z
modDatetime: 2026-05-01T00:00:00Z
draft: false
tags:
  - Android
  - WiFi
  - ADB
  - NTP
lang: zh
---

## 一、解决网络受限

### 1. 通过ADB命令的方式

先删除默认的地址：

```bash
adb shell settings delete global captive_portal_https_url
adb shell settings delete global captive_portal_http_url
```

再修改新的地址：

```bash
adb shell settings put global captive_portal_https_url https://connect.rom.miui.com/generate_204
adb shell settings put global captive_portal_http_url http://connect.rom.miui.com/generate_204
```

## 二、安装ADB（Windows）

ADB 可使用 winget 或 scoop 安装。

### 方法一：使用 Winget 安装

1. 打开命令提示符或 PowerShell
2. 执行以下命令安装 ADB 和 Fastboot：

```powershell
winget install Google.PlatformTools
```

3. 验证安装

检查 ADB 版本：

```bash
adb version
```

检查 Fastboot 版本：

```bash
fastboot version
```

### 方法二：安装 Google USB Driver（可选）

仅在 Fastboot 模式下连接安卓设备且 Windows 无法识别时需要执行此步骤。

1. **下载驱动**

   下载 [Google USB Driver](https://developer.android.com/studio/run/win-usb)。点击"Download the Google USB Driver ZIP file (ZIP)"即可，除非已安装 Android Studio，否则不需要通过 Android SDK Manager 获取。

2. **解压下载的 zip 文件**

3. **在设备管理器中更新驱动**
   - 将安卓设备进入 Fastboot 模式并连接电脑
   - 打开设备管理器
   - 找到安卓设备（通常在"未知设备"下）
   - 右键点击设备，选择"更新驱动程序"
   - 选择"浏览我的计算机以查找驱动程序"
   - 点击"从计算机的可用驱动程序列表中选取"
   - 点击"我有磁盘"并导航到解压驱动程序的文件夹
   - 选择 `android_winusb.inf` 并按照提示完成安装（如果遇到未签名驱动警告请忽略）

安装完成！

**关键词**：Windows 10, Windows 11, Android, ADB, Fastboot, Google USB Driver, Platform Tools, winget, 设备驱动, 手动安装
