---
title: "Fedora 44 初始化（一）：GNOME 扩展"
description: "Fedora 44 Workstation 预装的五个默认 GNOME Shell 扩展，以及我推荐的八个用户扩展，附官网与安装方法"
pubDatetime: 2026-08-14T00:00:00Z
modDatetime: 2026-08-14T00:00:00Z
draft: false
tags:
  - Fedora
  - GNOME
  - Linux
  - 教程
lang: zh
---

从 Fedora 44 开始，我打算写一组「初始化」系列文章，覆盖装完系统后的必备设置。第一篇先从 GNOME Shell 扩展说起——系统自带五个，日常使用再加八个用户扩展，基本就能覆盖所有场景。

Fedora 44 Workstation 预装的是 **GNOME Shell 50**，自带以下五个系统级扩展，安装目录为 `/usr/share/gnome-shell/extensions/`：

| 扩展 | UUID | 默认启用 |
| --- | --- | --- |
| Background Logo | `background-logo@fedorahosted.org` | ✅ 是 |
| Apps Menu | `apps-menu@gnome-shell-extensions.gcampax.github.com` | 否 |
| Launch New Instance | `launch-new-instance@gnome-shell-extensions.gcampax.github.com` | 否 |
| Places Status Indicator | `places-menu@gnome-shell-extensions.gcampax.github.com` | 否 |
| Window List | `window-list@gnome-shell-extensions.gcampax.github.com` | 否 |

前四个来自 GNOME 上游的 `gnome-shell-extensions` 项目（其中后四个属于官方支持的 Classic Mode 组件），Background Logo 则是 Fedora 项目自己维护的扩展，也是唯一默认启用的。

---

## 查看已安装的扩展

先确认你系统里有哪些扩展：

```bash
gnome-extensions list
```

只看启用状态的：

```bash
gnome-extensions list --enabled
```

查看某个扩展的详细信息（含版本与简介）：

```bash
gnome-extensions info apps-menu@gnome-shell-extensions.gcampax.github.com
```

Fedora 中这些扩展由独立的 RPM 包提供，确认安装情况：

```bash
rpm -qa | grep gnome-shell-extension
```

---

## 一、Background Logo（背景 Logo）

在桌面背景上叠加一个精致的 Fedora 标志，提升「品牌感」。这是唯一默认启用的扩展，也是 Fedora 官方自己维护的。

- **官网**：https://forge.fedoraproject.org/workstation/background-logo-extension
- **RPM 包**：`gnome-shell-extension-background-logo`
- **UUID**：`background-logo@fedorahosted.org`

Fedora 44 已预装。若要手动重装或安装到其他系统：

```bash
sudo dnf install gnome-shell-extension-background-logo
```

启用 / 禁用：

```bash
gnome-extensions enable background-logo@fedorahosted.org
gnome-extensions disable background-logo@fedorahosted.org
```

---

## 二、Apps Menu（应用程序菜单）

在顶栏添加一个按分类组织的应用菜单（Applications 菜单），是 GNOME Classic 模式的标准组件。

- **扩展官网**：https://extensions.gnome.org/extension/6/applications-menu/
- **上游项目**：https://gitlab.gnome.org/GNOME/gnome-shell-extensions
- **RPM 包**：`gnome-shell-extension-apps-menu`
- **UUID**：`apps-menu@gnome-shell-extensions.gcampax.github.com`

```bash
sudo dnf install gnome-shell-extension-apps-menu
gnome-extensions enable apps-menu@gnome-shell-extensions.gcampax.github.com
```

---

## 三、Launch New Instance（总是启动新实例）

点击 Dock 或应用视图中的应用图标时，总是启动一个新实例，而不是切回已有窗口。适合喜欢多开终端的用户。

- **扩展官网**：https://extensions.gnome.org/extension/600/launch-new-instance/
- **上游项目**：https://gitlab.gnome.org/GNOME/gnome-shell-extensions
- **RPM 包**：`gnome-shell-extension-launch-new-instance`
- **UUID**：`launch-new-instance@gnome-shell-extensions.gcampax.github.com`

```bash
sudo dnf install gnome-shell-extension-launch-new-instance
gnome-extensions enable launch-new-instance@gnome-shell-extensions.gcampax.github.com
```

---

## 四、Places Status Indicator（位置状态指示器）

在顶栏添加一个菜单，快速跳转到系统中的常用位置（主目录、下载、文档、移动设备等），也是 GNOME Classic 模式的组件。

- **扩展官网**：https://extensions.gnome.org/extension/8/places-status-indicator/
- **上游项目**：https://gitlab.gnome.org/GNOME/gnome-shell-extensions
- **RPM 包**：`gnome-shell-extension-places-menu`
- **UUID**：`places-menu@gnome-shell-extensions.gcampax.github.com`

```bash
sudo dnf install gnome-shell-extension-places-menu
gnome-extensions enable places-menu@gnome-shell-extensions.gcampax.github.com
```

---

## 五、Window List（窗口列表）

在屏幕底部显示一条窗口列表，类似传统任务栏，是 GNOME Classic 模式的标准组件。

- **扩展官网**：https://extensions.gnome.org/extension/602/window-list/
- **上游项目**：https://gitlab.gnome.org/GNOME/gnome-shell-extensions
- **RPM 包**：`gnome-shell-extension-window-list`
- **UUID**：`window-list@gnome-shell-extensions.gcampax.github.com`

```bash
sudo dnf install gnome-shell-extension-window-list
gnome-extensions enable window-list@gnome-shell-extensions.gcampax.github.com
```

> 提示：同时启用 Apps Menu + Window List，几秒钟就能还原成传统 GNOME 2 风格的面板布局。

---

## 通用的扩展管理方式

除了上面的 `gnome-extensions` 命令行，还有三种常用方式：

**1. GNOME Extensions 应用**

Fedora 44 自带的扩展管理应用：

```bash
sudo dnf install gnome-extensions-app
```

**2. Extension Manager（Flatpak，推荐）**

浏览、安装、配置扩展最顺手的第三方应用，直接从 Flathub 安装：

```bash
flatpak install -y flathub com.mattjakeman.ExtensionManager
```

**3. 官网网页安装**

在浏览器打开 [extensions.gnome.org](https://extensions.gnome.org/)，找到扩展后打开开关即可。注意需要 Firefox 的 GNOME Shell 集成插件，站点会提示你安装。

**4. Flatseal（Flatpak 权限管理）**

装完 Flatpak 应用后，推荐安装 Flatseal 来管理它们的权限——哪些能访问网络、摄像头、文件系统，一目了然：

```bash
flatpak install -y flathub com.github.tchx84.Flatseal
```

---

## 我推荐的用户扩展

系统自带的扩展解决了基础需求，但日常使用还需要一些「用户扩展」来提升效率。以下八个是我装完 Fedora 44 后立刻装上的，每个都附了 EGO 页面和 GitHub/项目主页。

### 六、AppIndicator and KStatusNotifierItem Support（系统托盘图标）

让 GNOME 支持显示系统托盘图标（KStatusNotifierItem / AppIndicator），比如微信、Telegram、Dropbox 等应用的小图标。

- **EGO**：https://extensions.gnome.org/extension/615/appindicator-support/
- **GitHub**：https://github.com/ubuntu/gnome-shell-extension-appindicator
- **UUID**：`appindicatorsupport@rgcjonas.gmail.com`
- **RPM 包**：`gnome-shell-extension-appindicator`

```bash
sudo dnf install gnome-shell-extension-appindicator
# 或从 EGO / Extension Manager 安装
gnome-extensions enable appindicatorsupport@rgcjonas.gmail.com
```

---

### 七、Dash to Dock（持久化 Dock）

将 GNOME 的 Dash 变成一个持久化的 Dock 栏，类似 macOS 的 Dock 或 Unity 的启动器。支持自定义位置、大小、自动隐藏等。

- **EGO**：https://extensions.gnome.org/extension/307/dash-to-dock/
- **GitHub**：https://github.com/micheleg/dash-to-dock
- **UUID**：`dash-to-dock@micxgx.gmail.com`

```bash
# 从 EGO 或 Extension Manager 安装
gnome-extensions enable dash-to-dock@micxgx.gmail.com
```

---

### 八、Clipboard History（剪贴板历史）

记录剪贴板历史，支持搜索、固定条目、快捷键调出。比 GNOME 原生的 Ctrl+C / Ctrl+V 强大得多。

- **EGO**：https://extensions.gnome.org/extension/4839/clipboard-history/
- **GitHub**：https://github.com/SUPERCILEX/gnome-clipboard-history
- **UUID**：`clipboard-history@alexsaveau.dev`

```bash
# 从 EGO 或 Extension Manager 安装
gnome-extensions enable clipboard-history@alexsaveau.dev
```

---

### 九、GSConnect（手机互联）

GNOME 版的 KDE Connect，实现手机与电脑之间的文件传输、通知同步、剪贴板共享、远程输入等。需要手机端安装 KDE Connect 应用。

- **EGO**：https://extensions.gnome.org/extension/1319/gsconnect/
- **GitHub**：https://github.com/GSConnect/gnome-shell-extension-gsconnect
- **UUID**：`gsconnect@andyholmes.github.io`

```bash
# 从 EGO 或 Extension Manager 安装
gnome-extensions enable gsconnect@andyholmes.github.io
```

---

### 十、Brightness Control using ddcutil（外接显示器亮度调节）

通过 DDC/CI 协议调节外接显示器的亮度和音量，弥补 GNOME 原生不支持外接显示器亮度调节的短板。

- **EGO**：https://extensions.gnome.org/extension/2645/brightness-control-using-ddcutil/
- **GitHub**：https://github.com/daitj/gnome-display-brightness-ddcutil
- **UUID**：`display-brightness-ddcutil@themightydeity.github.com`

这个扩展依赖 `ddcutil` 工具，而 `ddcutil` 需要 `i2c-dev` 内核模块和正确的权限配置。完整安装步骤如下：

**第一步：安装 ddcutil**

```bash
sudo dnf install ddcutil
```

**第二步：加载 i2c-dev 内核模块**

```bash
sudo modprobe i2c-dev
```

验证显示器是否支持 DDC/CI 亮度控制：

```bash
ddcutil capabilities | grep "Feature: 10"
```

**第三步：配置 udev 规则**

```bash
sudo cp /usr/share/ddcutil/data/60-ddcutil-i2c.rules /etc/udev/rules.d/
```

> Fedora 40+ 需要编辑该文件，取消注释以下行：
>
> ```
> KERNEL=="i2c-[0-9]*", GROUP="i2c", MODE="0660"
> ```

**第四步：创建 i2c 组并添加当前用户**

```bash
sudo groupadd --system i2c
sudo usermod $USER -aG i2c
```

**第五步：设置 i2c-dev 开机自动加载**

```bash
sudo touch /etc/modules-load.d/i2c.conf
sudo sh -c 'echo "i2c-dev" >> /etc/modules-load.d/i2c.conf'
```

**第六步：重启生效**

```bash
sudo reboot
```

重启后确认 `ddcutil` 无需 sudo 即可工作：

```bash
ddcutil getvcp 10
```

**第七步：安装扩展**

```bash
# 从 EGO 或 Extension Manager 安装
gnome-extensions enable display-brightness-ddcutil@themightydeity.github.com
```

---

### 十一、Night Theme Switcher（自动暗色模式）

定时自动切换 GNOME 的浅色/暗色主题，支持日出日落或自定义时间表。

- **EGO**：https://extensions.gnome.org/extension/2236/night-theme-switcher/
- **项目主页**：https://nightthemeswitcher.romainvigier.fr
- **UUID**：`nightthemeswitcher@romainvigier.fr`

```bash
# 从 EGO 或 Extension Manager 安装
gnome-extensions enable nightthemeswitcher@romainvigier.fr
```

推荐使用经纬度来设置自动切换时间，比手动设置时间表更精准。将下面的经纬度替换为你所在城市即可：

```bash
gsettings --schemadir ~/.local/share/gnome-shell/extensions/nightthemeswitcher@romainvigier.fr/schemas/ \
  set org.gnome.shell.extensions.nightthemeswitcher.time location '(39.90,116.40)'
```

在 Extension Manager 的设置界面中，将 Time 预设改为 `Location` 即可生效。

---

### 十二、Input Method Panel（输入法面板）

IBus / Fcitx 等输入法框架的状态面板，中文用户必备。Fedora 44 已预装 IBus，但需要这个扩展才能在 GNOME Shell 中显示输入法状态。

- **EGO**：https://extensions.gnome.org/extension/261/kimpanel/
- **GitHub**：https://github.com/wengxt/gnome-shell-extension-kimpanel
- **UUID**：`kimpanel@kde.org`
- **RPM 包**：`gnome-shell-extension-kimpanel`

```bash
sudo dnf install gnome-shell-extension-kimpanel
gnome-extensions enable kimpanel@kde.org
```

---

### 快速安装脚本

以上扩展可以一键安装（需要先装好 `ddcutil`）：

```bash
# 系统扩展
sudo dnf install -y \
  gnome-shell-extension-background-logo \
  gnome-shell-extension-apps-menu \
  gnome-shell-extension-launch-new-instance \
  gnome-shell-extension-places-menu \
  gnome-shell-extension-window-list \
  gnome-shell-extension-appindicator \
  gnome-shell-extension-kimpanel

# 用户扩展（通过 GNOME Extensions CLI 安装）
# Dash to Dock
gnome-extensions install dash-to-dock@micxgx.gmail.com || true
# Clipboard History
gnome-extensions install clipboard-history@alexsaveau.dev || true
# GSConnect
gnome-extensions install gsconnect@andyholmes.github.io || true
# Brightness Control using ddcutil
gnome-extensions install display-brightness-ddcutil@themightydeity.github.com || true
# Night Theme Switcher
gnome-extensions install nightthemeswitcher@romainvigier.fr || true
```

> 提示：用户扩展建议优先通过 Extension Manager（Flatpak）安装，它会自动处理版本兼容性。

---

## 结语

Fedora 44 Workstation 自带五个系统扩展，加上这八个用户扩展，基本覆盖了日常使用的方方面面：系统托盘、Dock、剪贴板、手机互联、显示器亮度、暗色模式、输入法。掌握了 `gnome-extensions` 命令行和 Extension Manager，你就掌握了整个 GNOME 扩展生态的入口。

下一篇「初始化」文章见。
