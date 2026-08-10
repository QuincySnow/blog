---
title: "Play Integrity Fix Guide 2025 — Magisk & KernelSU / KSU Next"
description: "Complete guide to pass strong Play Integrity on rooted Android devices, supporting all ROMs"
pubDatetime: 2026-05-01T00:00:00Z
modDatetime: 2026-05-01T00:00:00Z
draft: false
tags:
  - Android
  - Root
  - Magisk
  - KernelSU
  - Play Integrity
  - Security
lang: en
---

⚠️ **WARNING: Choose the correct method for your root. Do NOT mix Magisk and KernelSU/APatch setups.**

---

## Method A — Magisk (Zygisk enabled)

### Required Downloads

- Play Integrity Fork (v14.1)
- Tricky Store (v1.4.0)
- TSupport-Advance
- Key Attestation
- Play Integrity API Checker

### Step 1: Remove Conflicting Modules

Uninstall any previous versions of Play Integrity Fix or other root-hiding modules.

### Step 2: Install Required Modules

Install the modules above in Magisk > Modules.

🔁 Reboot device.

### Step 3: Configure Magisk DenyList

1. Open Magisk > Settings
2. Enable Enforce DenyList
3. Add the following apps:
   - com.google.android.gms
   - com.android.vending
   - com.google.android.gsf
   - Any other apps to pass integrity (WhatsApp, banking apps)

🔁 Reboot device.

### Step 4: Configure TSupport-Advance

1. Open Magisk > Modules
2. Tap TSupport-Advance > Action Button
3. Press Volume Up when prompted to select all options
4. Wait for module to finish

🔁 Reboot device.

### Step 5: Clear App Data & Verify Integrity

1. Go to Settings > Apps > Google Play Store / Play Services / target apps
2. Clear cache & storage

🔁 Reboot device.

Install Play Integrity API Checker and confirm all checks pass:

- ✅ Basic Integrity
- ✅ Device Integrity
- ✅ Strong Integrity

### Step 6: Fix Strong Integrity (if needed)

If you failed Strong Integrity or only passed Basic Integrity:

1. Install a Pixel prop module in Magisk
2. Reboot device
3. Re-run Play Integrity API Checker

---

## Method B — KernelSU / KSU Next / APatch

### Required Downloads

1. [Zygisk Next (Recommended)](https://github.com/Dr-TSNG/ZygiskNext) / [ReZygisk](https://github.com/PerformanC/ReZygisk) / [NeoZygisk](https://github.com/JingMatrix/NeoZygisk)
2. [Play Integrity Fork](https://github.com/osm0sis/PlayIntegrityFork)
3. [microG](https://microg.org/) (two components)
4. [SUSFS4KSU](https://github.com/sidex15/susfs4ksu-module)

### Step 1: Install Zygisk Variant

Install one Zygisk implementation compatible with your root environment.

### Step 2: Install Required Modules

Install all modules above.

🔁 Reboot device.

### Step 3: Install Aurora Store

You can install F-Droid to manage open source software: [F-Droid](https://f-droid.org/en/) (recommended)

Or install via [Aurora Store](https://store.auroraoss.com/)
