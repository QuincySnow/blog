---
title: "在 Ubuntu 上用回上游原版 GNOME：会话切换与「应用网格图标消失」排查"
description: "Ubuntu 生态 + 原版 GNOME 桌面：安装 gnome-session 并在登录界面选择 GNOME 会话，再记录 GNOME Shell 50.1 下应用网格（九宫格）图标全部消失的排查过程与修复方法"
pubDatetime: 2026-09-08T00:00:00Z
modDatetime: 2026-09-08T00:00:00Z
draft: false
tags:
  - Ubuntu
  - GNOME
  - Linux
  - 教程
lang: zh
---

我一直很看重 Linux 的软件生态，所以主力系统换到 Ubuntu 之后确实省心：第三方软件先出 .deb、教程最多、PPA / .deb / Snap / Flatpak 什么都有。但 Ubuntu 默认的「Ubuntu 会话」带着一套自己的定制（Ubuntu Dock、Yaru 主题、预装扩展），用起来总觉得跟我在 Fedora 上习惯的接近上游的 GNOME 不一样——之前我还专门写过 [Fedora 44 初始化（一）：GNOME 扩展](/blog/posts/zh/2026-08-14-fedora-44-init-gnome-extensions)。

那能不能两头都要：**Ubuntu 的生态 + 上游原版的 GNOME 桌面**？可以，而且不需要卸载任何 Ubuntu 桌面包。这篇文章记录完整的做法，以及切换后遇到的一个「应用网格图标全部消失」的 Bug 和排查结论。

---

## 一、Ubuntu Session 与 GNOME Session 的区别

Ubuntu 的定制并不是把 GNOME 换成了别的东西，而是**同一套 GNOME Shell 底座，用不同的「会话」装配**。登录界面齿轮里的每一个选项，本质上是加载一组不同的配置：

| | Ubuntu Session | GNOME Session（上游） |
| --- | --- | --- |
| 登录选项 | Ubuntu | GNOME |
| 提供者 | `ubuntu-session` 等 Ubuntu 包 | `gnome-session` 包 |
| Dock | Ubuntu Dock（Dash to Dock 的 Ubuntu 定制版） | 无（上游 GNOME 默认没有常驻 Dock） |
| 默认扩展 | Ubuntu 预装的一批扩展 | 基本不带额外扩展 |
| 主题与视觉 | Yaru 等 Ubuntu 定制 | 上游默认 |
| GNOME Shell 底座 | 相同 | 相同 |
| 底层系统 | 相同 | 相同 |

也就是说，Ubuntu 的定制主要停留在「会话」这一层。想要原版 GNOME，最安全的路子是**在登录时换一个会话**，而不是把 Ubuntu 的桌面包卸掉——包之间有复杂的依赖关系，暴力 `apt remove` 很容易把整个桌面一起带走。

## 二、安装 GNOME 会话并切换

确保系统里有上游的 GNOME 会话：

```bash
sudo apt install gnome-session
```

然后注销 → 在 GDM 登录界面点击自己的用户名 → 点右下角齿轮 ⚙️ → 选择 **GNOME**（注意不是 Ubuntu）→ 登录。

这样 Ubuntu 会话和 GNOME 会话两个入口会一直共存，随时可以切回，这是正常设计，不是系统出了问题。

## 三、确认当前确实运行的是上游会话

登录后先验证一下自己到底在哪个会话里：

```bash
gnome-shell --version
echo $XDG_CURRENT_DESKTOP
echo $XDG_SESSION_DESKTOP
```

我这边输出是：

```text
GNOME Shell 50.1
GNOME
gnome
```

`XDG_CURRENT_DESKTOP=GNOME`、`XDG_SESSION_DESKTOP=gnome` 说明当前跑的就是上游 GNOME 会话。

## 四、遇到的 Bug：应用网格图标全部消失

切到 GNOME 会话后大部分功能都正常，但某次我按 Super 打开概览、点进应用网格（九宫格）时，发现**网格里一个应用图标都没有**，只剩一个空荡荡的网格，应用都点不出来。

当时系统里启用了不止一个第三方 GNOME Shell 扩展（包括之前折腾时装的 `dash-to-dock@micxgx.gmail.com` 等），所以第一反应其实是怀疑它们。

## 五、排查：先排除「Ubuntu 桌面包没删」的嫌疑

出问题后很容易冒出一种想法：是不是因为 Ubuntu 原来的桌面包还留在系统里，两个会话打架了？

用上面的环境变量验证后，这个方向可以直接否定——当前会话明确是 **GNOME Shell 50.1 + XDG_CURRENT_DESKTOP=GNOME**。Ubuntu 的包只是躺在系统里，并不会把 GNOME 会话改写成 Ubuntu 会话。**不要用卸载 ubuntu-desktop 来「修」这个问题，那不是原因，还会把系统搞坏。**

把怀疑重点放到扩展上：GNOME 50 是很新的版本，第三方扩展的兼容性窗口很短，某个扩展和 Shell 版本不匹配，就可能导致 Overview / App Grid 这类界面异常。

于是做决定性验证——**一次性禁用全部用户扩展**：

```bash
gsettings set org.gnome.shell disable-user-extensions true
```

注销 → 重新登录 → 再打开九宫格 → **图标回来了**。问题复现/恢复完全可控，基本锁定就是扩展引起的。

## 六、结论：罪魁祸首是从 EGO 安装的 Dash to Dock

最终定位到具体元凶：**从 [extensions.gnome.org](https://extensions.gnome.org/extension/307/dash-to-dock/) 安装的第三方 Dash to Dock**（extension 307，UUID `dash-to-dock@micxgx.gmail.com`）。这个版本与 GNOME Shell 50.1 不兼容，启用后会导致应用网格（九宫格）图标全部消失。

- 这不是「Ubuntu 原桌面没有删除」造成的，保留 Ubuntu 会话与扩展包完全没问题。
- 正确做法是管理好扩展，而不是动系统桌面包。

## 七、恢复扩展并逐个定位

先恢复全部用户扩展：

```bash
gsettings set org.gnome.shell disable-user-extensions false
```

然后**每次只启用一个扩展**，注销重登后打开九宫格验证一次：

```bash
gnome-extensions enable dash-to-dock@micxgx.gmail.com
```

建议第一个就测最可疑的 Dash to Dock。逐个测下来，命中不兼容的扩展后再决定：等作者更新、换替代品，或者干脆保持禁用——而不是为了一个扩展放弃所有其它扩展，更不是卸载 Ubuntu 桌面。

**如果你只是想要一个 Dock**：不需要第三方 Dash to Dock。Ubuntu 自带的 **Ubuntu Dock**（UUID `ubuntu-dock@ubuntu.com`）本身就是 Dash to Dock 的 Ubuntu 维护分支，Ubuntu 会随系统同步适配 GNOME Shell 版本，兼容性比从 EGO 装第三方版靠谱得多。在 GNOME 会话里启用它即可：

```bash
gnome-extensions enable ubuntu-dock@ubuntu.com
```

## 八、最终配置与注意事项

最终的形态是：

```text
Ubuntu
├── Ubuntu Session（保留，随时可切回）
└── GNOME Session（日常使用）
    └── GNOME Shell 50.1 上游行为
```

底层生态完全不变：apt / .deb / Snap / PPA / Ubuntu 软件源，一样都不少。

几个要点再强调一遍：

1. **保留 `ubuntu-session` / `ubuntu-desktop`**，不要卸载。想要原版 GNOME，登录时选 GNOME 会话即可。
2. 换原版 GNOME ≠ 删 Ubuntu 定制，而是**换会话**，两者可共存、可回退，最安全。
3. 扩展**逐个启用**，别一次全开，出问题才好定位。
4. GNOME 大版本刚更新时（比如这次的 50.x）第三方扩展最容易出兼容问题，遇到 Overview / App Grid 异常先怀疑扩展。
