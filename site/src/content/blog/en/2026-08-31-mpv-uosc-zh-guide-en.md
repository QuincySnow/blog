---
title: "Make MPV Speak Chinese: Install uosc and Enable the Simplified Chinese UI"
description: "From zero: install MPV and the uosc modern UI, then set languages=zh-hans,slang,en in uosc.conf for a Simplified Chinese interface, covering Windows, Linux and Android"
pubDatetime: 2026-08-31T00:00:00Z
modDatetime: 2026-08-31T00:00:00Z
draft: false
tags:
  - mpv
  - uosc
  - media-player
  - Windows
  - Linux
  - Android
  - Tooling
lang: en
---

# Make MPV Speak Chinese: Install uosc and Enable the Simplified Chinese UI

**MPV** is one of the most powerful open-source media players, but its default on-screen controller (OSC) is rather bare-bones. **uosc** is a modern, proximity-based UI enhancement script that ships with a **complete Simplified Chinese translation**. This guide takes you from zero: install MPV → install uosc → change one line → restart, and the UI is in Chinese. Desktops (Windows/Linux) and Android phones are all covered.

## 1. Install MPV

### Windows

Pick any of the following:

- **Scoop (recommended)**: `scoop install mpv` (the shinchiro build from the main bucket). New to Scoop? Check my [Scoop guide](/blog/posts/en/2025-01-12-Scoop-en).
- **winget** (official CI MSVC build): `winget install --id=mpv-player.mpv-CI.MSVC -e`
- **Chocolatey**: `choco install mpv`
- **Manual**: download the prebuilt archive from [mpv.io/installation](https://mpv.io/installation/), extract it, and add the folder containing `mpv.exe` to your `PATH`.

### Linux

- **Debian / Ubuntu**: `sudo apt install mpv`
- **Fedora**: `sudo dnf install mpv`
- **Arch Linux**: `sudo pacman -S mpv`
- **openSUSE**: `sudo zypper install mpv`
- **Flatpak (any distro)**: `flatpak install flathub io.mpv.Mpv`

Verify the install with: `mpv --version`.

## 2. Install uosc

uosc ([GitHub: tomasklaen/uosc](https://github.com/tomasklaen/uosc)) replaces MPV's default OSC with a modern UI: timeline thumbnails, menus, subtitle download, and more.

### One-line installer

**Windows** (PowerShell):

```powershell
# Optional: only needed the first time to run a remote script
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

irm https://raw.githubusercontent.com/tomasklaen/uosc/HEAD/installers/windows.ps1 | iex
```

**Linux / macOS** (bash, requires `curl` and `unzip`):

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/tomasklaen/uosc/HEAD/installers/unix.sh)"
```

The installer puts uosc into your mpv config directory and creates a default `uosc.conf` in `script-opts/` if one doesn't exist.

### Manual install

1. Download `uosc.zip` from the [uosc Releases page](https://github.com/tomasklaen/uosc/releases/latest).
2. Extract it into your **mpv config directory**:
   - **Windows**: `%APPDATA%\mpv\` (i.e. `C:\Users\<username>\AppData\Roaming\mpv\`)
   - **Linux**: `~/.config/mpv/`
   - **Flatpak mpv**: `~/.var/app/io.mpv.Mpv/config/mpv/`
3. If `uosc.conf` is not present yet, download it from the releases page and put it into the `script-opts/` subdirectory.

After install, `uosc.conf` lives at:

| Platform      | Path                                                       |
| ------------- | ---------------------------------------------------------- |
| Windows       | `%APPDATA%\mpv\script-opts\uosc.conf`                      |
| Linux         | `~/.config/mpv/script-opts/uosc.conf`                      |
| Flatpak mpv   | `~/.var/app/io.mpv.Mpv/config/mpv/script-opts/uosc.conf`   |

## 3. Switch the UI to Chinese

Open `uosc.conf` in a text editor and find the Localization section. It looks like this:

```
# Localization language priority from highest to lowest.
# Also controls what languages are fetched by `download-subtitles` menu.
# Built in languages can be found in `uosc/intl`.
# `slang` is a keyword to inherit values from `--slang` mpv config.
# Supports paths to custom json files: `languages=~~/custom.json,slang,en`
languages=slang,en
```

Change the last line to:

```
languages=zh-hans,slang,en
```

What each part means:

- **Left to right = priority from highest to lowest**: the first language that matches wins.
- **`zh-hans`**: uosc's built-in Simplified Chinese translation (a complete translation, language file at `uosc/intl/zh-hans.json`) — **no download needed**.
- **`slang`**: a keyword that inherits values from your mpv `--slang` config (usually your subtitle language preference).
- **`en`**: English fallback, so the UI never ends up blank.
- This option also controls **which subtitle languages** the `download-subtitles` menu fetches.

Save the file, then **fully restart mpv** — the UI is now in Chinese.

> **Tip**: Putting `zh-hans` first only changes the uosc interface language; it doesn't interfere with mpv's own subtitle language selection.

## 4. Optional: further tweaks

Add these to `mpv.conf` for a more complete uosc experience:

```
# uosc provides its own seeking & volume indicators, so the default osd-bar can go
osd-bar=no

# uosc draws its own window controls and border
border=no
```

- **Timeline thumbnails**: install [thumbfast](https://github.com/po5/thumbfast); uosc integrates with it seamlessly, no extra config.
- **Sluggish UI**: if the interface feels slow during playback, add `video-sync=display-resample` (at the cost of slightly higher CPU/GPU load).
- **Custom keybindings** (`input.conf`):

  ```
  tab   script-binding uosc/toggle-ui
  space cycle pause; script-binding uosc/flash-pause-indicator
  ```

For more player modernization ideas, check out my [2026 multi-platform modern player tuning guide](/blog/posts/en/2026-02-01-Video_and_muisc-en).

## 5. Mobile: mpvRex — MPV on Android

Want MPV on your phone too? There's a modern libmpv-based player for Android: **mpvRex** ([GitHub: sfsakhawat999/mpvRex](https://github.com/sfsakhawat999/mpvRex)).

**What it is**: mpvRex is a fork of mpvEx (which itself descends from mpv-android), bringing the libmpv engine to Android with a modern Jetpack Compose UI. The MPV features you enjoy on desktop — HDR, hardware decoding, shader pipelines — are available on your phone as well.

Highlights:

- **Glassmorphism player UI** + Material You dynamic theming
- **HDR-to-SDR tone mapping** via the hdr-toys shader pipeline
- Circular double-tap seek, seek cancellation, subtitle drag-to-reposition & swipe seeking, A-B loop, frame-by-frame navigation, zoom & pan
- File explorer + media library: M3U playlists, WebDAV/SMB/FTP streaming proxy, embedded cover art thumbnails
- Picture-in-picture, vertical Shorts mode, battery-optimized background playback

**Install** (sideload the APK on Android):

1. Open the [mpvRex Releases page](https://github.com/sfsakhawat999/mpvRex/releases).
2. Pick the APK for your device architecture: most modern phones want `REX-Player-arm64-v8a-<version>.apk`; older 32-bit devices want `armeabi-v7a`; when in doubt, grab `universal`.
3. Install the APK (allow "install from unknown sources" on first sideload).

For preview builds, visit [sfsakhawat999.github.io/mpvRex](https://sfsakhawat999.github.io/mpvRex) — keep in mind preview builds may be unstable and are for testing only.

> **Tip**: mpvRex is a standalone local player, not a remote control for desktop mpv. If you want to control your PC player from the phone, that's a different category of tool (e.g. mpv's `--input-ipc-server` plus a remote app) and is out of scope here.

## FAQ

- **Can't find `uosc.conf`?** Grab it from the releases page and put it in `script-opts/` inside your mpv config directory; uosc also writes a default one on the next launch.
- **Changes not taking effect?** Make sure you edited the config directory mpv actually reads — a `portable_config` folder next to the mpv executable takes precedence over `%APPDATA%\mpv` or `~/.config/mpv`.
- **Flatpak can't read files?** The Flatpak sandbox only grants access to select directories; authorize home access with Flatseal (Filesystem → Home) first.
- **Want English back?** Set `languages` back to `slang,en`.

[中文版](/blog/posts/zh/2026-08-31-mpv-uosc-zh-guide)
