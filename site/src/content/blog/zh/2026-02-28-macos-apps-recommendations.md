---
title: macOS 好用软件推荐
description: 系统维护、录屏与日常效率工具
pubDatetime: 2026-02-28T00:00:00Z
modDatetime: 2026-02-28T00:00:00Z
draft: false
tags:
  - macos
  - onyx
  - kap
  - motrix
  - iina
  - maccy
  - keepassxc
  - floorp
  - appcleaner
  - 录屏
  - 系统维护
  - 下载
  - 播放器
  - 剪贴板
  - 密码管理器
  - 浏览器
  - 卸载
lang: zh
---

记录一批在 macOS（含黑苹果）上自己觉得好用的软件，按用途分类，随用随补。

---

## 浏览器：Floorp

**Floorp** 是一款基于 **Firefox** 的**免费开源**桌面浏览器，使用与 Firefox 相同的 **Gecko** 引擎。

- **Gecko**：Mozilla 开发的网页渲染与 JavaScript 引擎，Firefox、Waterfox、Floorp 等均基于它；与 Chrome/Edge 使用的 Chromium（Blink 引擎）不同，扩展生态为 Firefox 系（AMO），不兼容 Chrome 扩展。
- **Gecko 中的 Rust**：近年来 Gecko 大量引入 **Rust** 编写的模块，在保持兼容的前提下提升性能与安全性。典型包括：**WebRender**（Rust 实现的 GPU 加速渲染，多核并行绘制）、**Stylo**（Rust 实现的 CSS 样式计算引擎，并行解析与计算）。二者与多进程架构结合，使 Firefox 系在多核与高分辨率下的渲染与样式性能明显改善，Floorp 作为同一引擎的衍生版同样受益。
- **定位**：在保留 Firefox 隐私与可定制能力的前提下，增加工作区、侧栏、垂直标签等界面与工作流增强，适合作为主力日常浏览器。

[**Floorp**](https://floorp.app/) 官网：[floorp.app](https://floorp.app/)（MPL 2.0）：

- **界面**：侧栏、垂直/多行标签、工作区、Web 面板等可大幅自定义
- **隐私与追踪**：内置追踪保护（标准 / 严格 / 自定义），支持 `about:config` 细调
- **扩展**：兼容 Firefox 附加组件（AMO）；支持 Floorp View 跨设备同步标签（Mozilla 账户）
- **平台**：支持 macOS 10.15+、Apple Silicon 与 Intel

适合替代 Chrome、Safari 作为主力浏览器。官网下载：[floorp.app](https://floorp.app/)，或 `brew install --cask floorp`；源码 [GitHub](https://github.com/Floorp-Projects/Floorp)。具体的介绍参考 [Floorp 性能与隐私配置](../Floorp/)

---

## 系统维护：OnyX

[**OnyX**](https://www.titanium-software.fr/en/onyx.html) 是 Titanium Software 出的**系统多功能维护工具**，可用来：

- 检查系统文件结构
- 执行清理与日常维护（清理缓存、删除问题文件、重建数据库与索引等）
- 配置 Finder、Dock、Safari 及部分系统应用参数
- 卸载应用

很多原本需要命令行完成的操作，用 OnyX 的图形界面即可完成，适合不想记命令的用户。

**注意**：**每个大版本 macOS 对应一个 OnyX 版本**，必须下载与当前系统匹配的版本（例如 macOS Sequoia 15 用 OnyX 4.8.x，Tahoe 26 用 4.9.x）。官网提供从老版本到最新版的下载，见 [OnyX 官网](https://www.titanium-software.fr/en/onyx.html)。

---

## 卸载 / 清理：AppCleaner

[**AppCleaner**](https://freemacsoft.net/appcleaner/)（FreeMacSoft）是**免费**的卸载工具，用于**彻底移除** Mac 上的应用及其残留文件：

- **拖拽卸载**：把应用拖进窗口即可扫描并列出相关文件（偏好、缓存、Library 等）
- **可选删除**：用勾选框选择要删的内容，可保留部分文件（如备份）
- **SmartDelete**：应用已进废纸篓时，可检测并清理残留项
- **应用列表**：浏览已安装应用、小组件、插件，方便批量清理

删除前会先移入废纸篓，误删可恢复。支持 Apple Silicon 与 Intel，兼容多代 macOS。官网下载：[freemacsoft.net/appcleaner](https://freemacsoft.net/appcleaner/)，或 `brew install --cask appcleaner`。

---

## 录屏 / GIF：Kap

[**Kap**](https://getkap.co/) 是一款**免费开源**的 macOS 录屏工具，特点包括：

- **多格式导出**：GIF、MP4、WebM、APNG，可选带音频
- **录制范围**：全屏、指定窗口或自选区域
- **简单编辑**：裁剪、点击高亮等
- **插件扩展**：可对接 Giphy、Streamable 等
- 支持 **Apple Silicon 与 Intel**，需 macOS 12+

适合做教程动图、演示片段。官网下载：[getkap.co](https://getkap.co/)，源码见 [GitHub](https://github.com/wulkano/kap)。

---

## 下载器：Motrix

[**Motrix**](https://motrix.app/download) 是一款**免费开源**的跨平台下载管理工具，macOS 上可替代迅雷等：

- **协议支持**：HTTP/HTTPS、FTP、BT、Magnet 磁力，BT 支持选择性下载
- **多任务**：最多 10 个并发任务，单任务最多 64 线程
- **限速、端口映射**：支持限速与 UPnP/NAT-PMP
- **界面**：简洁、支持深色模式，支持 Touch Bar、菜单栏实时速度
- **BT 追踪器**：可自动更新每日 tracker 列表

官网下载：[motrix.app](https://motrix.app/download)，也可 `brew install --cask motrix`；源码 [GitHub](https://github.com/agalwood/Motrix)（MIT）。

---

## 视频 / 音频播放器：IINA

[**IINA**](https://iina.io/) 是面向 macOS 的**现代本地播放器**，基于 mpv，免费开源（GPLv3）：

- **格式支持**：常见视频、音频格式，本地文件与网络流；配合浏览器扩展可播 YouTube 等在线源
- **系统融合**：原生支持深色模式、画中画、Touch Bar、系统媒体键、在线字幕、音乐模式、手势与缩略图预览
- **可定制**：界面与快捷键可调；1.4 起支持插件（beta）

适合做系统默认播放器，替代 VLC / QuickTime。官网下载：[iina.io](https://iina.io/download/)，也可 `brew install --cask iina`；源码 [GitHub](https://github.com/iina/iina)。

---

## 剪贴板管理：Maccy

[**Maccy**](https://maccy.app/) 是**轻量开源**的剪贴板历史工具（MIT）：

- **快捷键**：**Shift+Command+C** 呼出，输入搜索、Enter 复制选中项，Option+Enter 直接粘贴
- **本地与隐私**：历史仅存本机，可排除密码管理器等敏感内容
- **界面**：极简、类系统原生，支持置顶常用项、清空历史

官网 [maccy.app](https://maccy.app/)，或 `brew install --cask maccy`；源码 [GitHub](https://github.com/p0deje/Maccy)。需 macOS 14+（Sonoma 及更新）。

---

## 密码管理器：KeePassXC

[**KeePassXC**](https://keepassxc.org/) 是**免费开源**的本地密码管理器（GPLv3），支持 macOS / Windows / Linux：

- **本地与隐私**：密码库为本地加密文件（.kdbx），完全由你掌控，无云同步、无第三方服务器
- **功能**：保存密码、用户名、URL、附件、备注；内置**强密码 / 口令生成器**；支持浏览器扩展自动填充
- **跨平台**：同一数据库可在多系统打开，适合自建同步（如 iCloud / 网盘放 .kdbx）

官网下载：[keepassxc.org](https://keepassxc.org/download/)（区分 Apple Silicon / Intel），或 `brew install --cask keepassxc`；文档与源码见 [KeePassXC 官网](https://keepassxc.org/)。

---

## 后续可补充

后续会按使用情况继续往本文补充，例如：剪贴板管理、窗口管理、终端/开发相关等。若你有特别想看到的类别，可以留言。
