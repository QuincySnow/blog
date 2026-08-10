---
title: 无 Mac 装黑苹果：GitHub Actions + OpCore Simplify 实践分享
description: 分享一套无 Mac 环境下可用的工具链与操作顺序（镜像→U 盘→EFI→USB Map→安装）
pubDatetime: 2026-02-27T00:00:00Z
modDatetime: 2026-02-27T00:00:00Z
draft: false
tags:
  - hackintosh
  - opencore
  - macos-iso-builder
  - OpCore-Simplify
  - USBToolBox
  - OCAT
  - ProperTree
  - NootRX
lang: zh
---

## 前言

这里分享的是**在没有 Mac 的情况下**，我实际跑通的一套黑苹果安装流程，供同好参考。整体思路是：

- **镜像**：用 GitHub Actions（[macOS-iso-builder](https://github.com/LongQT-sea/macos-iso-builder)）在线从 Apple 拉取并打成可引导镜像
- **U 盘**：Rufus 写入 `dmg`，得到基础安装盘
- **EFI**：用 [OpCore-Simplify](https://github.com/lzhoang2801/OpCore-Simplify) 按本机硬件生成 OpenCore EFI 骨架——**工具会自动完成下载和配置，用户只需按菜单选系统版本、显卡方案等**
- **USB 映射**：**这一步需要用户自己处理**——用 [USBToolBox/tool](https://github.com/USBToolBox/tool) 扫端口、生成 USB Map kext，并替换 EFI 里的默认 USB 文件
- **配置维护**：用 [ProperTree](https://github.com/corpnewt/ProperTree) 或 [OCAuxiliaryTools（OCAT）](https://github.com/ic005k/OCAuxiliaryTools) 挂载 EFI、校对 `config.plist`（可选）

涉及到的仓库建议先 Star，方便后续跟更新：

- 安装镜像：[macOS-iso-builder](https://github.com/LongQT-sea/macos-iso-builder)
- USB 映射：[USBToolBox/tool](https://github.com/USBToolBox/tool)
- EFI 生成：[OpCore-Simplify](https://github.com/lzhoang2801/OpCore-Simplify)
- plist / OC 管理：[ProperTree](https://github.com/corpnewt/ProperTree) 或 [OCAT](https://github.com/ic005k/OCAuxiliaryTools)
- AMD RX 6000+ 独显补丁：[NootRX](https://github.com/ChefKissInc/NootRX)

> **免责声明**：黑苹果涉及 Apple 许可与硬件兼容性，以下仅为个人技术分享，请自行评估风险。

---

## 一、用 GitHub Actions 生成 macOS 安装镜像

这里用的是 [macOS-iso-builder](https://github.com/LongQT-sea/macos-iso-builder)。

### Fork 并启用 Actions

1. 打开仓库页面，点击右上角 **Fork** 到自己的账号下。
2. 进入自己 Fork 出来的仓库，切到 **Actions** 标签页。
3. 首次使用需要点一次绿色按钮：**"I understand my workflows, go ahead and enable them"** 启用工作流。

### 选系统版本与镜像格式

进入 Actions 页面后，左侧会看到一组以 **"Build macOS XXX"** 命名的工作流列表，大致包含（下图为示例界面，动图见下）：

1. 一般有两类工作流可以用：
   - **01. Build Recovery ISO image**：推荐作为小体积恢复镜像，下载和构建都更快。
   - 各版本对应的 **Build macOS \[版本名\]**（如 _Build macOS Sonoma_、_Build macOS Tahoe_ 等），相当于 README 里说的 Full Installer。
2. 点进你想要的工作流，点击右侧的 **"Run workflow"**，在弹出的表单中：
   - 如果有 **macOS version** 选项，就选你要的版本（Sonoma、Sequoia、Tahoe 等）。
   - **Image format**：**务必选择 `dmg`**。
     - `iso`：只适合虚拟机挂载，不适合作为实机启动 U 盘镜像。
     - `dmg`：适合用 Rufus/`dd` 写入 U 盘，做物理机安装盘。
3. 再次点击绿色按钮开始运行，等待 GitHub Actions 完成。

### 下载并解压

1. 工作流完成后，刷新页面，下拉到 **Artifacts** 区域。
2. 下载类似 `macOS_Sonoma_xx.dmg.zip` 或 `macOS_Sequoia_xx.dmg.zip` 的压缩包。
3. 在本地解压，得到的文件名通常形如：`macOS_Sonoma.dmg.img` —— 这是给 Rufus 等工具直接识别用的。

---

## 二、Rufus 做安装 U 盘

建议在 **Windows** 上用 [Rufus](https://rufus.ie) 完成。

1. 插入一个容量 ≥ 16GB 的 U 盘，确认内部数据已经备份（会被完全格式化）。
2. 打开 Rufus，关键选项：
   - **设备**：选择你的 U 盘。
   - **启动选择**：浏览并选中上一步解压出来的 `*.dmg.img` 文件。
   - 其余分区类型、目标系统等一般保持默认即可。
3. 点击 **开始**，等待写入完成。

完成后，你得到的是一个**只有基础安装文件、还没有合适 EFI** 的启动盘，接下来需要为它准备对应硬件的 EFI，  
并把生成好的 `EFI` 文件夹**直接放进这个 Rufus 写好的 U 盘的 EFI 分区**（覆盖掉原来的 EFI 即可）。

---

## 三、OpCore Simplify 生成 EFI

[OpCore-Simplify](https://github.com/lzhoang2801/OpCore-Simplify) 会按本机硬件**自动下载 OpenCore、Kext 并生成 EFI**，用户只需在菜单里选硬件报告、系统版本、显卡方案（如 NootRX）、声卡等，工具会搞定其余配置。**只有 USB 映射需要用户稍后用 USBToolBox 单独做**（见下一节）。  
（本仓库内实现可参考 `Py/OpCore-Simplify.py`。）

### 启动方式

- **Windows**：`OpCore-Simplify.bat`
- **macOS / Linux**：`OpCore-Simplify.command` 或 `OpCore-Simplify.py`

主菜单为：

- **1**：Select Hardware Report（选择硬件报告）
- **2**：Select macOS Version（选择系统版本）
- **3**：Customize ACPI Patch（自定义 ACPI 补丁）
- **4**：Customize Kexts（自定义 Kext，可在此调整显卡/声卡等）
- **5**：Customize SMBIOS Model（自定义 SMBIOS）
- **6**：Build OpenCore EFI（构建 EFI，会**自动下载**并生成）
- **Q**：退出

### 推荐操作顺序

1. 选 **`1`（Select Hardware Report）`**。
   - **Windows**：输入 **`E`** 可调用 Hardware Sniffer 导出当前机器配置到 `SysReport/Report.json`（并自动加载 ACPI 表）。
   - 或直接拖入已有的 `Report.json`。
2. 工具会**自动依次**：做兼容性检查 → 让你选择 macOS 版本 → 硬件定制（禁用设备等）→ 选择 SMBIOS → 选择 ACPI 补丁 → **选择所需 Kext（此处选显卡方案、声卡 Layout 等）** → SMBIOS 相关选项。
   - **显卡**：AMD RX 6000 系列及以上请选 [NootRX](https://github.com/ChefKissInc/NootRX)，不要选旧实现。**声卡**：一般保持默认 Layout 即可，有问题再回来用菜单 **4** 调整。
3. 完成后回到主菜单。如需微调，可再选 **3**（ACPI）、**4**（Kext）、**5**（SMBIOS）。
4. 选 **`6`（Build OpenCore EFI）**：程序会**自动拉取** OpenCore 与所需 Kext，生成完整 EFI 目录。
5. 构建结束后会弹出 **「Before Using EFI」** 说明，其中会要求你完成 **USB 映射**（见下一节）；输入 **`AGREE`** 可打开生成好的 EFI 目录。

---

## 四、USBToolBox 做 USB Map（需用户自行完成）

EFI 里自带的 USB 配置是通用的，**USB 端口映射需要用户按本机实际端口做一遍**，用 [USBToolBox/tool](https://github.com/USBToolBox/tool) 完成。

### 发现端口并生成 kext

1. 根据你的系统下载对应版本（Windows.exe / macOS.zip 等）。
2. 打开程序，进入端口发现（Discover Ports）界面。
3. 按提示操作：
   - 将一个 USB 设备依次插入每一个物理 USB 口，等待列表中识别到设备后再换下一个口。
   - 如果在 Windows 下，USBToolBox 会自动推断 USB 2/3 伴生端口类型。

完成所有端口插拔后，进「选择端口」界面，按需保留/禁用端口，按 **`K`** 生成 USB Map kext（如 `UTBMap.kext`）。

### 把 USBToolBox 结果写回 EFI

构建 EFI 完成后，OpCore Simplify 的「Before Using EFI」说明里会写清：用 USBToolBox 做好映射后，将生成的 **UTBMap.kext** 放入 **EFI/OC/Kexts/**，并**删除**该目录下的 **UTBDefault.kext**；再用 ProperTree 打开 `config.plist`，按 **Ctrl+R**（或 Command+R）执行 **OC Snapshot** 同步 Kext 列表；若单控制器端口数超过 15，需启用 XhciPortLimit 相关补丁。完成后保存。输入 **`AGREE`** 后程序会打开生成好的 EFI 目录，便于你复制到 U 盘。

这一步完成后，你的 EFI 已经具备了**针对当前主板的 USB 正确映射**，可以极大提升稳定性（睡眠、唤醒、安装过程中键盘鼠标可用等）。

---

## 五、ProperTree 或 OCAT 校对 config.plist

- [ProperTree](https://github.com/corpnewt/ProperTree)：轻量 plist 编辑 + OC Snapshot
- [OCAT](https://github.com/ic005k/OCAuxiliaryTools)：带 EFI 挂载、OC/Kext 更新，更适合日常维护

### ProperTree

1. `git clone` 或下载 ZIP，运行 `ProperTree.command`（macOS）或 `ProperTree.bat`（Windows）。
2. 打开你的 `EFI/OC/config.plist`。
3. 使用菜单中的 **OC Clean Snapshot/OC Snapshot** 功能：
   - 指定 `EFI/OC` 目录后，自动同步 `ACPI/Add`、`Kernel/Add`、`Misc/Tools`、`UEFI/Drivers` 等条目。
   - 移除无用条目，保证 kext 顺序与实际磁盘内容一致。
4. 检查以下关键点：
   - `Misc -> Security` 中的 SecureBootModel、ScanPolicy 是否符合你的安装需求。
   - `PlatformInfo -> Generic` 中的 SMBIOS 信息是否合理（避免与真机冲突）。
   - `Kernel -> Add` 中是否正确引用了 USB Map kext、NootRX 等。

### OCAT

如果你更习惯图形化，可以用 OCAT：

1. 运行 OCAT，挂载 EFI 分区，自动打开 `config.plist`。
2. 点击更新按钮，让 OCAT 帮你：
   - 升级 OpenCore 版本到最新。
   - 同步/更新常见 kext。
3. 根据 CPU 类型选择预设 Quirks（Intel/AMD）。
4. 在 `Kernel`、`ACPI`、`UEFI` 等页面中，确认：
   - 仅保留当前实际需要的条目。
   - USB Map 与 NootRX 等 kext 已勾选启用。
5. 保存退出，OCAT 会自动按最新 schema 写回 `config.plist`。

### 稳定后精简 boot-args

若系统已运行稳定，可在 `config.plist` 的 **NVRAM → Add → 7C436110-AB2A-4BBB-A880-FE41995C9F82 → boot-arg** 中删掉多余参数，**只保留**下面两个即可（用 ProperTree 或 OCAT 编辑均可）。二者均为 AMD 平台常见推荐，用于改善睡眠/唤醒稳定性；若你当前睡眠正常，可先不加，出现异常再加回。

| 参数                           | 作用与说明                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **dart=0**                     | 禁用 DART（DMA Remapping Table）。macOS 12+ (Monterey) 引入的 DMA 保护主要面向 Apple Silicon，在 AMD x86 上会干扰 PCIe 设备（USB / NVMe / 显卡）的 DMA，导致睡眠后无法唤醒、USB 丢失或重启崩溃。AMD 芯片组（B550/X570 等）与 macOS 的 DART 兼容性差，社区多数 AMD 用户加 `dart=0` 后睡眠更稳（尤其外接 USB 唤醒）。**测试**：删掉 `dart=0` → 测睡眠/唤醒 → 异常再加回。**风险**：无（仅禁用 DART）。 |
| **ipc_control_port_options=0** | 修改 IPC（进程间通信）控制端口选项，修复 macOS 12+ 唤醒时 IPC 端口未正确重置导致的卡死或 USB/外接设备失效。AMD Ryzen 5000+ 的电源管理（SMCAMDProcessor）与 macOS IPC 兼容性差，易出现唤醒黑屏或设备断连；社区（r/hackintosh、amd-osx）确认加此参数可解决大量唤醒问题，常与 `dart=0` 搭配使用。**测试**：删掉后多测几次睡眠/唤醒（如 10 次）→ 异常再加回。**风险**：无（仅优化 IPC）。                |

---

## 六、BIOS 与首次安装

在真正尝试从 U 盘启动前，记得先检查 BIOS/UEFI 设置：

- **开启 AHCI**，关闭 Intel RST/RAID。
- **关闭 CSM/Legacy Boot**，改为纯 UEFI 启动。
- 关闭安全启动（Secure Boot）。
- 如有需要，关闭 VT-d 或按 OpenCore 指南正确配置相关 Quirks。

然后：

1. 将前面制作好的 U 盘插入目标机器。
2. 从 BIOS 启动菜单选择 U 盘启动，进入 **OpenCore 启动界面**。
3. 在启动项中选择对应的 **Install macOS** 条目，进入安装向导。
4. 正常分区、格式化（APFS/Guid），按照向导完成安装过程。

安装完成后，建议：

1. 把 U 盘上的 EFI 目录复制到系统盘的 EFI 分区（macOS 下可以用"磁盘工具"或 `diskutil` 挂载 EFI，Windows 下**推荐使用 DiskGenius** 挂载和浏览 EFI 分区，也可以用自带磁盘管理/分区工具分配盘符）。
2. 以后就可以直接从系统盘 EFI 启动，而不再依赖 U 盘；如果后期需要修改 EFI，同样通过**磁盘工具 / DiskGenius 等分区工具挂载 EFI 分区**后，替换或编辑其中的 `EFI` 内容即可。

---

## 七、显示器亮度无法调节时

安装完成后，如果发现**无法用系统或键盘控制外接/内置显示器亮度**，推荐使用 [MonitorControl](https://github.com/MonitorControl/MonitorControl)：通过 DDC/CI 控制显示器亮度与音量，支持菜单栏滑块、键盘快捷键，适配多显示器。在 GitHub 的 [Releases](https://github.com/MonitorControl/MonitorControl/releases) 下载安装即可。

---

## 八、开发者环境部署

系统稳定后，如需搭建常用开发环境，可安装 **Homebrew**（包管理）与 **Oh My Zsh**（Zsh 配置框架）。

### 安装 Homebrew

在终端执行官方一键安装脚本（见 [brew.sh](https://brew.sh)）：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

按提示完成安装后，根据终端输出的说明把 `brew` 加入 PATH（Apple Silicon 常见路径为 `/opt/homebrew/bin`，Intel 为 `/usr/local/bin`）。

### 安装 Oh My Zsh

已安装 Zsh（macOS 默认）后，执行（见 [ohmyz.sh](https://ohmyz.sh)）：

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

安装完成后可在 `~/.zshrc` 中更换主题、插件等。

### Oh My Zsh 推荐插件（Homebrew 安装）

用 Homebrew 安装最省事，且不依赖直连 GitHub。以下三个插件均可直接安装：

| 插件                             | 作用                                  |
| -------------------------------- | ------------------------------------- |
| **zsh-autosuggestions**          | 根据历史命令给出灰色预测，按 → 采纳   |
| **zsh-syntax-highlighting**      | 命令语法高亮（正确绿色、错误红色等）  |
| **zsh-history-substring-search** | 输入子串后按 ↑/↓ 在历史中搜索匹配命令 |

安装（需已安装 Homebrew）：

```bash
brew install zsh-autosuggestions zsh-syntax-highlighting zsh-history-substring-search
```

在 `~/.zshrc` **末尾**加入（顺序勿改，**zsh-syntax-highlighting 须在最后**）。`$(brew --prefix)` 会随 Intel/Apple Silicon 自动对应 `/usr/local` 或 `/opt/homebrew`：

```bash
# Homebrew 安装的 zsh 插件
source $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source $(brew --prefix)/share/zsh-history-substring-search/zsh-history-substring-search.zsh
source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

若出现 "highlighters directory not found"，在 `~/.zshenv` 中增加一行（没有该文件则新建）：

```bash
export ZSH_HIGHLIGHT_HIGHLIGHTERS_DIR=$(brew --prefix)/share/zsh-syntax-highlighting/highlighters
```

保存后执行 `source ~/.zshrc` 或新开终端即可生效。

### 可选：安装 fzf

[fzf](https://github.com/junegunn/fzf) 是模糊查找工具，可配合 Ctrl+R 搜历史、Ctrl+T 选文件、管道过滤等。需要时可安装：

```bash
brew install fzf
```

安装完成后执行一次配置脚本（会询问是否把键绑定与补全写入 `.zshrc`，选默认即可）：

```bash
$(brew --prefix)/opt/fzf/install
```

按提示完成后，新开终端即可使用。

---

## 检查清单

### 镜像与启动盘

- [ ] Fork 并启用 [macOS-iso-builder](https://github.com/LongQT-sea/macos-iso-builder) 的 GitHub Actions
- [ ] 选择目标 macOS 版本，**镜像类型选 `dmg`（实机安装）**
- [ ] 下载并解压 Actions 生成的 `*.dmg.zip`，得到 `*.dmg.img`
- [ ] 在 Windows 下用 Rufus 将 `*.dmg.img` 写入 U 盘

### EFI 生成与 USB 映射

- [ ] 使用 [OpCore-Simplify](https://github.com/lzhoang2801/OpCore-Simplify) 扫描硬件（菜单 `1` → `E`）
- [ ] 根据兼容性结果选择合适的 macOS 版本
- [ ] 显卡部分：如为 AMD RDNA 2，选择 [NootRX](https://github.com/ChefKissInc/NootRX) 方案
- [ ] 声卡 Layout ID 暂时保持默认，必要时再调
- [ ] 通过 USBToolBox 扫描所有 USB 端口并生成 USB Map kext
- [ ] 删除 EFI 中默认 USB kext（如 `UTBDefault.kext`），换成 USBToolBox 生成的 USB Map

### config.plist 校对与优化

- [ ] 使用 [ProperTree](https://github.com/corpnewt/ProperTree) 或 [OCAuxiliaryTools](https://github.com/ic005k/OCAuxiliaryTools) 打开 `config.plist`
- [ ] 执行 OC Snapshot/更新功能，同步 ACPI/Kernel/UEFI 列表
- [ ] 确认 NootRX、USB Map 等 kext 已启用且顺序合理
- [ ] 检查 SecureBootModel、ScanPolicy、SMBIOS 等关键配置

### 安装与收尾

- [ ] BIOS 中关闭 CSM、Secure Boot，启用 AHCI、UEFI 启动
- [ ] 通过 OpenCore 启动安装器完成 macOS 安装
- [ ] 将 U 盘 EFI 复制到系统盘 EFI 分区，设置为默认启动

---

以上是我目前用的流程，如有更好的做法欢迎补充。
