---
title: "Fedora 44 Setup (Part 1): GNOME Extensions"
description: "All five default GNOME Shell extensions that ship with Fedora 44 Workstation, plus eight recommended user extensions, with official websites and install commands"
pubDatetime: 2026-08-14T00:00:00Z
modDatetime: 2026-08-14T00:00:00Z
draft: false
tags:
  - Fedora
  - GNOME
  - Linux
  - Tutorial
lang: en
---

Starting with Fedora 44, I'm writing a "post-install setup" series covering the essential things to configure after a fresh system install. This first article is about GNOME Shell extensions — five ship with the system by default, and eight more user extensions cover pretty much every daily-use scenario.

Fedora 44 Workstation ships with **GNOME Shell 50** and includes the following five system-wide extensions, installed in `/usr/share/gnome-shell/extensions/`:

| Extension | UUID | Enabled by default |
| --- | --- | --- |
| Background Logo | `background-logo@fedorahosted.org` | ✅ Yes |
| Apps Menu | `apps-menu@gnome-shell-extensions.gcampax.github.com` | No |
| Launch New Instance | `launch-new-instance@gnome-shell-extensions.gcampax.github.com` | No |
| Places Status Indicator | `places-menu@gnome-shell-extensions.gcampax.github.com` | No |
| Window List | `window-list@gnome-shell-extensions.gcampax.github.com` | No |

Four of them come from the upstream `gnome-shell-extensions` project (four of them are part of the officially supported Classic Mode), while Background Logo is maintained by the Fedora project itself and is the only one enabled by default.

---

## List Your Installed Extensions

First, check which extensions are on your system:

```bash
gnome-extensions list
```

Only show enabled ones:

```bash
gnome-extensions list --enabled
```

Show details (version, description) for one extension:

```bash
gnome-extensions info apps-menu@gnome-shell-extensions.gcampax.github.com
```

On Fedora these extensions are provided by separate RPM packages. Verify what's installed:

```bash
rpm -qa | grep gnome-shell-extension
```

---

## 1. Background Logo

Overlays a tasteful Fedora logo on the desktop background. This is the only extension enabled by default, and it's maintained by the Fedora project itself.

- **Website**: https://forge.fedoraproject.org/workstation/background-logo-extension
- **RPM package**: `gnome-shell-extension-background-logo`
- **UUID**: `background-logo@fedorahosted.org`

It's already preinstalled on Fedora 44. To reinstall it manually or install on another system:

```bash
sudo dnf install gnome-shell-extension-background-logo
```

Enable / disable:

```bash
gnome-extensions enable background-logo@fedorahosted.org
gnome-extensions disable background-logo@fedorahosted.org
```

---

## 2. Apps Menu

Adds a category-based application menu (Applications menu) to the top bar. A standard component of GNOME Classic Mode.

- **Extension page**: https://extensions.gnome.org/extension/6/applications-menu/
- **Upstream project**: https://gitlab.gnome.org/GNOME/gnome-shell-extensions
- **RPM package**: `gnome-shell-extension-apps-menu`
- **UUID**: `apps-menu@gnome-shell-extensions.gcampax.github.com`

```bash
sudo dnf install gnome-shell-extension-apps-menu
gnome-extensions enable apps-menu@gnome-shell-extensions.gcampax.github.com
```

---

## 3. Launch New Instance

Always launches a new instance when clicking an app icon in the dock or application view, instead of switching to an existing window. Handy if you like opening multiple terminals.

- **Extension page**: https://extensions.gnome.org/extension/600/launch-new-instance/
- **Upstream project**: https://gitlab.gnome.org/GNOME/gnome-shell-extensions
- **RPM package**: `gnome-shell-extension-launch-new-instance`
- **UUID**: `launch-new-instance@gnome-shell-extensions.gcampax.github.com`

```bash
sudo dnf install gnome-shell-extension-launch-new-instance
gnome-extensions enable launch-new-instance@gnome-shell-extensions.gcampax.github.com
```

---

## 4. Places Status Indicator

Adds a menu to the top bar for quickly navigating common places on the system (home, downloads, documents, removable devices, etc.). Another Classic Mode component.

- **Extension page**: https://extensions.gnome.org/extension/8/places-status-indicator/
- **Upstream project**: https://gitlab.gnome.org/GNOME/gnome-shell-extensions
- **RPM package**: `gnome-shell-extension-places-menu`
- **UUID**: `places-menu@gnome-shell-extensions.gcampax.github.com`

```bash
sudo dnf install gnome-shell-extension-places-menu
gnome-extensions enable places-menu@gnome-shell-extensions.gcampax.github.com
```

---

## 5. Window List

Displays a window list at the bottom of the screen, similar to a traditional taskbar. A standard GNOME Classic Mode component.

- **Extension page**: https://extensions.gnome.org/extension/602/window-list/
- **Upstream project**: https://gitlab.gnome.org/GNOME/gnome-shell-extensions
- **RPM package**: `gnome-shell-extension-window-list`
- **UUID**: `window-list@gnome-shell-extensions.gcampax.github.com`

```bash
sudo dnf install gnome-shell-extension-window-list
gnome-extensions enable window-list@gnome-shell-extensions.gcampax.github.com
```

> Tip: enabling Apps Menu + Window List together restores a traditional GNOME 2-style panel layout in seconds.

---

## General Ways to Manage Extensions

Besides the `gnome-extensions` command line, there are three other common ways:

**1. GNOME Extensions app**

The extension manager that ships with Fedora 44:

```bash
sudo dnf install gnome-extensions-app
```

**2. Extension Manager (Flatpak, recommended)**

The most convenient third-party app for browsing, installing, and configuring extensions. Install it from Flathub:

```bash
flatpak install -y flathub com.mattjakeman.ExtensionManager
```

**3. Install from the website**

Open [extensions.gnome.org](https://extensions.gnome.org/) in your browser and flip the toggle on the extension you want. You'll need the GNOME Shell integration plugin for Firefox — the site will prompt you to install it.

**4. Flatseal (Flatpak permission manager)**

Once you've got Flatpak apps installed, Flatseal lets you manage their permissions at a glance — network, camera, filesystem, and more:

```bash
flatpak install -y flathub com.github.tchx84.Flatseal
```

---

## Recommended User Extensions

The built-in extensions cover the basics, but for daily use you'll want some "user extensions" to boost your productivity. Here are eight I install right away on a fresh Fedora 44 system, each with its EGO page and GitHub/project homepage.

### 6. AppIndicator and KStatusNotifierItem Support (System Tray Icons)

Adds system tray icon support (KStatusNotifierItem / AppIndicator) to GNOME — for WeChat, Telegram, Dropbox, and other apps that sit in the tray.

- **EGO**: https://extensions.gnome.org/extension/615/appindicator-support/
- **GitHub**: https://github.com/ubuntu/gnome-shell-extension-appindicator
- **UUID**: `appindicatorsupport@rgcjonas.gmail.com`
- **RPM package**: `gnome-shell-extension-appindicator`

```bash
sudo dnf install gnome-shell-extension-appindicator
# Or install from EGO / Extension Manager
gnome-extensions enable appindicatorsupport@rgcjonas.gmail.com
```

---

### 7. Dash to Dock

Turns GNOME's Dash into a persistent dock, similar to macOS's Dock or Unity's launcher. Customizable position, size, auto-hide, and more.

- **EGO**: https://extensions.gnome.org/extension/307/dash-to-dock/
- **GitHub**: https://github.com/micheleg/dash-to-dock
- **UUID**: `dash-to-dock@micxgx.gmail.com`

```bash
# Install from EGO or Extension Manager
gnome-extensions enable dash-to-dock@micxgx.gmail.com
```

---

### 8. Clipboard History

Keeps a history of your clipboard entries with search, pinning, and keyboard shortcuts. Far more powerful than GNOME's built-in Ctrl+C / Ctrl+V.

- **EGO**: https://extensions.gnome.org/extension/4839/clipboard-history/
- **GitHub**: https://github.com/SUPERCILEX/gnome-clipboard-history
- **UUID**: `clipboard-history@alexsaveau.dev`

```bash
# Install from EGO or Extension Manager
gnome-extensions enable clipboard-history@alexsaveau.dev
```

---

### 9. GSConnect (Phone Integration)

GNOME's take on KDE Connect — file transfer, notification sync, clipboard sharing, remote input between your phone and computer. Requires the KDE Connect app on your phone.

- **EGO**: https://extensions.gnome.org/extension/1319/gsconnect/
- **GitHub**: https://github.com/GSConnect/gnome-shell-extension-gsconnect
- **UUID**: `gsconnect@andyholmes.github.io`

```bash
# Install from EGO or Extension Manager
gnome-extensions enable gsconnect@andyholmes.github.io
```

---

### 10. Brightness Control using ddcutil (External Monitor Brightness)

Adjusts external monitor brightness and volume via DDC/CI, filling the gap where GNOME natively doesn't support external monitor brightness control.

- **EGO**: https://extensions.gnome.org/extension/2645/brightness-control-using-ddcutil/
- **GitHub**: https://github.com/daitj/gnome-display-brightness-ddcutil
- **UUID**: `display-brightness-ddcutil@themightydeity.github.com`

This extension depends on `ddcutil`, which requires the `i2c-dev` kernel module and proper permissions. Full setup:

**Step 1: Install ddcutil**

```bash
sudo dnf install ddcutil
```

**Step 2: Load the i2c-dev kernel module**

```bash
sudo modprobe i2c-dev
```

Verify your monitor supports DDC/CI brightness control:

```bash
ddcutil capabilities | grep "Feature: 10"
```

**Step 3: Set up the udev rule**

```bash
sudo cp /usr/share/ddcutil/data/60-ddcutil-i2c.rules /etc/udev/rules.d/
```

> On Fedora 40+, edit the file and uncomment this line:
>
> ```
> KERNEL=="i2c-[0-9]*", GROUP="i2c", MODE="0660"
> ```

**Step 4: Create the i2c group and add your user**

```bash
sudo groupadd --system i2c
sudo usermod $USER -aG i2c
```

**Step 5: Auto-load i2c-dev on boot**

```bash
sudo touch /etc/modules-load.d/i2c.conf
sudo sh -c 'echo "i2c-dev" >> /etc/modules-load.d/i2c.conf'
```

**Step 6: Reboot**

```bash
sudo reboot
```

After reboot, verify `ddcutil` works without sudo:

```bash
ddcutil getvcp 10
```

**Step 7: Install the extension**

```bash
# Install from EGO or Extension Manager
gnome-extensions enable display-brightness-ddcutil@themightydeity.github.com
```

---

### 11. Night Theme Switcher (Auto Dark Mode)

Automatically switches between light and dark GNOME themes on a schedule — supports sunrise/sunset or custom time ranges.

- **EGO**: https://extensions.gnome.org/extension/2236/night-theme-switcher/
- **Project homepage**: https://nightthemeswitcher.romainvigier.fr
- **UUID**: `nightthemeswitcher@romainvigier.fr`

```bash
# Install from EGO or Extension Manager
gnome-extensions enable nightthemeswitcher@romainvigier.fr
```

Using latitude and longitude for location-based switching is more accurate than a manual schedule. Replace the coordinates with your city's location:

```bash
gsettings --schemadir ~/.local/share/gnome-shell/extensions/nightthemeswitcher@romainvigier.fr/schemas/ \
  set org.gnome.shell.extensions.nightthemeswitcher.time location '(39.90,116.40)'
```

Then set the Time preset to `Location` in Extension Manager.

---

### 12. Input Method Panel

Status panel for IBus / Fcitx input method frameworks — essential for CJK users. Fedora 44 ships with IBus, but you need this extension to show the input method status in GNOME Shell.

- **EGO**: https://extensions.gnome.org/extension/261/kimpanel/
- **GitHub**: https://github.com/wengxt/gnome-shell-extension-kimpanel
- **UUID**: `kimpanel@kde.org`
- **RPM package**: `gnome-shell-extension-kimpanel`

```bash
sudo dnf install gnome-shell-extension-kimpanel
gnome-extensions enable kimpanel@kde.org
```

---

### Quick Install Script

Install all of the above in one go (install `ddcutil` first):

```bash
# System extensions
sudo dnf install -y \
  gnome-shell-extension-background-logo \
  gnome-shell-extension-apps-menu \
  gnome-shell-extension-launch-new-instance \
  gnome-shell-extension-places-menu \
  gnome-shell-extension-window-list \
  gnome-shell-extension-appindicator \
  gnome-shell-extension-kimpanel

# User extensions (via GNOME Extensions CLI)
# Dash to Dock
gnome-extensions install dash-to-dock@micxgx.gmail.com || true
# Clipboard History
gnome-extensions install clipboard-history@alexsaveau.dev || true
# GSConnect
gnome-extensions install gsconnect@andyholmes.github.io || true
# Brightness Control using ddcutil
gnome-extensions install display-brightness-ddcutil@themightydeity.github.com || true
# Night Theme Switcher
gnome-extensions install nightthemeswitcher@romainvigier.fr || true
```

> Tip: for user extensions, prefer installing via Extension Manager (Flatpak) — it handles version compatibility automatically.

---

## Wrap-up

Fedora 44 Workstation ships with five system extensions, and these eight user extensions cover pretty much everything you need day-to-day: system tray, dock, clipboard, phone integration, external monitor brightness, dark mode, and input methods. Once you know the `gnome-extensions` CLI and Extension Manager, you have the entry point to the whole GNOME extension ecosystem.

See you in the next "setup" article.
