---
title: "AM4 on Windows 11 25H2 and Above: Compatibility, Drivers, and Tuning (2026)"
description: Ryzen 2000–5000 on Windows 11 25H2, PBO and Curve Optimizer guide
pubDatetime: 2026-03-12T00:00:00Z
modDatetime: 2026-03-12T00:00:00Z
draft: false
tags:
  - amd
  - ryzen
  - am4
  - windows11
  - 25h2
  - pbo
  - curve-optimizer
  - tutorial
  - hardware
lang: en
---

AM4 (Ryzen 2000–5000, including 3000/5000 X3D) is **fully supported** on **Windows 11 25H2** (2025 Update) and later. AMD and Microsoft have not added new AM4 hardware requirements for 25H2; the platform runs well and benefits from the latest drivers.

## Compatibility (2026)

- **Microsoft**: Windows 11 25H2 supports AMD Ryzen 2000 and up (including 3000, 4000 G, 5000, and X3D). Ryzen 5000 (Zen 3) is fully supported.
- **AMD chipset drivers**: AMD has updated Ryzen chipset drivers for **Windows 11 25H2** (e.g. 7.11.26.2142, 8.01.20.513). Covers B450, B550, X570, A520, etc., including PMF, 3D V-Cache, RAID.
- **Known issues**: Old BIOS or drivers can cause upgrade hangs or reboot loops. Fix: update motherboard BIOS (AGESA 1.2.0.x+) and install the latest AMD chipset driver. For RAID, prefer USB install.
- **NPU**: 25H2 NPU features are optional (Copilot+ PC); AM4 without NPU is fine.

Upgrade via Windows Update (“Get the latest updates as soon as they’re available”) or official ISO.

## Before upgrading

1. Update motherboard BIOS from the vendor site.
2. Install the latest AMD chipset driver (AMD site, AM4).
3. Back up data and create a restore point.
4. Ensure TPM 2.0 (fTPM) and Secure Boot are enabled in BIOS.

## Performance tuning

Use **AMD Ryzen Master** only for overclocking, PBO, and Curve Optimizer on Windows 11 25H2. Avoid manual OC in BIOS to prevent conflicts.

For full steps and details, see the [Chinese version](2026-03-12-am4-windows11-25h2-guide) of this guide.
