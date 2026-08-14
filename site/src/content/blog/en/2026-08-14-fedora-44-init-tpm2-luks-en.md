---
title: "Fedora 44 Setup (Part 3): TPM2 Auto-Unlock for LUKS2 Disk Encryption"
description: "Let your TPM2 chip automatically unlock LUKS2 full-disk encryption on Fedora 44 — no more typing your decryption password at every boot"
pubDatetime: 2026-08-14T00:00:00Z
modDatetime: 2026-08-14T00:00:00Z
draft: false
tags:
  - Fedora
  - Linux
  - TPM2
  - LUKS2
  - Encryption
  - Security
  - Tutorial
lang: en
---

Part three of the setup series. When you pick "Encrypt" during Fedora install, it enables LUKS2 full-disk encryption — but typing your decryption password at every boot gets old fast. The good news: most modern motherboards have a TPM2 chip that can unlock it for you automatically.

---

## Prerequisites

- Fedora 44 installed with "Encrypt" enabled (LUKS2)
- TPM2 supported and enabled in BIOS/UEFI (most motherboards since ~2016)

Check if TPM2 is available:

```bash
ls /dev/tpm*
# Should show /dev/tpm0 and /dev/tpmrm0
```

Check your LUKS version:

```bash
sudo cryptsetup luksDump /dev/nvme1n1p6 | head -5
# Version should be 2
```

> Replace `/dev/nvme1n1p6` with your encrypted partition. Find it with:

```bash
lsblk -o NAME,FSTYPE,SIZE
```

---

## Step 1: Enroll TPM2

One command:

```bash
sudo systemd-cryptenroll --tpm2-device=auto /dev/nvme1n1p6
```

It will ask for your current LUKS password (the one you type at every boot). Enter it, and the TPM2 token is enrolled.

Success output:

```
New TPM2 token enrolled as key slot 1.
```

---

## Step 2: Verify

```bash
sudo systemd-cryptenroll /dev/nvme1n1p6
```

You should see:

```
SLOT TYPE    
   0 password
   1 tpm2
```

- **Slot 0** → Your original LUKS password (keep it forever — this is your fallback)
- **Slot 1** → TPM2 auto-unlock

---

## Step 3: Reboot and Test

```bash
sudo reboot
```

On normal boot, you should go straight to Fedora without seeing the `Please unlock disk ...` prompt.

If it still asks for your LUKS password, just enter it — your data is fine. TPM2 auto-unlock may just need additional configuration.

---

## How It Works

```
Normal boot
   ↓
GRUB → Fedora
   ↓
systemd-cryptsetup detects TPM2 token
   ↓
TPM2 chip verifies → releases unlock key automatically ✅
   ↓
System starts (no password needed)
```

If TPM2 verification fails (motherboard replaced, BIOS reset, etc.):

```
TPM2 verification failed ❌
   ↓
Falls back to Slot 0 → asks for LUKS password 🔑
   ↓
System starts normally
```

---

## Advanced: Bind PCR for Stronger Security

The default `--tpm2-device=auto` doesn't bind PCRs — it only checks that the TPM2 chip is present. If you want the system to require your LUKS password when the boot chain changes (Secure Boot disabled, bootloader tampered, etc.), bind PCRs:

```bash
# Bind Secure Boot state + boot chain
sudo systemd-cryptenroll --tpm2-device=auto \
  --tpm2-pcrs=0+1+2+3+4+5+7 /dev/nvme1n1p6
```

| PCR | Meaning |
| --- | --- |
| 0 | UEFI firmware state |
| 1 | UEFI configuration |
| 2 | Peripheral ROMs |
| 3 | UEFI boot variables |
| 4 | Loaded boot images |
| 5 | GPT partition table |
| 7 | Secure Boot state |

> ⚠️ **Proceed with caution**: PCR binding means BIOS updates, Secure Boot changes, or boot chain modifications can break TPM auto-unlock. Start with the default (no PCR binding) and only add PCR binding after you've confirmed it works.

---

## Important Notes

- **Never delete Slot 0**: It's your LUKS password fallback — your lifeline if TPM fails
- **Don't disable Secure Boot** (if you bound PCR 7)
- **Don't clear the TPM** (`tpm2_clear`)
- **Backup your LUKS header**: `sudo cryptsetup luksHeaderBackup /dev/nvme1n1p6 --header-backup-file luks-header-backup.img` — store this file on a safe USB drive

---

## Wrap-up

LUKS2 + TPM2 auto-unlock is a must-do for any Fedora user with disk encryption. One command, no more typing passwords at boot, with your LUKS password as a safety net. Security and convenience — both.

See you in the next "setup" article.
