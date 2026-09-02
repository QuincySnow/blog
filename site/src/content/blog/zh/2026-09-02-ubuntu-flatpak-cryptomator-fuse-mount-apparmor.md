---
title: "Ubuntu 上 Flatpak 版 Cryptomator 报 fuse_mount failed 的排查与修复"
description: "Ubuntu 上 Flathub 的 Flatpak 版 Cryptomator 解锁 Vault 报 fuse_mount failed，根因是 AppArmor 的 fusermount3 profile 阻止了 FUSE 挂载，用 aa-logprof 生成允许规则解决"
pubDatetime: 2026-09-02T00:00:00Z
modDatetime: 2026-09-02T00:00:00Z
draft: false
tags:
  - Cryptomator
  - Flatpak
  - FUSE
  - AppArmor
  - Ubuntu
  - Linux
lang: zh
---

## 一、问题现象

在 Ubuntu 上使用 Flathub 的 Flatpak 版 Cryptomator 1.19.3 时，解锁 Vault 后无法完成挂载，提示：

```text
Error Code 6HCL:2GTN:IBE9

org.cryptomator.integrations.mount.MountFailedException:
org.cryptomator.jfuse.api.FuseMountFailedException: fuse_mount failed
```

从堆栈可以看到，错误发生在 Cryptomator 使用 Linux FUSE 挂载解密后的文件系统时：

```text
Vault.unlock()
    ↓
Mounter.mount()
    ↓
LinuxFuseMountProvider.mount()
    ↓
Fuse.mount()
    ↓
fuse_mount failed
```

因此，这并不是 Vault 密码错误，也不能直接判断为 Vault 损坏，而应该优先检查 FUSE 和系统安全策略。

## 二、确认 Cryptomator 使用的是 Flatpak

首先确认安装来源：

```bash
flatpak info org.cryptomator.Cryptomator
```

结果显示：

```text
版本：1.19.3
来源：flathub
安装：system
运行时：org.freedesktop.Platform/x86_64/25.08
```

因此使用的是 Flathub 的 Flatpak 版本。

## 三、检查 FUSE

检查 `/dev/fuse`：

```bash
ls -l /dev/fuse
```

得到：

```text
crw-rw-rw- 1 root root 10, 229 ...
```

说明 FUSE 设备存在，而且普通用户具有读写权限。

检查 FUSE 工具：

```bash
fusermount3 --version
```

结果：

```text
fusermount3 version: 3.18.2
```

再检查内核是否支持 FUSE：

```bash
cat /proc/filesystems | grep fuse
```

结果：

```text
fuseblk
nodev   fuse
nodev   fusectl
```

说明系统本身具备 FUSE 支持。

## 四、确认 Flatpak 沙盒也能够访问 FUSE

进入 Cryptomator Flatpak 环境：

```bash
flatpak run --command=sh org.cryptomator.Cryptomator
```

在沙盒内部检查：

```bash
ls -l /dev/fuse
fusermount3 --version
cat /proc/filesystems | grep fuse
```

同样能够看到：

```text
/dev/fuse
fusermount3 version: 3.18.2
```

以及：

```text
fuseblk
nodev   fuse
nodev   fusectl
```

这说明：

- `/dev/fuse` 存在
- Flatpak 可以访问 `/dev/fuse`
- Flatpak 中可以运行 `fusermount3`
- Flatpak 沙盒能够看到 FUSE 文件系统支持

因此，问题并不是简单的 Flatpak FUSE device 权限缺失。

甚至进一步测试：

```bash
flatpak run --device=all org.cryptomator.Cryptomator
```

依然无法挂载。

所以可以排除「给 Flatpak 增加 `--device=all` 就能解决」的方案。

## 五、查看系统日志，最终发现 AppArmor 拒绝

接下来查看内核日志：

```bash
sudo journalctl -k --since "10 minutes ago" | \
grep -iE 'fuse|apparmor|denied|cryptomator|mount'
```

最终发现了关键的 AppArmor 日志：

```text
apparmor="DENIED"
operation="..."
profile="fusermount3"
comm="fusermount3"
```

其中还出现了 Cryptomator Flatpak 运行时相关路径。

这说明真正的问题是：

> **Ubuntu 的 AppArmor `fusermount3` profile 阻止了 Cryptomator 使用 FUSE 完成挂载。**

这也解释了为什么另一套 Fedora 系统上的 Cryptomator 可以正常工作：两边的 Linux 安全策略体系不同，Fedora 默认使用 SELinux，而 Ubuntu 使用 AppArmor。

## 六、验证 AppArmor 是不是根因

Ubuntu 默认没有安装 `aa-complain` 命令时，可以安装：

```bash
sudo apt update
sudo apt install apparmor-utils
```

然后临时将 `fusermount3` 设置为 complain 模式：

```bash
sudo aa-complain /usr/bin/fusermount3
```

再次启动 Cryptomator：

```bash
flatpak run org.cryptomator.Cryptomator
```

解锁 Vault。

结果：

> **Vault 成功挂载。**

这就完成了关键验证。

`complain` 模式不会像 `enforce` 一样阻止违规操作，而是记录 AppArmor 事件，因此 Cryptomator 可以正常完成 FUSE 挂载。

由此可以确认：

```text
Cryptomator
    ↓
jfuse
    ↓
fusermount3
    ↓
AppArmor
    ↓
DENIED ❌
    ↓
fuse_mount failed
```

## 七、使用 `aa-logprof` 生成允许规则

既然已经确认是 AppArmor 导致，就不应该直接关闭整个 AppArmor。

使用：

```bash
sudo aa-logprof
```

让 AppArmor 根据实际产生的 `DENIED` 日志生成规则。

在处理 `fusermount3` 相关规则并选择允许后，Cryptomator 即可正常使用。

这是比直接关闭 AppArmor 更合理的方式。

## 八、注意：`aa-logprof` 不要无脑全部允许

这次排查中有一个很重要的教训。

运行：

```bash
sudo aa-logprof
```

时，它不一定只会显示 Cryptomator 的规则。

例如实际过程中还出现了：

```text
snap-confine
cupsd
systemd-detect-virt
```

等其他 AppArmor profile 的修改。

甚至 `fusermount3` 中出现了：

```text
include <abstractions/postfix-common>
include <abstractions/glycin>
```

以及：

```text
capability dac_override,
capability setuid,
```

和：

```text
mount options=(rbind, rw) /home/ub/.local/share/Cryptomator/mnt/ -> /,
mount options=(rbind, rw) /run/user/1000/ -> /,
mount options=(rprivate, rw) -> /,
```

其中有些规则明显与 Cryptomator 的 FUSE 挂载有关，但另一些规则则可能来自系统其他 AppArmor 事件。

因此：

> **不要看到 `aa-logprof` 就一路全部按 A（允许）到底。**

最好只处理刚刚触发的、能够明确对应目标程序的问题。

## 九、如果误保存了 AppArmor 修改怎么办？

如果 `aa-logprof` 已经保存修改，发现配置不理想，可以恢复软件包提供的原始配置。

首先确认配置文件属于哪个软件包：

```bash
sudo dpkg -S /etc/apparmor.d/fusermount3
```

例如：

```text
apparmor: /etc/apparmor.d/fusermount3
```

说明它属于 `apparmor` 软件包。

需要注意的是：

```bash
sudo apt install --reinstall apparmor
```

**不一定会覆盖已经被用户修改过的 AppArmor 配置文件。**

因为 `/etc/apparmor.d/fusermount3` 属于 Debian/Ubuntu 的配置文件（conffile），包管理器会保护用户已经修改过的配置。

如果需要恢复发行版提供的原始文件，可以从当前版本的 `apparmor` `.deb` 中提取：

```bash
cd /tmp
apt download apparmor
```

然后：

```bash
rm -rf /tmp/apparmor-original
mkdir /tmp/apparmor-original

dpkg-deb -x /tmp/apparmor_*.deb /tmp/apparmor-original
```

先比较：

```bash
diff -u \
  /tmp/apparmor-original/etc/apparmor.d/fusermount3 \
  /etc/apparmor.d/fusermount3
```

确认之后再恢复：

```bash
sudo cp \
  /tmp/apparmor-original/etc/apparmor.d/fusermount3 \
  /etc/apparmor.d/fusermount3
```

重新加载：

```bash
sudo apparmor_parser -r /etc/apparmor.d/fusermount3
```

之后再重新触发 Cryptomator 的 AppArmor 拒绝，并使用：

```bash
sudo aa-logprof
```

只允许真正需要的规则。

## 十、最终结果

最终的正确解决思路不是：

```bash
flatpak run --device=all ...
```

也不是：

```bash
sudo systemctl disable apparmor
```

更不是长期让：

```bash
sudo aa-complain /usr/bin/fusermount3
```

处于 complain 模式。

正确方案是：

```text
Ubuntu
  │
  ├─ Flatpak Cryptomator 1.19.3
  │
  ├─ /dev/fuse                         ✅
  ├─ fusermount3                       ✅
  ├─ 内核 FUSE                         ✅
  ├─ Flatpak FUSE 访问                 ✅
  │
  └─ AppArmor fusermount3 profile
             │
             └─ Cryptomator 挂载操作被 DENIED ❌
                          │
                          ↓
                    sudo aa-logprof
                          │
                          ↓
                  允许必要操作
                          │
                          ↓
                 Cryptomator 正常挂载 ✅
```

## 总结

遇到 Cryptomator：

```text
FuseMountFailedException: fuse_mount failed
```

不要第一时间认为是 Vault 损坏，也不要直接给 Flatpak 开 `--device=all`。

可以按照下面的顺序排查：

```bash
# 1. 检查 FUSE
ls -l /dev/fuse
fusermount3 --version
cat /proc/filesystems | grep fuse

# 2. 检查 Flatpak 内的 FUSE
flatpak run --command=sh org.cryptomator.Cryptomator

# 3. 检查 AppArmor
sudo journalctl -k --since "10 minutes ago" | \
grep -iE 'fuse|apparmor|denied|cryptomator|mount'

# 4. 如果确认 fusermount3 被 AppArmor 拦截
sudo apt install apparmor-utils
sudo aa-complain /usr/bin/fusermount3

# 5. 确认 Cryptomator 恢复正常后
sudo aa-logprof

# 6. 最终恢复强制模式
sudo aa-enforce /usr/bin/fusermount3
```

**核心结论：Ubuntu 上 Flatpak Cryptomator 的 `fuse_mount failed`，可能并不是 FUSE 没安装或 Flatpak 没有设备权限，而是 AppArmor 的 `fusermount3` profile 阻止了实际的 FUSE 挂载操作。**
