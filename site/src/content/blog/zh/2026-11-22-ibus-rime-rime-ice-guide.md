---
title: "ibus-rime + 雾凇拼音：一套流程通吃所有 Linux 发行版"
description: "用系统自带的 IBus 加 Rime 引擎配雾凇拼音词库，Arch、Debian/Ubuntu、Fedora、openSUSE 都是一样的三步：装 ibus-rime、换词库、重新部署"
pubDatetime: 2026-11-22T00:00:00Z
modDatetime: 2026-11-22T00:00:00Z
draft: false
tags:
  - Linux
  - Rime
  - IBus
  - 输入法
  - 教程
lang: zh
---

中文 Linux 桌面的输入法方案基本就两条路：IBus 和 Fcitx5。Fcitx5 功能多、可玩性强，但如果你只是想要一个**装完就能打字、不额外常驻框架、Wayland 下也正常**的输入法，IBus + Rime 是更省事的那条。而 Rime 本身只是个引擎，词库得自己配——目前最省心的选择就是[雾凇拼音](https://github.com/iDvel/rime-ice)。

这篇的流程适用于**任何 Linux 发行版**：包管理器不同，但用户目录、压缩包、重新部署这三步完全一致。从 Arch 到 openSUSE，从 X11 到 Wayland，没有任何发行版专属的步骤。

---

## 为什么这次不推荐 fcitx5-rime<span id="why-ibus"></span>

不是 Fcitx5 不好，而是「ibus-rime」这条路上的变量更少：

| 对比项 | ibus-rime | fcitx5-rime |
| --- | --- | --- |
| GNOME 集成 | 系统自带 IBus，开箱即用 | 需要额外装框架、设环境变量、配自启 |
| 常驻进程 | 无新增（IBus 本来就在跑） | 多一个 fcitx5 守护进程 |
| Wayland | GNOME 原生支持 | 多数场景可用，个别弹窗定位/焦点会飘 |
| 配置面 | 装包 → 加输入源 → 换词库 | 框架 + 模块 + 自启 + GTK/Qt 模块 + 词库 |
| 适合谁 | 想少折腾、GNOME 用户、Flatpak 用户 | KDE 用户、需要大量自定义/皮肤/云拼音 |
| 上游归属 | Rime 项目本身（`rime/ibus-rime`） | Fcitx 团队（`fcitx/fcitx5-rime`） |

还有一条容易被忽略的硬理由：在 Rime 官方的[下载页](https://rime.im/download/)上，Linux 一栏里 `ibus-rime` 是直接列在 Rime 名下的前端，而 `fcitx5-rime` 后面明确跟着「（第三方軟件）」——「由 Fcitx 團隊開發和維護」。也就是说，`ibus-rime` 和 librime、方案生态属于同一个上游，引擎升级和前端适配在同一处协调；`fcitx5-rime` 是 Fcitx 团队拿 librime 做的另一个前端，兼容性与问题归属都要跨项目传递。

这不等于 `fcitx5-rime` 质量差——它维护得不错，也是 KDE 上的正解。但在「谁来保证兼容、出问题去哪报、跟哪个版本走」这几个问题上，第一方前端确实少一层成本，这也是本文默认选 IBus 的原因。

GNOME 桌面上 IBus 是默认输入法框架，`ibus-rime` 装完只需要在设置里把「Rime」加进输入源。KDE 上 Fcitx5 才是原生方案，你在 KDE 上坚持用 Fcitx5 完全合理——但即便如此，**词库的安装方法也是本文第 2、3 步**，只是用户目录换成 Fcitx5 的那个。

另外别同时装 `ibus-rime` 和 `fcitx5-rime` 并都启用，两个框架抢 `XMODIFIERS` 是玄学问题的常见来源。选一个，用到底。

---

## 三步总览<span id="overview"></span>

整套方案可以压缩成三句话：

1. **装 `ibus-rime`** —— 命令随发行版变，包名基本都叫这个。
2. **把雾凇拼音解压进 Rime 用户目录** —— 先清空目录，再复制文件。
3. **重新部署** —— IBus 重启 + Rime 编译词库，几十秒后就能打字。

后面每一步都会给出通用做法，并在需要时标注发行版差异。

---

## 第一步：安装 ibus-rime<span id="install"></span>

### 各发行版的安装命令

包名在所有主流发行版里都叫 `ibus-rime`，这是它最大的好处：

| 发行版 | 命令 |
| --- | --- |
| Arch / Manjaro / EndeavourOS | `sudo pacman -S ibus-rime` |
| Debian / Ubuntu / Linux Mint / Pop!\_OS | `sudo apt install ibus-rime` |
| Fedora | `sudo dnf install ibus-rime` |
| openSUSE Tumbleweed / Leap | `sudo zypper install ibus-rime` |
| Gentoo | `sudo emerge ibus-rime` |
| Solus | `sudo eopkg install ibus-rime` |
| NixOS | `i18n.inputMethod.ibus.engines = [ pkgs.ibus-engines.rime ];`（或 `environment.systemPackages = [ pkgs.ibus-engines.rime ];`） |

> 顺带一提：Debian/Ubuntu 上还可以用 `rime-data-*` 系列包装额外的输入方案（`rime-data-double-pinyin`、`rime-data-wubi` 等），不过我们马上要用雾凇拼音整包覆盖，所以不装也不影响。

装完先确认引擎已经被 IBus 识别：

```bash
ibus list-engine | grep -i rime
# 期望看到类似：rime - Rime
```

如果没有输出，先确认 `ibus-daemon` 在跑：`pgrep -a ibus-daemon`。桌面上没启动的话执行 `ibus-daemon -drx`。

### 把 Rime 加进输入源

IBus 的引擎列表和「当前启用的输入法」是两回事，装完还得启用：

- **GNOME**：设置 → 键盘 → 输入源 → 添加 → 汉语（中国）→ **Rime**。
- **KDE / XFCE / 其它桌面**：运行 `ibus-setup` → Input Method 标签页 → Add → Chinese → Rime。
- **纯命令行临时切换**（调试很有用）：

```bash
ibus engine rime     # 切到 Rime
ibus engine xkb:us::eng  # 切回英文键盘
```

切到 Rime 之后按 <kbd>Ctrl</kbd>+<kbd>Space</kbd> 或 <kbd>Super</kbd>+<kbd>Space</kbd>（取决于桌面快捷键）就能起中文。此时用的是 Rime 自带的朙月拼音，界面能出字就说明框架这一层通了。

> 如果这一步就出不了字，别急着换词库，先解决 IBus 本身：检查输入源是否真的加上了，以及是否在 Wayland 会话里（GNOME Wayland 下 `ibus-setup` 的部分选项由 GNOME 接管，以设置为准）。

---

## 第二步：下载雾凇拼音并替换用户目录<span id="rime-ice"></span>

### 下载

雾凇拼音的发布包在 GitHub Releases 上，官方提供两个入口：

| 来源 | 链接 |
| --- | --- |
| GitHub 官方 | <https://github.com/iDvel/rime-ice/releases/latest/download/full.zip> |
| 大陆镜像加速（南京大学镜像） | <https://mirror.nju.edu.cn/github-release/iDvel/rime-ice/LatestRelease/full.zip> |

两个地址拿到的是同一个 `full.zip`（约 16 MB）。国内网络直接下 GitHub 容易断，用镜像即可，文件内容一致。

```bash
# 国内建议用镜像；能直连 GitHub 就用第一个
curl -L -o ~/Downloads/rime-ice-full.zip \
  https://mirror.nju.edu.cn/github-release/iDvel/rime-ice/LatestRelease/full.zip
```

### 找到你的 Rime 用户目录

「用户目录」由**输入法前端**决定，和发行版无关。这是本文最重要的一张表：

| 前端 | 用户目录 |
| --- | --- |
| **IBus（本文主线）** | `~/.config/ibus/rime` |
| Fcitx5（桌面） | `~/.local/share/fcitx5/rime` |
| Fcitx5 for Android | `/Android/data/org.fcitx.fcitx5.android/files/data/rime` |
| 小狼毫 Weasel（Windows） | `%APPDATA%\Rime` |
| 鼠须管 Squirrel（macOS） | `~/Library/Rime` |

本文用 IBus 的路径；如果你在别的平台，把下面命令里的 `RIME_DIR` 换掉就行，后面的步骤一字不改。

### 清空目录再复制

雾凇拼音的官方要求是**先清空用户目录内的全部文件**，再把压缩包里的所有文件复制进去。原因是旧配置、旧的 `default.yaml`、旧的 `build/` 缓存会和新方案打架，Rime 会静默加载默认配置而不是报错，排查起来很痛苦。

保险起见，先把整个目录挪走当备份：

```bash
RIME_DIR="$HOME/.config/ibus/rime"

# 1. 备份旧目录（第一次安装时目录可能是空的，这条会失败，无所谓）
mv "$RIME_DIR" "$RIME_DIR.bak.$(date +%Y%m%d-%H%M%S)" 2>/dev/null

# 2. 建一个干净的用户目录
mkdir -p "$RIME_DIR"

# 3. 解压雾凇拼音，文件全部落在用户目录根下
unzip -o ~/Downloads/rime-ice-full.zip -d "$RIME_DIR"

# 4. 确认关键文件在
ls "$RIME_DIR" | head
# 应该能看到 default.yaml、rime_ice.schema.yaml、squirrel.yaml 等
```

如果你不想挪整个目录、只想严格照官方说法清空内容，等价写法是：

```bash
RIME_DIR="$HOME/.config/ibus/rime"
mkdir -p "$RIME_DIR"
find "$RIME_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
unzip -o ~/Downloads/rime-ice-full.zip -d "$RIME_DIR"
```

两点注意：

- **不要**把压缩包解出一个 `rime-ice/` 子目录再整个塞进去。`default.yaml` 必须直接在 `~/.config/ibus/rime/` 下，多一层目录 Rime 就找不到配置。
- 用 `unzip -o` 而不是图形解压工具，避免产生 `__MACOSX`、`.DS_Store` 之类的垃圾文件。

Android 上的操作同理，只是没法用上面的 shell 命令：用文件管理器进到 `Android/data/org.fcitx.fcitx5.android/files/data/rime`，先删掉里面的内容，再把 zip 解压进去。Android 11+ 对 `Android/data` 的访问有限制，用 Fcitx5 自带的文件管理或 adb 更稳。

---

## 第三步：重新部署<span id="deploy"></span>

文件就位后，Rime 还没有编译词库，需要一次部署。按你的桌面环境选一种：

**有 IBus 托盘图标**（XFCE、Cinnamon、部分 KDE 配置）：右键图标 → **重新部署 / Deploy**。这是最直接的方式。

**GNOME 或没有托盘**：

```bash
# 重启 IBus 守护进程；Rime 引擎下次启动时会自动部署
ibus-daemon -drx

# 顺手切到 Rime，触发一次引擎加载
ibus engine rime
```

首次部署要编译词库和语法模型，**几秒到一分钟**都正常，期间输入可能没反应，别以为卡死了。部署完成的标志是用户目录下出现了 `build/`，并且里面有一堆 `.bin`：

```bash
ls "$RIME_DIR/build" | head
# rime_ice.schema.yaml 相关的 .prism.bin / .table.bin / .reverse.bin 等
```

部署后如果还是旧方案/没反应，按顺序试：

1. 再执行一次 `ibus-daemon -drx`；
2. 删掉 `build/` 再部署，强制全量重编：`rm -rf "$RIME_DIR/build"`；
3. 检查用户目录里有没有多出来的 `trash/`——YAML 缩进写错（尤其是用了 Tab）时，Rime 会把出错的配置文件丢进 `trash/` 然后悄悄退回默认配置。

### 部署之后怎么用

- <kbd>F4</kbd>：呼出方案菜单，切换全拼 / 双拼 / 其它方案，开关 emoji、简繁等。
- <kbd>Ctrl</kbd>+<kbd>Space</kbd> 或桌面定义的快捷键：中英切换。
- 雾凇拼音默认方案是「雾凇拼音 · 全拼」，双拼用户按 README 的说明换成 `double_pinyin_flypy`（小鹤）等即可。
- 想更新词库：**重复第二步和第三步**。词库更新频繁，建议隔几个月拉一次 `full.zip` 重装，比手动 merge 省心。

---

## 常见问题<span id="troubleshooting"></span>

**候选框是方块/豆腐块。** 缺中文字体，不是 Rime 的问题。装一套 CJK 字体即可：`sudo pacman -S noto-fonts-cjk` / `sudo apt install fonts-noto-cjk` / `sudo dnf install google-noto-sans-cjk-fonts`。

**Wayland 下候选框位置偏移。** IBus 在 GNOME Wayland 下用输入法协议渲染候选框，个别应用（尤其是 Electron/旧版 Qt）会飘。可以先确认应用使用的是 Wayland 还是 XWayland；XWayland 应用下位置异常属于老问题，改不了就换应用的原生 Wayland 模式。

**个别 Flatpak / Qt 应用打不出中文。** 先确认 `GTK_IM_MODULE` / `QT_IM_MODULE` 没被设成 `fcitx`。桌面环境一般会自动处理，不要手动写死：

```bash
echo "$GTK_IM_MODULE | $QT_IM_MODULE | $XMODIFIERS"
# 期望：ibus | ibus | @im=ibus（或全为空，交给桌面自动判断）
```

**想在 KDE 上用同一套词库。** 装 `fcitx5-rime`，把 `RIME_DIR` 换成 `~/.local/share/fcitx5/rime`，其余完全一样；重新部署在 Fcitx5 配置界面里点「重新部署」。

**想彻底卸载。** 删除包、删 `~/.config/ibus/rime`、在输入源里移除 Rime 即可，不会残留系统级配置。

---

## 其它值得一看的词库<span id="alternatives"></span>

雾凇拼音是最主流的默认选择：全拼/双拼齐全、词库长期维护、注释详尽、上手零成本。但它不是唯一：

| 方案 | 特点 | 仓库 |
| --- | --- | --- |
| **雾凇拼音（rime-ice）** | 最主流，全拼 + 多种双拼，词库精校，开箱即用 | <https://github.com/iDvel/rime-ice> |
| **万象拼音（wanxiang）** | 主打语法模型与长句整句输入，配置更激进，适合追求「一句话一次上屏」 | <https://github.com/amzxyz/rime-wanxiang> |
| **白霜拼音（rime-frost）** | 词库取向不同，偏纯净/简体优化，常被拿来和雾凇对比 | <https://github.com/gaboolic/rime-frost> |

三者的安装方式**完全相同**：下载发布包 → 清空用户目录 → 解压 → 重新部署。区别只在词库内容、默认方案和调参风格。先装雾凇用一两周，知道自己在意什么（词频？长句？双拼？）之后再换，比一上来就折腾配置划算得多。

如果你更习惯用 plum 管理方案而不是手动替换文件，也可以：

```bash
# 安装 plum
git clone --depth 1 https://github.com/rime/plum.git ~/plum
cd ~/plum

# 装到 IBus 的用户目录
rime_dir="$HOME/.config/ibus/rime" bash rime-install iDvel/rime-ice

# 重新部署
ibus-daemon -drx
```

plum 的好处是更新只需重跑 `rime-install`；坏处是它假设你的目录里已经有一套可用的 Rime 配置。第一次装、或者目录被搞乱了，还是手动解压 `full.zip` 最稳。

---

## 小结<span id="wrap-up"></span>

把这件事记成一句话：**ibus-rime 装引擎，雾凇拼音换词库，重新部署生效**。发行版只影响第一条命令，用户目录只影响第二条命令里的路径，剩下的在所有 Linux 上都一样。

对 GNOME 用户来说，这条路不需要第二个输入法框架、不需要环境变量、不需要开机自启脚本，升级系统时也少一处会坏的地方。如果你之前在 Fcitx5 上踩过坑，可以参考我之前那篇 [Fedora 44 初始化：Fcitx5 输入法](/blog/posts/zh/2026-08-14-fedora-44-init-fcitx5)——两套方案并不冲突，选一条走通就行。
