---
title: "Ubuntu 26.04 休眠（Hibernate）实战：swapfile + resume_offset + dracut 完整配置"
description: "Ubuntu 26.04 / GNOME 50 休眠方案对比：优先推荐一键脚本 ubuntu-gnome-hibernate，以及必须用 swapfile 时如何手算 resume_offset 并配置 GRUB 与 dracut"
pubDatetime: 2026-09-13T00:00:00Z
modDatetime: 2026-09-13T00:00:00Z
draft: false
tags:
  - Ubuntu
  - Linux
  - GNOME
  - 教程
lang: zh
---

Windows 上的「睡眠」和「休眠」是两个不同的东西，Linux 上对应的是 Suspend 和 Hibernate。

先说结论：**如果你只是想省事地把休眠用起来，就直接走 swap 分区 + 关 Secure Boot 这条路，然后用 [`jdtanner/ubuntu-gnome-hibernate`](https://github.com/jdtanner/ubuntu-gnome-hibernate)**——它把 GRUB、initramfs、PolicyKit、合盖休眠、GNOME 50 电源菜单按钮全部一次性配好，不用手敲一堆命令。你实际要动手的只有两件事：**准备一个 ≥ 内存的 swap 分区**，以及**关闭 Secure Boot**——具体怎么做见第二节。

如果你和大多数 Ubuntu 用户一样是默认的 **swapfile**，又不想为了休眠重新分区，那就得自己算 `resume_offset`——这是本文第四～八节详细展开的部分，也是很多教程最容易讲错的地方。

本文基于 **Ubuntu 26.04.1 LTS + GNOME Shell 50.1 + 内核 7.0.0-31** 实测。项目的主脚本在 24.04 / 24.10 / 25.10 上微调后也能用，但它的 GNOME 扩展只针对 GNOME 50（更旧的 GNOME 用上游的 [Hibernate Status Button](https://extensions.gnome.org/extension/755/hibernate-status-button/)）。

文末第十节给了「不工作的时候看哪里」的排查清单，配置完直接跑不起来的话可以先翻那里。

---

## 一、先搞清楚：Suspend 还是 Hibernate

Windows 的睡眠 ≈ Linux 的 Suspend（挂起）：内存继续供电，CPU 与大部分设备进入低功耗，按键盘就能秒回。Linux 里对应：

```bash
systemctl suspend
```

Windows 的休眠 ≈ Linux 的 Hibernate：把内存内容写入磁盘，然后**真正断电**，第二天开机恢复原样。它才是「睡一晚上不怕断电丢数据」的那个。

| Windows | Linux / Ubuntu |
| --- | --- |
| 睡眠 Sleep | Suspend / 挂起 |
| 休眠 Hibernate | Hibernate / 休眠 |
| 混合睡眠 | Hybrid Sleep |
| 关机 | Power Off |

要注意的是：**Ubuntu 装好之后，Hibernate 默认不一定可用**。内核和 systemd 本身都支持（`cat /sys/power/disk` 里能看到 `platform`），但能不能真的用起来，取决于 swap 是否够大、swap 是分区还是 swapfile、以及 resume 参数有没有配好。

先看这台机器现在的状态：

```bash
swapon --show
free -h
cat /proc/cmdline
cat /sys/power/state
cat /sys/power/disk
```

我的输出：

```text
NAME      TYPE SIZE   USED PRIO
/swap.img file  32G 184.6M   -1

内存：  total 30Gi   swap 31Gi
```

```text
freeze mem disk          # /sys/power/state：支持 disk（即 hibernate）
[platform] shutdown reboot suspend test_resume
```

`/sys/power/state` 里出现 `disk`，就说明系统在能力上支持写盘休眠。

## 二、真正要做的两件事：swap 分区 + 关 Secure Boot

如果你决定走推荐路线，**实际动手的就只有两件事**：准备一个 ≥ 内存的 swap 分区，以及关掉 Secure Boot。做完这两步，`ubuntu-gnome-hibernate` 就能一条脚本跑完剩下的。

### 2.1 关闭 Secure Boot

休眠需要内核在锁定的安全策略下写入并恢复内存镜像，Secure Boot 开着会直接报：

```text
Failed to hibernate system via logind: Sleep verb "hibernate" not supported
```

先在系统里确认当前状态：

```bash
mokutil --sb-state
```

输出 `SecureBoot disabled` 就是已关闭（我的机器就是这个状态），无需再做什么。如果显示 `enabled`，就需要重启进 UEFI/BIOS 设置，在 **Security → Secure Boot** 里把它设为 **Disabled**。

关掉之后系统安全性会下降，这是权衡：Secure Boot 会阻止未签名内核模块加载，和休眠的恢复机制冲突。如果你必须保持 Secure Boot，那就只能用本文后半部分的 swapfile 手配方案试试（也不保证成功）。

### 2.2 准备 swap 分区

标准是 **容量 ≥ 内存**。我的 30 GiB 内存，就应该有 32 GiB 左右的 swap 分区。

先看当前磁盘布局：

```bash
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT
```

```text
NAME          SIZE FSTYPE MOUNTPOINT
nvme1n1     953.9G
├─nvme1n1p1   300M vfat   /boot/efi
├─nvme1n1p2    16M
├─nvme1n1p3 349.1G ntfs
└─nvme1n1p4 604.5G ext4   /
```

这台机器上没有空闲分区，也没有现成的 swap 分区，所以要做的是**从现有分区里腾出 32 GiB**。两种常见做法：

**做法 A：图形界面（推荐，最不容易出错）**

```bash
sudo apt install gparted
sudo gparted
```

1. 选一个空间充裕的分区（我这里是 `/dev/nvme1n1p4`，604.5G ext4 根分区）。
2. 右键 → **Resize/Move** → 把分区缩小，腾出 32 GiB 的未分配空间。
3. 在未分配空间上右键 → **New** → 文件系统选 **linux-swap**。
4. 点 ✓ 应用。

如果缩小的是**正在使用的根分区**，GParted 需要离线操作（它不支持在线缩小 ext4），所以会提示你从 Live USB 启动。这是正常要求，按提示做即可。

**做法 B：命令行（`parted` + `mkswap`）**

```bash
# 先确认设备名和分区号，以下以 /dev/nvme1n1p4 缩小、新建 p5 为例
sudo parted /dev/nvme1n1
```

```text
(parted) print free          # 看空闲空间和分区边界
(parted) resizepart 4 <新结束位置>
(parted) mkpart primary linux-swap <起始> <结束>
(parted) quit
```

> ⚠️ **缩小分区是破坏性操作，先备份重要数据。** 分区号和边界每个机器都不一样，务必用 `print free` 的实际输出替换上面的占位符，不要照抄。

新分区建好后，把它格式化成 swap：

```bash
sudo mkswap /dev/nvme1n1p5
```

到此为止，**先不要 `swapon`、也不要写 `/etc/fstab`**——启用 swap、写 fstab、以及处理旧的 `/swap.img`，都交给下一节的脚本做（职责划分见 2.4）。

> 如果你不打算用 `ubuntu-gnome-hibernate`（比如想完全手动），那就自己补齐：`sudo swapon /dev/nvme1n1p5`，取 `lsblk -f /dev/nvme1n1p5` 的 UUID 写进 `/etc/fstab`（`UUID=<swap分区UUID>  none  swap  sw  0  0`），并把原来 `/swap.img` 那行删掉。

### 2.3 下载并运行项目脚本

先把项目拿到本地（脚本没有发布到 release，只能 clone）：

```bash
git clone https://github.com/jdtanner/ubuntu-gnome-hibernate
cd ubuntu-gnome-hibernate
```

然后跑诊断脚本，确认它认出了你刚建的 swap 分区：

```bash
sudo bash hibernate-diagnose.sh
```

重点看 `=== Swap partition UUID (blkid) ===` 那一段——里面的设备和 UUID 就是要填进主脚本的两个值：

```bash
sudo nano complete-hibernate-setup-ubuntu-2604-gnome.sh
```

```bash
SWAP_PARTITION="/dev/你的swap分区"
SWAP_UUID="你的swap分区UUID"
```

确认改对了再执行（脚本会验证 UUID，不匹配会直接退出，不会写错）：

```bash
chmod +x complete-hibernate-setup-ubuntu-2604-gnome.sh
sudo ./complete-hibernate-setup-ubuntu-2604-gnome.sh
sudo reboot
sudo systemctl hibernate                 # 重启后测试
```

### 2.4 职责划分：fstab 交给脚本，别自己写

这里容易踩坑，说清楚：

| 步骤 | 你自己做 | 脚本做 |
| --- | --- | --- |
| 建分区、`mkswap` 格式化 | ✅ | ❌ |
| 启用 swap（`swapon`） | ❌ | ✅ |
| 写 `/etc/fstab` | ❌ | ✅ |
| 处理旧的 `/swap.img` | ❌ | ✅ |

也就是说，**2.2 做到 `mkswap` 就可以停了**：不用 `swapon`、不用写 `/etc/fstab`、也不用自己去动 `/swap.img` 那行。这些都是脚本的活，你手动做了反而会在 fstab 里留下重复条目。

如果想自己完全手动（不走项目），那就反过来——自己写完 `swapon` / fstab / 删 `/swap.img`，**不跑主脚本**；两者不要混着来。

### 2.5 可选：合盖休眠、电源菜单按钮、卸载

这两步不做也能休眠，但多半是你想要的（在 clone 下来的目录里执行）：

```bash
# 合盖休眠（会重启 logind，当前会话会退出，先存盘）
chmod +x configure-lid-hibernate.sh
sudo ./configure-lid-hibernate.sh

# 电源菜单加「休眠」按钮
cd hibernate-status-gnome50
chmod +x install.sh
./install.sh
```

装完扩展后**要注销再登录**（或重启），按钮才会出现在电源菜单里。

想彻底回滚（项目 README 给了完整卸载步骤）：

```bash
sudo rm /etc/systemd/system/systemd-suspend.service
sudo rm /etc/polkit-1/rules.d/10-enable-hibernate.rules
sudo rm /etc/polkit-1/rules.d/11-disable-suspend.rules
sudo rm /etc/systemd/sleep.conf
sudo rm /etc/systemd/logind.conf.d/hibernate-lid.conf
sudo rm /etc/initramfs-tools/conf.d/resume
sudo update-initramfs -u
sudo cp /etc/default/grub.backup.<时间戳> /etc/default/grub   # 用脚本生成的备份
sudo update-grub
sudo systemctl daemon-reload
sudo systemctl restart systemd-logind polkit
# 想恢复 swapfile 就再加回 fstab 那行
```

**如果你想要更多电源选项**：除了单纯加个 Hibernate 按钮，还有个 [Power Off Options](https://github.com/Tiago-Silva/power-off-options) 扩展，它不是只加 Hibernate，而是给关机界面加上 Hybrid Sleep、Suspend Then Hibernate、Turn Off Screen、Soft Reboot、Restart to BIOS、自定义命令等一整套。如果你以后想做「Suspend 一段时间 → 没人动 → 自动 Hibernate」这种玩法，它比单纯的 Hibernate 按钮更好用。

### 2.6 为什么我还是用了 swapfile

上面做法 A 里那句「缩小正在使用的根分区需要从 Live USB 启动」，就是我没走这条路的原因：**这台上没有空闲分区，要腾 32 GiB 就得离线缩根分区**，一次性风险比收益大。既然 swapfile 能实现完全一样的效果，我选择了不重新分区。

如果你的机器上有空闲空间、或者你愿意从 Live USB 操作，**那 swap 分区 + 项目脚本才是更省事的路子**，不需要看后面的 `resume_offset` 推导。

## 三、swapfile 与 swap partition 的关键区别

Hibernate 的前提是 **swap 容量 ≥ 内存**（更准确地说，要能放下内核压缩后的内存镜像，一般是内存的 0.5～1 倍）。我的内存 30 GiB，swap 就得 32 GiB 左右——不管它是分区还是 swapfile。

两种形式真正的差别在于 **resume 的定位方式**：

| | swap partition（推荐） | swapfile |
| --- | --- | --- |
| 定位方式 | `resume=UUID=<swap分区UUID>` | `resume=UUID=<根文件系统UUID>` + **`resume_offset=<物理偏移>`** |
| 恢复参数个数 | 1 个 | 2 个（offset 要自己算） |
| 内核读取 | 直接读该块设备 | 需要 offset 才能在文件里找到镜像 |
| 需不需要重分区 | 需要 | 不需要 |
| 适合 | 有空间/愿意分区 | 不想动分区表 |

**结论：能用分区就用分区。** 分区只需一个 `resume=UUID=`，`ubuntu-gnome-hibernate` 也能直接帮你把剩下全做了；swapfile 多一个需要手算的 `resume_offset`，是下面几节的全部复杂度来源。

Ubuntu 现在的默认是 **swapfile**（`/swap.img`）。但 swapfile 有个陷阱：**内核在 resume 阶段还没有文件系统概念**，它只能按「根设备 + 物理块偏移」去读。所以必须额外告诉它 `resume_offset`。

关键的一点是：这里要的是**文件在物理磁盘上的偏移，不是文件系统的逻辑偏移**。后者算出来是错的，会导致开机卡在恢复界面或直接失败。

## 四、算出 resume_offset（swapfile 方案的核心）

对 ext4 上的 swapfile，用 `filefrag` 拿到第一个物理块号：

```bash
sudo filefrag -v /swap.img
```

输出里 `physical_offset` 列**第一行的数字，直接就是 `resume_offset`**，不需要乘任何块大小。

这点最容易搞错，原因有两个：

- 内核文档说的是 `resume_offset` 以 **`PAGE_SIZE` 为单位**（即块号，不是字节），而 `filefrag` 的 `physical_offset` 列打印出来时已经除过块大小（e2fsprogs 源码里是 `fe_physical >> blk_shift`），所以两者单位一致，**直接用**。
- 如果把它当成字节、或又乘一次 4096，得到的就是错误的值（差 4096 倍），**开机时会恢复失败**。

我这台机器上这个值是：

```text
resume_offset=42401792
```

换算一下就是文件在根分区上大约 161.75 GiB 处（`42401792 × 4096`），对 604.5 GiB 的 `/dev/nvme1n1p4` 来说是合理位置。

> 注：内核文档描述的做法是“用能用 FIBMAP 的工具定位 swap 头的偏移”，并且要求 swapfile 本身**不能有空洞**（不能是稀疏文件）。`filefrag` 输出的块号就是这里要的值；如果 `filefrag` 报 `FIBMAP requires root privileges`，记得前面加 `sudo`。

确认根文件系统的 UUID：

```bash
lsblk -f
```

替换成实际值，得到这两个参数（后面两项都要用）：

```text
resume=UUID=7c9cf0b1-8fd6-4ea6-af62-a088b64c85f7
resume_offset=42401792
```

## 五、配置 GRUB

把两个 resume 参数加到 `/etc/default/grub` 的 `GRUB_CMDLINE_LINUX_DEFAULT`：

```bash
sudo nano /etc/default/grub
```

```conf
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash resume=UUID=7c9cf0b1-8fd6-4ea6-af62-a088b64c85f7 resume_offset=42401792"
```

然后更新 GRUB：

```bash
sudo update-grub
```

## 六、dracut 侧配置（Ubuntu 26.04 的 initramfs）

Ubuntu 26.04 上 initramfs 实际由 **dracut** 生成（`initramfs-tools` 并未安装，`dracut` 包会提供一个兼容的 `update-initramfs` 转调脚本）。dracut 默认不一定会把 resume 相关的内容打进 initramfs，所以需要显式声明两件事：

```bash
sudo tee /etc/dracut.conf.d/20-hibernate.conf <<'EOF'
add_dracutmodules+=" resume "
hostonly_cmdline="yes"
EOF
```

再写一份把 resume 参数固化进 initramfs 的文件：

```bash
sudo mkdir -p /etc/cmdline.d
sudo tee /etc/cmdline.d/20-resume.conf <<'EOF'
resume=UUID=7c9cf0b1-8fd6-4ea6-af62-a088b64c85f7
resume_offset=42401792
EOF
```

然后重建 initramfs：

```bash
sudo dracut --force --regenerate-all
```

这一步会重新生成 `/boot/initrd.img-*`。它会用当前内核并覆盖同名文件，建议先备份一下：

```bash
sudo cp /boot/initrd.img-$(uname -r) /boot/initrd.img-$(uname -r).before-hibernate
```

重建完成后可以对比文件大小确认真的重新生成了（我的从 38,743,705 字节变成 37,848,647 字节）。

## 七、systemd 侧确认

systemd 自带 `systemd-hibernate-resume` 生成器和 `systemd-hibernate.service`，只要 initramfs 和内核参数里带了 `resume` / `resume_offset`，它会自动接管。验证：

```bash
systemctl status systemd-hibernate.service --no-pager
cat /sys/power/resume
cat /sys/power/resume_offset
```

正常应该看到：

```text
systemd-hibernate.service - System Hibernate
     Loaded: loaded (/usr/lib/systemd/system/systemd-hibernate.service; static)

259:4
42401792
```

`/sys/power/resume` 是 `主设备号:次设备号`（259:4 就是根分区的设备号），`/sys/power/resume_offset` 应该和 GRUB 里写的完全一致。这两个值对得上，Hibernate 链路就打通了。

## 八、测试与 GNOME 电源菜单按钮

先别急着睡。**先直接跑一次**，观察它是否正常断电、再开机是否恢复：

```bash
systemctl hibernate
```

我的实测结果是：执行后电脑完全断电 → 按电源键开机 → GNOME、Firefox、终端全部恢复到休眠前的样子。

不过这时候 GNOME 的电源菜单里**还是看不到「休眠」按钮**。原因是 GNOME 默认不显示 Hibernate，而且 PolicyKit 默认也可能不允许普通用户触发。

> 如果你走的是 `ubuntu-gnome-hibernate` 那条路，这一步它已经替你做了（包含 polkit 规则和 GNOME 50 扩展），可以跳过。

如果和我一样是手动配置，就自己装一个扩展把按钮加回来。GNOME 50 上可用的是 **Hibernate Power Menu**（作者 arnakazim，支持 GNOME 48/49/50），我就是用的这个：

```bash
# 从 extensions.gnome.org 安装
# hibernate-power-menu@arnakazim
```

也可以用命令行确认它已启用：

```bash
# 手动方案用这个（作者 arnakazim）
gnome-extensions enable hibernate-power-menu@arnakazim

# 项目自带的是另一个：hibernate-status-gnome50/ 装出来 UUID 是 hibernate-status@dromi
gnome-extensions enable hibernate-status@dromi
```

装上之后，电源菜单里就会出现「休眠」项，点它等同于 `systemctl hibernate`。

> 两个扩展不一样，别混：`hibernate-power-menu@arnakazim` 是社区扩展（额外提供 Hybrid Sleep 选项），`hibernate-status@dromi` 是 `ubuntu-gnome-hibernate` 项目对老牌 Hibernate Status Button 的 GNOME 50 fork。两个都能用，选一个就行。

## 九、省事的方案：`ubuntu-gnome-hibernate`（推荐优先考虑）

坦白讲，上面第三到第七节那一堆命令，正是 [`jdtanner/ubuntu-gnome-hibernate`](https://github.com/jdtanner/ubuntu-gnome-hibernate) 这个项目想替你解决的问题。我把它放在这里详细讲，是因为**对大多数人来说它才是正确答案**，而我的情况只是恰好不符合它的前提条件。

它一次性覆盖了整条链：

- GRUB `resume=`
- initramfs 配置
- PolicyKit 授权
- Hibernate 按钮（含 GNOME 50 扩展）
- 合盖 → Hibernate
- Suspend → Hibernate
- 诊断脚本

它意识到的问题层次，和我上面拆分的一模一样：**Hibernate 不是一个开关，而是一条链**——内核 → swap/resume → GRUB → initramfs → PolicyKit → GNOME 按钮 → 合盖/自动休眠。

### 使用方法

先把项目拿到本地（脚本没有发布到 release，只能 clone）：

```bash
git clone https://github.com/jdtanner/ubuntu-gnome-hibernate
cd ubuntu-gnome-hibernate
```

```bash
# 1. 先跑诊断脚本，记下 swap 分区名和 UUID
sudo bash hibernate-diagnose.sh

# 2. 编辑主脚本顶部的两个常量（脚本里默认值针对作者自己的机器）
#    SWAP_PARTITION="/dev/nvme1n1p1"
#    SWAP_UUID="ffa0a70a-..."

# 3. 执行
chmod +x complete-hibernate-setup-ubuntu-2604-gnome.sh
sudo ./complete-hibernate-setup-ubuntu-2604-gnome.sh

# 4. 重启后测试
sudo systemctl hibernate
```

主脚本实际做的事（我读过它的源码）：检查 swap 分区与 UUID 匹配、确认 swap 容量 ≥ 内存、关闭 `/swap.img` 并从 fstab 删除（备份 `/etc/fstab.backup.swapfile`）、启用 swap 分区、备份 GRUB 后写入 `resume=UUID=`（并清掉旧的 `resume`/`resume_offset`）、写 `/etc/initramfs-tools/conf.d/resume`、重建 initramfs、建 `systemd-suspend.service → systemd-hibernate.service` 软链接、写 `sleep.conf`（`AllowSuspend=no`）、装两条 polkit 规则、重启 logind/polkit。全程有颜色提示和确认停顿，且 `SWAP_UUID` 不匹配会直接 `die`——这是一个防呆保护，能防你误在自己机器上跑作者的参数。

诊断脚本比你想象的简单：就只输出 RAM、`swapon --show`、`lsblk`、`blkid | grep swap`、当前 GRUB 参数、`mokutil --sb-state`、内核版本这七项，没有别的。

可选的合盖休眠与 GNOME 按钮（同样在 clone 下来的目录里执行）：

```bash
sudo ./configure-lid-hibernate.sh             # 合盖休眠（会重启 logind，当前会话会退出）
cd hibernate-status-gnome50 && ./install.sh  # 电源菜单加 Hibernate 按钮（UUID: hibernate-status@dromi）
```

合盖脚本比我预想的细致：它同时配三处——当前用户会话的 `gsettings`（AC 与电池分别设）、GDM 登录界面的 gsettings（失败会 `warn` 而非报错），以及 `/etc/systemd/logind.conf.d/hibernate-lid.conf` 作为兜底（`HandleLidSwitch=hibernate`、`HandleLidSwitchDocked=ignore`）。这样即使 GNOME 自己没处理合盖事件，logind 也能接住。

它甚至提供了完整的卸载步骤（回滚 GRUB 备份、删 polkit 规则、恢复 swapfile），这点比很多一次性脚本负责得多。

### 它的硬性前提条件

| 前提 | 说明 |
| --- | --- |
| **swap 分区** | 必须是分区，不是 swapfile；且容量 ≥ 内存 |
| **Secure Boot 关闭** | 开着会直接报 `Sleep verb "hibernate" not supported` |
| Ubuntu 26.04 | 其它版本可用但要微调；GNOME 扩展只针对 GNOME 50 |
| 未加密的 swap | 加密 swap 需要额外配置，脚本不覆盖 |

**致命区别**就在这条：这个项目只支持 **swap partition**，README 明确说它不处理 swapfile 的 `resume_offset`。它的主脚本里会：

```text
禁用 /swap.img
↓
从 /etc/fstab 移除 swapfile
↓
启用 swap partition
```

也就是说，**在你已经跑通 swapfile 方案的机器上直接运行主脚本，会把它推倒重来**，把系统切到 swap 分区。所以怎么选：

| 你的情况 | 建议 |
| --- | --- |
| 有（或愿意建）≥ 内存的 swap 分区 | ✅ **推荐：关 Secure Boot + `ubuntu-gnome-hibernate`**，不用看本手配部分 |
| 不想动分区表、只能用 swapfile | 走本文第四～八节，手算 `resume_offset` |
| 加密 swap | 两者都要额外配置，脚本不覆盖 |
| Secure Boot 必须开 | ❌ 两者都不行，休眠需要关闭 Secure Boot |
| 已配好 swapfile 方案 | 只借它的 GNOME 50 扩展和 `configure-lid-hibernate.sh` |

对比一下两种方案：

| | `ubuntu-gnome-hibernate`（推荐） | 本文 swapfile 手配 |
| --- | --- | --- |
| 需不需要重分区 | 需要（swap 分区） | 不需要 |
| 需不需要自己算 offset | ❌ | ✅ |
| 需不需要 Secure Boot 关闭 | 是 | 是 |
| initramfs 重建方式 | 脚本调 `update-initramfs -u` | 直接 `dracut --force` |
| 残留的旧 resume 参数 | 脚本会主动清掉 | 需自己确认 GRUB 里没有 |

> 注：Ubuntu 26.04 上 `dracut` 包自带的 `update-initramfs` 是个转调到 dracut 的兼容脚本（`initramfs-tools` 并未安装），所以两种写法最终都由 dracut 生成 initramfs，区别只在写哪个 `resume` 配置文件。
| Ubuntu + GNOME | ✅ | ✅ |
| GNOME 50 | ✅ | ✅ |
| GRUB `resume` | ✅ | ✅ |
| initramfs | initramfs-tools 路径（实际由 dracut 生成） | dracut |
| swap partition | 要求 | 不需要 |
| swapfile | ❌ | ✅ |
| `resume_offset` | ❌ | ✅ |
| 合盖 → Hibernate | ✅ | 可借用 |
| Suspend → Hibernate | 会强制重定向 | 未改（建议别改） |

另外这个项目目前只有 2 stars、1 个 commit，我也不会把它当成成熟的系统级方案来依赖——它的价值在于**GNOME 50 扩展和诊断思路**，核心 hibernate 配置部分，swapfile 场景下本文这套反而更完整。

## 十、排查：不工作的时候看哪里

这套东西出了问题，症状往往很含糊（开机直接进系统没恢复、或者报不支持休眠）。按下面顺序看，基本能定位：

```bash
# 1. 内核到底有没有拿到 resume 参数（分区方案应有 resume=UUID=，swapfile 还要 resume_offset=）
cat /proc/cmdline | grep resume

# 2. swap 是不是真的启用了、类型对不对
swapon --show

# 3. 两条关键状态：resume 设备号 + offset
cat /sys/power/resume
cat /sys/power/resume_offset

# 4. 软链接在不在（项目方案特有）
ls -la /etc/systemd/system/systemd-suspend.service

# 5. 看日志，这一步信息最多
journalctl -b | grep -iE '(hibernate|suspend)' | tail -30
```

几个典型症状：

| 症状 | 大概原因 |
| --- | --- |
| 报 `Sleep verb "hibernate" not supported` | Secure Boot 没关 |
| 执行后关机了，开机直接重进桌面没恢复 | `resume`/`resume_offset` 不对，或没重建 initramfs |
| 电源菜单里只有 Suspend 没有 Hibernate | 扩展没装、或装了没注销重登；项目方案下 Suspend 被 polkit 隐藏是正常的 |
| 开机卡在恢复界面很久 | swapfile 的 `resume_offset` 过时（文件被移动/碎片化过） |

> `resume_offset` 过时是个容易忽略的坑：swapfile 一旦被重新创建或碎片整理，物理偏移就变了，必须重新用 `filefrag -v` 算一遍。

另一个坑是**空洞（稀疏文件）**：内核要求 swapfile 不能有空洞。检查一下：

```bash
sudo filefrag -v /swap.img | head -20   # 看 extent 是否连续
cat /proc/swaps                          # 确认 swap 已启用且大小符合预期
```

## 十一、一个建议：别把 Suspend 全局改成 Hibernate

该项目的 README 提到，它会建立 `systemd-suspend.service` → `systemd-hibernate.service` 的软链接，从而让**所有** suspend 调用（包括 GNOME 合盖睡眠、快捷键）都变成 Hibernate。

如果你的目标只是「电源菜单有 Hibernate 按钮 + 晚上自动休眠」，**没必要**这么做：Suspend 秒回、Hibernate 要写盘再关机，日常合盖直接变写盘会让体验变差。想省电可以只配「合盖后过一段时间再 Hibernate」，而不是把 Suspend 整个替换掉。

## 十二、最终配置总结

最终这台机器的形态：

```text
Ubuntu 26.04.1 LTS + GNOME Shell 50.1 + kernel 7.0.0-31
└── Hibernate
    ├── /swap.img              32 GiB（swapfile）
    ├── resume=UUID=<根分区UUID>
    ├── resume_offset=42401792
    ├── GRUB  kernel cmdline
    ├── dracut  initramfs（resume 模块 + /etc/cmdline.d/20-resume.conf）
    ├── systemd-hibernate-resume（259:4 / 42401792 验证一致）
    ├── GNOME 50：hibernate-power-menu@arnakazim 扩展
    └── 实测：systemctl hibernate → 断电 → 开机完整恢复
```

要点回顾：

1. **推荐路线就两步：swap 分区 + 关 Secure Boot**，然后一条 [`ubuntu-gnome-hibernate`](https://github.com/jdtanner/ubuntu-gnome-hibernate) 脚本收尾。别手敲一堆命令。
2. 有 swap 分区就不用管 `resume_offset`，那是 swapfile 才需要的东西。
3. Hibernate ≠ Suspend。前者写盘后断电，后者内存继续供电。
4. 只能用 swapfile 时，关键是 **`resume_offset`**：用 `filefrag -v` 取 `physical_offset` **第一行的数字直接用**（单位是 `PAGE_SIZE`，不是字节，不要再乘 4096）。
5. Ubuntu 26.04 用 **dracut**，需要显式加入 `resume` 模块并写 `/etc/cmdline.d/20-resume.conf`。
6. 校验用 `/sys/power/resume` 与 `/sys/power/resume_offset`，必须和内核参数一致。
7. GNOME 50 默认没有 Hibernate 按钮，用 `hibernate-power-menu@arnakazim`（社区）或项目自带的 `hibernate-status@dromi` 补上。
8. `ubuntu-gnome-hibernate` 只支持 swap partition；**swapfile 用户不要跑它的主脚本**，只借它的扩展与辅助脚本。
9. 不要轻易把 Suspend 全局重定向到 Hibernate。
10. 不工作了先看第十节的排查清单：`/proc/cmdline`、`swapon --show`、`/sys/power/resume*`、`journalctl -b | grep -iE '(hibernate|suspend)'`。
