---
title: 让 MPV 说中文：uosc 现代化界面安装与中文设置指南
description: 从零安装 MPV 播放器与 uosc 现代化界面，再修改 uosc.conf 将界面切换为简体中文，覆盖 Windows、Linux 与 Android 手机端
pubDatetime: 2026-08-31T00:00:00Z
modDatetime: 2026-08-31T00:00:00Z
draft: false
tags:
  - mpv
  - uosc
  - media-player
  - Windows
  - Linux
  - Android
  - Tooling
lang: zh
---

# 让 MPV 说中文：uosc 现代化界面安装与中文设置指南

**MPV** 是功能最强大的开源播放器之一，但默认的界面（OSC）相当简陋，看起来像"毛坯房"。**uosc** 则是一款现代化、接近式（proximity-based）设计的界面增强脚本，自带完整的**简体中文翻译**。本文带你从零开始：装好 MPV → 装上 uosc → 改一行配置 → 重启后界面就是中文，桌面端 Windows / Linux 与手机端 Android 全覆盖。

## 一、安装 MPV

### Windows

任选一种方式：

- **Scoop（推荐）**：`scoop install mpv`（来自 main bucket 的 shinchiro 构建）。不熟悉 Scoop 可以先看我的 [Scoop 使用指南](/blog/posts/zh/2025-01-12-Scoop)。
- **winget**（官方 CI MSVC 构建）：`winget install --id=mpv-player.mpv-CI.MSVC -e`
- **Chocolatey**：`choco install mpv`
- **手动**：到 [mpv.io/installation](https://mpv.io/installation/) 下载预编译包并解压，把包含 `mpv.exe` 的目录加入 `PATH`。

### Linux

- **Debian / Ubuntu**：`sudo apt install mpv`
- **Fedora**：`sudo dnf install mpv`
- **Arch Linux**：`sudo pacman -S mpv`
- **openSUSE**：`sudo zypper install mpv`
- **Flatpak（任何发行版）**：`flatpak install flathub io.mpv.Mpv`

安装后验证：`mpv --version`。

## 二、安装 uosc

uosc（[GitHub: tomasklaen/uosc](https://github.com/tomasklaen/uosc)）是 MPV 的现代界面，替换默认 OSC，提供时间轴缩略图、菜单、字幕下载等一整套功能。

### 一键脚本安装

**Windows**（PowerShell）：

```powershell
# 可选：首次运行远程脚本需要放开策略
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

irm https://raw.githubusercontent.com/tomasklaen/uosc/HEAD/installers/windows.ps1 | iex
```

**Linux / macOS**（bash，需要 `curl` 和 `unzip`）：

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/tomasklaen/uosc/HEAD/installers/unix.sh)"
```

脚本会自动把 uosc 装进 mpv 配置目录，并在 `script-opts/` 下生成默认的 `uosc.conf`（如果不存在）。

### 手动安装

1. 从 [uosc Releases](https://github.com/tomasklaen/uosc/releases/latest) 下载 `uosc.zip`。
2. 解压到你的 **mpv 配置目录**：
   - **Windows**：`%APPDATA%\mpv\`（即 `C:\Users\<用户名>\AppData\Roaming\mpv\`）
   - **Linux**：`~/.config/mpv/`
   - **Flatpak 版 mpv**：`~/.var/app/io.mpv.Mpv/config/mpv/`
3. 如果目录里还没有 `uosc.conf`，把发布页的 `uosc.conf` 下载后放进 `script-opts/` 子目录。

安装后 `uosc.conf` 的位置：

| 平台            | 路径                                                        |
| --------------- | ----------------------------------------------------------- |
| Windows         | `%APPDATA%\mpv\script-opts\uosc.conf`                       |
| Linux           | `~/.config/mpv/script-opts/uosc.conf`                       |
| Flatpak 版 mpv  | `~/.var/app/io.mpv.Mpv/config/mpv/script-opts/uosc.conf`    |

## 三、把界面改成中文

用编辑器打开 `uosc.conf`，找到 Localization（本地化）段落，内容大致如下：

```
# Localization language priority from highest to lowest.
# Also controls what languages are fetched by `download-subtitles` menu.
# Built in languages can be found in `uosc/intl`.
# `slang` is a keyword to inherit values from `--slang` mpv config.
# Supports paths to custom json files: `languages=~~/custom.json,slang,en`
languages=slang,en
```

把最后一行的默认值改成：

```
languages=zh-hans,slang,en
```

各部分的含义：

- **从左到右是优先级从高到低**：第一个能匹配到的语言就是界面语言。
- **`zh-hans`**：uosc 内置的简体中文翻译（完整翻译，语言文件在 `uosc/intl/zh-hans.json`），**无需联网下载**。
- **`slang`**：关键字，继承 mpv `--slang` 配置的值（通常是你的字幕语言偏好）。
- **`en`**：英文兜底，防止前两项都没有匹配时界面变成空白。
- 这个选项还同时控制「下载字幕（download-subtitles）」菜单抓取**哪些语言的字幕**。

保存文件后，**完全重启 mpv**（关掉再打开，或运行 `mpv` 重新拉起），界面就变成中文了。

> **小贴士**：只把 `zh-hans` 放在最前面即可，这样仅影响 uosc 界面语言，不会干扰 mpv 本身的字幕语言选择。

## 四、可选：进一步调优

在 `mpv.conf` 中加入以下配置，让 uosc 表现更完整：

```
# uosc 自带进度与音量指示，可以关掉默认的 osd-bar
osd-bar=no

# uosc 会绘制自己的窗口边框
border=no
```

- **时间轴缩略图**：安装 [thumbfast](https://github.com/po5/thumbfast) 后 uosc 无缝集成，无需额外配置。
- **UI 卡顿**：如果播放视频时界面反应慢，可加 `video-sync=display-resample`（会略增 CPU/GPU 负载）。
- **自定义快捷键**（`input.conf`）：

  ```
  tab   script-binding uosc/toggle-ui
  space cycle pause; script-binding uosc/flash-pause-indicator
  ```

想了解更多播放器现代化方案，可以结合阅读我的 [2026 年多平台现代播放器调优指南](/blog/posts/zh/2026-02-01-Video_and_muisc)。

## 五、手机端：Android 上的 MPV —— mpvRex

桌面端调好了，手机也想用 MPV？Android 上有一款基于 libmpv 的现代播放器 —— **mpvRex**（[GitHub: sfsakhawat999/mpvRex](https://github.com/sfsakhawat999/mpvRex)）。

**它是什么**：mpvRex 是 mpvEx 的分支（mpvEx 又源自 mpv-android），把 libmpv 引擎搬进 Android，并配上 Jetpack Compose 的现代界面。你在桌面端喜欢的 MPV 特性——HDR、硬件解码、着色器管线——在手机上同样能享受。

主要特色：

- **玻璃拟态播放界面**（Glassmorphism）+ Material You 动态取色
- **HDR 转 SDR 色调映射**（hdr-toys 着色器管线）
- 圆形双击快进、手势取消快进、字幕拖拽定位与滑动跳转、A-B 循环、逐帧导航、缩放与平移
- 文件管理 + 媒体库：M3U 播放列表、WebDAV/SMB/FTP 网络流代理、封面缩略图
- 画中画（PiP）、竖屏 Shorts 模式、后台播放省电优化

**安装**（Android 侧载 APK）：

1. 打开 [mpvRex Releases](https://github.com/sfsakhawat999/mpvRex/releases)。
2. 按手机架构下载：绝大多数现代手机选 `REX-Player-arm64-v8a-<版本>.apk`；老 32 位设备选 `armeabi-v7a`；不确定就下 `universal`。
3. 安装 APK 即可，首次侧载需允许「安装未知来源应用」。

想尝鲜预览版可以访问 [sfsakhawat999.github.io/mpvRex](https://sfsakhawat999.github.io/mpvRex)，注意预览版可能不稳定，仅适合测试。

> **小贴士**：mpvRex 是独立的本地播放器，不是桌面 mpv 的遥控器；如果你想要手机遥控电脑播放，那属于另一类工具（如 mpv 的 `--input-ipc-server` + 遥控 App），不在本文范围。

## 常见问题

- **找不到 `uosc.conf`？** 手动安装一节里提供了下载位置，把它放进 mpv 配置目录的 `script-opts/` 即可；下次启动 uosc 也会自动生成默认配置。
- **改了配置没生效？** 确认你编辑的是 mpv 实际读取的配置目录——如果 mpv 目录里有 `portable_config`，它的优先级高于 `%APPDATA%\mpv` 或 `~/.config/mpv`。
- **Flatpak 版读不到文件？** Flatpak 沙箱默认只放行部分目录，读写家目录需要先用 Flatseal 授权（Filesystem → Home）。
- **想看英文？** 把 `languages` 改回 `slang,en` 即可随时切换。
