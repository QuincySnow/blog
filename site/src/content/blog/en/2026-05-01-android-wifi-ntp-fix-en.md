---
title: "Fixing WiFi Network Restrictions on Stock Android and Modifying NTP Server"
description: "Solve stock Android WiFi network restriction issues using ADB commands and configure NTP server settings"
pubDatetime: 2026-05-01T00:00:00Z
modDatetime: 2026-05-01T00:00:00Z
draft: false
tags:
  - Android
  - WiFi
  - ADB
  - NTP
lang: en
---

## 1. Fixing Network Restrictions

### Using ADB Commands

First, delete the default addresses:

```bash
adb shell settings delete global captive_portal_https_url
adb shell settings delete global captive_portal_http_url
```

Then set the new addresses:

```bash
adb shell settings put global captive_portal_https_url https://connect.rom.miui.com/generate_204
adb shell settings put global captive_portal_http_url http://connect.rom.miui.com/generate_204
```

## 2. Installing ADB (Windows)

ADB can be installed using winget or scoop.

### Method 1: Using Winget

1. Open Command Prompt or PowerShell
2. Run the following command to install ADB and Fastboot:

```powershell
winget install Google.PlatformTools
```

3. Verify Installation

Check ADB version:

```bash
adb version
```

Check Fastboot version:

```bash
fastboot version
```

### Method 2: Installing Google USB Driver (Optional)

You only need to follow this step if you connect your Android device in Fastboot mode and Windows doesn't recognize it.

1. **Download the Driver**

   Download the [Google USB Driver](https://developer.android.com/studio/run/win-usb). Click "Download the Google USB Driver ZIP file (ZIP)". You don't need to follow "Get it from the Android SDK Manager" unless you have Android Studio installed.

2. **Extract the downloaded zip file**

3. **Update Driver in Device Manager**
   - Connect your Android device in Fastboot mode to your PC
   - Open Device Manager
   - Locate your Android device (usually listed under "Unknown Devices")
   - Right-click the device and select "Update driver"
   - Choose "Browse my computer for driver software"
   - Click "Let me pick from a list of available drivers on my computer"
   - Click "Have Disk…" and navigate to the folder where you extracted the driver
   - Select `android_winusb.inf` and follow the prompts (ignore any unsigned driver warnings if necessary)

You're all set!
