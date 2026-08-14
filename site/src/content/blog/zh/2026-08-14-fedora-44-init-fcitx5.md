---
title: "Fedora 44 初始化（二）：Fcitx5 输入法"
description: "在 Fedora 44 Workstation 上通过 dnf 安装 Fcitx5 + Rime 输入法"
pubDatetime: 2026-08-14T00:00:00Z
modDatetime: 2026-08-14T00:00:00Z
draft: false
tags:
  - Fedora
  - GNOME
  - Linux
  - Fcitx5
  - Rime
  - 输入法
  - 教程
lang: zh
---

初始化系列的第二篇，聊聊输入法。Fedora 44 默认装的是 IBus，但很多中文用户更习惯 Fcitx5——响应更快、生态更丰富、Rime 引擎支持也更好。

---

## 安装 Fcitx5

Fedora 44 官方源已经收录 Fcitx5，一条命令搞定：

```bash
sudo dnf install fcitx5 fcitx5-rime fcitx5-configtool fcitx5-gtk fcitx5-qt fcitx5-autostart
```

| 包名 | 作用 |
| --- | --- |
| `fcitx5` | 核心框架 |
| `fcitx5-rime` | Rime 输入法引擎 |
| `fcitx5-configtool` | 图形化配置工具 |
| `fcitx5-gtk` | GTK 应用输入法支持 |
| `fcitx5-qt` | Qt 应用输入法支持 |
| `fcitx5-autostart` | 开机自动启动 |

安装完成后**注销重新登录**即可生效。

---

## 添加 Rime 输入法

打开配置工具：

```bash
fcitx5-configtool
```

在「输入法」选项卡中点击「添加输入法」，搜索 `Rime` 并添加。默认包含「朙月拼音」（luna_pinyin），即简体中文拼音。

| 快捷键 | 作用 |
| --- | --- |
| `Ctrl + Space` | 开启/关闭输入法 |
| `Shift` | 中英文快速切换 |
| `Ctrl + Shift + F` | 繁简切换 |

---

## 结语

Fedora 44 官方源一条命令装好 Fcitx5，注销重新登录即可使用，整个流程非常简洁。

下一篇「初始化」文章见。
