---
title: "ibus-rime + Rime Ice: one input method setup for every Linux distro"
description: "Install ibus-rime, drop the Rime Ice (雾凇拼音) dictionary into the user directory, redeploy. Arch, Debian/Ubuntu, Fedora and openSUSE all follow the same three steps"
pubDatetime: 2026-11-22T00:00:00Z
modDatetime: 2026-11-22T00:00:00Z
draft: false
tags:
  - Linux
  - Rime
  - IBus
  - Input Method
  - Tutorial
lang: en
---

There are two ways to get Chinese input working on Linux: IBus and Fcitx5. Fcitx5 has more knobs, more skins, more everything — but if all you want is an input method that **works after install, adds no extra daemon, and behaves on Wayland**, IBus + Rime is the shorter path. Rime is only an engine, though; the dictionary is yours to supply, and the least painful choice right now is [Rime Ice](https://github.com/iDvel/rime-ice) (雾凇拼音).

The procedure below works on **any Linux distribution**. Only the package manager changes; the user directory, the zip, and the redeploy step are identical from Arch to openSUSE, on X11 or Wayland.

---

## Why not fcitx5-rime this time<span id="why-ibus"></span>

Fcitx5 is not bad — it just adds variables:

| | ibus-rime | fcitx5-rime |
| --- | --- | --- |
| GNOME integration | IBus is already there | Extra framework, env vars, autostart entry |
| Resident process | None added | One more daemon |
| Wayland | Native | Works, but popup placement/focus can drift |
| Setup surface | package → input source → dictionary | framework + modules + autostart + GTK/Qt modules + dictionary |
| Best for | minimal fuss, GNOME, Flatpak users | KDE, heavy customization, skins |

On GNOME, IBus is the default framework, so `ibus-rime` only needs to be added as an input source. On KDE, Fcitx5 is the native choice and staying with it is reasonable — the dictionary steps (2 and 3 below) are the same either way, only the user directory differs.

Do not install `ibus-rime` and `fcitx5-rime` and enable both. Two frameworks fighting over `XMODIFIERS` is a classic source of unexplainable bugs.

---

## The three steps<span id="overview"></span>

1. **Install `ibus-rime`** — the package name is the same nearly everywhere.
2. **Unpack Rime Ice into the Rime user directory** — clear it first, then copy.
3. **Redeploy** — restart IBus and let Rime compile the dictionary.

---

## Step 1: install ibus-rime<span id="install"></span>

| Distribution | Command |
| --- | --- |
| Arch / Manjaro / EndeavourOS | `sudo pacman -S ibus-rime` |
| Debian / Ubuntu / Mint / Pop!\_OS | `sudo apt install ibus-rime` |
| Fedora | `sudo dnf install ibus-rime` |
| openSUSE Tumbleweed / Leap | `sudo zypper install ibus-rime` |
| Gentoo | `sudo emerge ibus-rime` |
| Solus | `sudo eopkg install ibus-rime` |
| NixOS | `i18n.inputMethod.ibus.engines = [ pkgs.ibus-engines.rime ];` |

Confirm IBus sees the engine:

```bash
ibus list-engine | grep -i rime
# expected: rime - Rime
```

If nothing shows up, make sure the daemon is running (`pgrep -a ibus-daemon`), and start it with `ibus-daemon -drx`.

### Enable it as an input source

- **GNOME**: Settings → Keyboard → Input Sources → Add → Chinese → **Rime**.
- **KDE / XFCE / others**: `ibus-setup` → Input Method → Add → Chinese → Rime.
- **From a terminal** (handy for debugging):

```bash
ibus engine rime
ibus engine xkb:us::eng
```

Switch to Rime and press <kbd>Ctrl</kbd>+<kbd>Space</kbd> (or whatever your desktop binds). If Chinese characters appear, the framework layer works — that is the only thing this step needs to prove.

---

## Step 2: download Rime Ice and replace the user directory<span id="rime-ice"></span>

| Source | URL |
| --- | --- |
| GitHub (official) | <https://github.com/iDvel/rime-ice/releases/latest/download/full.zip> |
| Mainland China mirror (NJU) | <https://mirror.nju.edu.cn/github-release/iDvel/rime-ice/LatestRelease/full.zip> |

Both serve the same `full.zip` (~16 MB). Use the mirror if GitHub is slow; the contents are identical.

```bash
curl -L -o ~/Downloads/rime-ice-full.zip \
  https://mirror.nju.edu.cn/github-release/iDvel/rime-ice/LatestRelease/full.zip
```

### Find your user directory

The user directory depends on the **frontend**, not the distribution:

| Frontend | User directory |
| --- | --- |
| **IBus (this guide)** | `~/.config/ibus/rime` |
| Fcitx5 (desktop) | `~/.local/share/fcitx5/rime` |
| Fcitx5 for Android | `/Android/data/org.fcitx.fcitx5.android/files/data/rime` |
| Weasel (Windows) | `%APPDATA%\Rime` |
| Squirrel (macOS) | `~/Library/Rime` |

### Clear it, then copy

Rime Ice's instructions are explicit: **empty the user directory first**, then copy everything from the zip in. Old configs, an old `default.yaml`, and a stale `build/` cache will fight the new schema — and Rime tends to silently fall back to defaults instead of erroring, which makes debugging miserable.

Move the whole directory aside as a backup:

```bash
RIME_DIR="$HOME/.config/ibus/rime"

# 1. Back up the old directory (fails harmlessly on a fresh install)
mv "$RIME_DIR" "$RIME_DIR.bak.$(date +%Y%m%d-%H%M%S)" 2>/dev/null

# 2. Create a clean one
mkdir -p "$RIME_DIR"

# 3. Unpack Rime Ice at the root of the user directory
unzip -o ~/Downloads/rime-ice-full.zip -d "$RIME_DIR"

# 4. Verify
ls "$RIME_DIR" | head
# default.yaml, rime_ice.schema.yaml, squirrel.yaml, ...
```

Strict “delete the contents” equivalent:

```bash
RIME_DIR="$HOME/.config/ibus/rime"
mkdir -p "$RIME_DIR"
find "$RIME_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
unzip -o ~/Downloads/rime-ice-full.zip -d "$RIME_DIR"
```

Two things to avoid:

- **Do not** end up with a nested `rime-ice/` folder. `default.yaml` must sit directly in `~/.config/ibus/rime/`; one extra level and Rime will not find the config.
- Use `unzip -o`, not a GUI extractor, so you do not drag in `__MACOSX`/`.DS_Store` junk.

On Android, do the same by hand: open `Android/data/org.fcitx.fcitx5.android/files/data/rime`, delete the contents, extract the zip there. Android 11+ restricts access to `Android/data`, so Fcitx5's own file picker or `adb` is more reliable.

---

## Step 3: redeploy<span id="deploy"></span>

The files are in place but the dictionary is not compiled yet. Pick one:

**With an IBus tray icon** (XFCE, Cinnamon, some KDE setups): right-click → **Redeploy / Deploy**.

**GNOME, or no tray:**

```bash
ibus-daemon -drx     # restart the daemon; Rime deploys on next engine start
ibus engine rime     # trigger the engine
```

The first deploy compiles dictionaries and takes **seconds to a minute**; input may seem dead in the meantime. Success looks like a `build/` directory full of `.bin` files:

```bash
ls "$RIME_DIR/build" | head
```

If nothing changed:

1. Run `ibus-daemon -drx` again.
2. Force a full rebuild: `rm -rf "$RIME_DIR/build"`, then redeploy.
3. Look for a `trash/` folder in the user directory. A YAML file with bad indentation (tabs!) gets moved there and Rime quietly falls back to defaults.

### Using it

- <kbd>F4</kbd> opens the schema menu — switch full pinyin / double pinyin, toggle emoji and simplified/traditional.
- <kbd>Ctrl</kbd>+<kbd>Space</kbd> toggles Chinese/English.
- Default schema is Rime Ice full pinyin; double-pinyin users switch to `double_pinyin_flypy` (Xiaohe) or similar.
- To update the dictionary, **repeat steps 2 and 3**. Pulling a fresh `full.zip` every few months beats hand-merging.

---

## Troubleshooting<span id="troubleshooting"></span>

**Candidate window shows tofu boxes.** Missing CJK fonts. Install Noto Sans CJK (`pacman -S noto-fonts-cjk`, `apt install fonts-noto-cjk`, `dnf install google-noto-sans-cjk-fonts`).

**Candidate window is offset under Wayland.** Check whether the app runs on Wayland or XWayland; Electron and older Qt builds are the usual suspects.

**Some Flatpak/Qt apps ignore the input method.** Make sure `GTK_IM_MODULE`/`QT_IM_MODULE` were not hardcoded to `fcitx`:

```bash
echo "$GTK_IM_MODULE | $QT_IM_MODULE | $XMODIFIERS"
# expected: ibus | ibus | @im=ibus (or empty and left to the desktop)
```

**Same dictionary on KDE.** Install `fcitx5-rime`, set `RIME_DIR="$HOME/.local/share/fcitx5/rime"`, and use Fcitx5's “Redeploy” button.

**Uninstall.** Remove the package, delete `~/.config/ibus/rime`, drop Rime from the input sources. Nothing system-wide is left behind.

---

## Other dictionaries worth a look<span id="alternatives"></span>

| Schema | Character | Repo |
| --- | --- | --- |
| **Rime Ice (rime-ice)** | The mainstream default: full + several double-pinyin schemas, curated dictionary, good comments | <https://github.com/iDvel/rime-ice> |
| **Wanxiang (万象拼音)** | Grammar-model heavy, long-sentence input, more opinionated config | <https://github.com/amzxyz/rime-wanxiang> |
| **Rime Frost (白霜拼音)** | Different dictionary priorities, lighter/simplified-leaning; often compared with Ice | <https://github.com/gaboolic/rime-frost> |

All three install **identically**: download the release zip → clear the user directory → extract → redeploy. Run Rime Ice for a week or two, find out what you actually care about (frequency, long sentences, double pinyin), then switch.

If you prefer managing schemas with plum:

```bash
git clone --depth 1 https://github.com/rime/plum.git ~/plum
cd ~/plum
rime_dir="$HOME/.config/ibus/rime" bash rime-install iDvel/rime-ice
ibus-daemon -drx
```

plum makes updates a one-liner, but it assumes a working Rime config already exists. For a first install or a messy directory, the manual `full.zip` route is more predictable.

---

## TL;DR<span id="wrap-up"></span>

**ibus-rime is the engine, Rime Ice is the dictionary, redeploy makes it real.** The distribution only changes the first command; the frontend only changes the path in the second. Everything else is the same on every Linux.

For GNOME users this route adds no second framework, no environment variables, and no autostart script — one less thing to break on upgrade. If you have been running Fcitx5, the [Fedora 44 Fcitx5 write-up](/blog/posts/zh/2026-08-14-fedora-44-init-fcitx5) still applies; the two setups do not conflict, just pick one and stick with it.

[中文版](/blog/posts/zh/2026-11-22-ibus-rime-rime-ice-guide)
