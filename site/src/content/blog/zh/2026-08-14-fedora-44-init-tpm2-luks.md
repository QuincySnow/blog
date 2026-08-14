---
title: "Fedora 44 初始化（三）：TPM2 自动解锁 LUKS2 磁盘加密"
description: "让 Fedora 44 的 LUKS2 磁盘加密配合 TPM2 芯片实现开机自动解锁，不再每次输入解密密码"
pubDatetime: 2026-08-14T00:00:00Z
modDatetime: 2026-08-14T00:00:00Z
draft: false
tags:
  - Fedora
  - Linux
  - TPM2
  - LUKS2
  - 磁盘加密
  - 安全
  - 教程
lang: zh
---

初始化系列的第三篇。Fedora 安装时勾选「加密」会启用 LUKS2 全盘加密，但每次开机都要输入解密密码很烦。好消息是：现代主板都自带 TPM2 芯片，可以让它帮你自动解锁。

---

## 前提条件

- Fedora 44 安装时选择了「加密」（LUKS2）
- 主板支持并已启用 TPM2（大多数 2016 年后的主板都有）

确认 TPM2 是否可用：

```bash
ls /dev/tpm*
# 应该看到 /dev/tpm0 和 /dev/tpmrm0
```

确认当前 LUKS 版本：

```bash
sudo cryptsetup luksDump /dev/nvme1n1p6 | head -5
# Version 应该是 2
```

> 把 `/dev/nvme1n1p6` 替换成你自己的加密分区。用 `lsblk` 查看：

```bash
lsblk -o NAME,FSTYPE,SIZE
```

---

## 步骤一：注册 TPM2 解锁凭据

一条命令搞定：

```bash
sudo systemd-cryptenroll --tpm2-device=auto /dev/nvme1n1p6
```

它会要求你输入当前的 LUKS 密码（就是每次开机输的那个）。输入后，TPM2 解锁凭据就注册好了。

成功输出：

```
New TPM2 token enrolled as key slot 1.
```

---

## 步骤二：验证

```bash
sudo systemd-cryptenroll /dev/nvme1n1p6
```

应该看到：

```
SLOT TYPE    
   0 password
   1 tpm2
```

- **Slot 0** → 你原来的 LUKS 密码（永远保留，这是兜底方案）
- **Slot 1** → TPM2 自动解锁

---

## 步骤三：重启测试

```bash
sudo reboot
```

正常情况下，开机应该直接进入 Fedora，不再弹出 `Please unlock disk ...` 提示。

如果仍然要求输入 LUKS 密码，输入原来的密码即可——你的数据没有任何问题，只是 TPM2 解锁可能需要额外配置。

---

## 工作原理

```
正常开机
   ↓
GRUB → Fedora
   ↓
systemd-cryptsetup 检测 TPM2 token
   ↓
TPM2 芯片验证通过 → 自动释放解锁密钥 ✅
   ↓
进入系统（无需输入密码）
```

如果 TPM2 验证失败（比如主板更换、BIOS 重置）：

```
TPM2 验证失败 ❌
   ↓
回退到 Slot 0 → 要求输入 LUKS 密码 🔑
   ↓
正常启动
```

---

## 进阶：绑定 PCR 增强安全性

默认的 `--tpm2-device=auto` 不绑定 PCR，也就是说只要 TPM2 芯片在就能解锁。如果你想让启动链发生变化时（比如 Secure Boot 被关闭、引导被篡改）自动要求输入密码，可以绑定 PCR：

```bash
# 绑定 Secure Boot 状态 + 启动链
sudo systemd-cryptenroll --tpm2-device=auto \
  --tpm2-pcrs=0+1+2+3+4+5+7 /dev/nvme1n1p6
```

| PCR | 含义 |
| --- | --- |
| 0 | UEFI 固件状态 |
| 1 | UEFI 配置 |
| 2 | 外设 ROM |
| 3 | UEFI 启动变量 |
| 4 | 加载的引导镜像 |
| 5 | GPT 分区表 |
| 7 | Secure Boot 状态 |

> ⚠️ **谨慎操作**：PCR 绑定后，BIOS 更新、Secure Boot 状态变化、引导链变动都可能导致 TPM 自动解锁失效。建议先用默认的不绑定 PCR 版本，确认稳定后再考虑进阶配置。

---

## 注意事项

- **永远不要删除 Slot 0**：它是你的 LUKS 密码兜底方案，TPM 出问题时全靠它
- **不要关闭 Secure Boot**（如果你绑定了 PCR 7）
- **不要清空 TPM**（`tpm2_clear`）
- **备份 LUKS 头**：`sudo cryptsetup luksHeaderBackup /dev/nvme1n1p6 --header-backup-file luks-header-backup.img`，把这个文件存到安全的 U 盘里

---

## 结语

LUKS2 + TPM2 自动解锁是 Fedora 加密用户的必做设置。一条命令，开机不再输密码，同时保留 LUKS 密码作为兜底。安全和便利，两个都要。

下一篇「初始化」文章见。
