---
title: "Fedora 44 Setup (Part 2): Fcitx5 Input Method"
description: "Installing Fcitx5 with Rime on Fedora 44 via dnf"
pubDatetime: 2026-08-14T00:00:00Z
modDatetime: 2026-08-14T00:00:00Z
draft: false
tags:
  - Fedora
  - GNOME
  - Linux
  - Fcitx5
  - Rime
  - Tutorial
lang: en
---

Part two of the setup series: input methods. Fedora 44 ships with IBus by default, but many CJK users prefer Fcitx5 — faster, richer ecosystem, and better Rime support.

---

## Install Fcitx5

Fedora 44's official repos include Fcitx5. One command:

```bash
sudo dnf install fcitx5 fcitx5-rime fcitx5-configtool fcitx5-gtk fcitx5-qt fcitx5-autostart
```

| Package | Purpose |
| --- | --- |
| `fcitx5` | Core framework |
| `fcitx5-rime` | Rime input method engine |
| `fcitx5-configtool` | GUI configuration tool |
| `fcitx5-gtk` | GTK input method support |
| `fcitx5-qt` | Qt input method support |
| `fcitx5-autostart` | Auto-start on login |

**Log out and back in** after installation.

---

## Add Rime Input Method

Open the config tool:

```bash
fcitx5-configtool
```

In the "Input Method" tab, click "Add Input Method", search for `Rime`, and add it. The default includes "Luna Pinyin" for simplified Chinese.

| Shortcut | Action |
| --- | --- |
| `Ctrl + Space` | Toggle input method on/off |
| `Shift` | Quick Chinese/English switch |
| `Ctrl + Shift + F` | Toggle Traditional/Simplified |

---

## Wrap-up

Fedora 44's official repos give you Fcitx5 with a single command. Log out, log back in, and you're good to go.

See you in the next "setup" article.
