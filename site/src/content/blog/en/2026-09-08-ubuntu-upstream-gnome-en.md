---
title: "Run Upstream GNOME on Ubuntu: Switching Sessions and a Missing App-Grid Mystery"
description: "Keep Ubuntu's ecosystem and get a near-stock GNOME desktop: install gnome-session and pick the GNOME session at the login screen — plus debugging a GNOME Shell 50.1 bug where every app-grid icon disappeared"
pubDatetime: 2026-09-08T00:00:00Z
modDatetime: 2026-09-08T00:00:00Z
draft: false
tags:
  - Ubuntu
  - GNOME
  - Linux
  - Tutorial
lang: en
---

I care a lot about the Linux software ecosystem, so moving my main system to Ubuntu was a relief: third-party software ships a .deb first, tutorials are the most numerous, and PPA / .deb / Snap / Flatpak sources are all available. But Ubuntu's default "Ubuntu session" carries a set of Ubuntu customizations (Ubuntu Dock, the Yaru theme, preinstalled extensions), which never felt like the near-upstream GNOME I got used to on Fedora — I previously wrote about that in [Fedora 44 Setup (Part 1): GNOME Extensions](/blog/posts/en/2026-08-14-fedora-44-init-gnome-extensions-en).

Can you have both — **Ubuntu's ecosystem plus an upstream GNOME desktop**? Yes, and you don't need to uninstall any Ubuntu desktop packages. This post covers the exact steps, plus a bug I hit right after switching where every app-grid icon vanished, and how I tracked it down.

---

## 1. Ubuntu Session vs. GNOME Session

Ubuntu's customization didn't replace GNOME with something else — it's **the same GNOME Shell base, assembled differently by a "session"**. Each option in the login-screen gear icon is essentially a different configuration set loaded on top:

| | Ubuntu Session | GNOME Session (upstream) |
| --- | --- | --- |
| Login option | Ubuntu | GNOME |
| Provided by | `ubuntu-session` and friends | the `gnome-session` package |
| Dock | Ubuntu Dock (Ubuntu's customized Dash to Dock) | None (upstream GNOME has no persistent dock) |
| Default extensions | A batch of Ubuntu-picked extensions | Basically none |
| Theme / look | Yaru and other Ubuntu tweaks | Upstream defaults |
| GNOME Shell base | Same | Same |
| Underlying system | Same | Same |

In other words, Ubuntu's customization mostly lives at the "session" layer. To get stock GNOME, the safest route is **choosing a different session at login**, not uninstalling Ubuntu's desktop packages — those packages have tangled dependencies, and a careless `apt remove` can take the whole desktop down with them.

## 2. Install the GNOME Session and Switch

Make sure the upstream GNOME session is available:

```bash
sudo apt install gnome-session
```

Then log out → at the GDM login screen click your username → click the gear icon ⚙️ at the bottom right → choose **GNOME** (not Ubuntu) → log in.

The Ubuntu session and the GNOME session now coexist as two entries and you can switch back any time. That's by design, not a sign that something is broken.

## 3. Verify You're Really in the Upstream Session

After logging in, confirm which session you're in:

```bash
gnome-shell --version
echo $XDG_CURRENT_DESKTOP
echo $XDG_SESSION_DESKTOP
```

On my machine this printed:

```text
GNOME Shell 50.1
GNOME
gnome
```

`XDG_CURRENT_DESKTOP=GNOME` and `XDG_SESSION_DESKTOP=gnome` confirm you're running the upstream GNOME session.

## 4. The Bug: Every App-Grid Icon Disappeared

Most things worked fine in the GNOME session, but one day I pressed Super to open the overview and clicked into the app grid — **not a single app icon was there**. Just an empty grid, and no way to launch apps from it.

At the time more than one third-party GNOME Shell extension was enabled on my system (including `dash-to-dock@micxgx.gmail.com` from earlier tinkering), so my first instinct was to blame them.

## 5. Debugging: First Rule Out "Ubuntu Desktop Packages Left Behind"

When something breaks, an easy thought is: did the leftover Ubuntu desktop packages make the two sessions fight each other?

After the environment-variable check above, that theory is dead on arrival — the current session is clearly **GNOME Shell 50.1 with XDG_CURRENT_DESKTOP=GNOME**. Ubuntu packages merely sitting on disk cannot rewrite the GNOME session into an Ubuntu one. **Don't "fix" this by uninstalling ubuntu-desktop — that's not the cause and it can wreck the system.**

So the suspicion moved to extensions: GNOME 50 is very new, third-party extensions have a short compatibility window, and an extension mismatched with the shell can break overview / app-grid UI.

The decisive test — **disable every user extension at once**:

```bash
gsettings set org.gnome.shell disable-user-extensions true
```

Log out → log back in → open the app grid → **the icons are back**. The issue reproduces and reverses cleanly, which basically confirms extensions are responsible.

## 6. Conclusion: The Culprit Is Dash to Dock from EGO

The exact culprit turned out to be **the third-party [Dash to Dock](https://extensions.gnome.org/extension/307/dash-to-dock/) installed from extensions.gnome.org** (extension 307, UUID `dash-to-dock@micxgx.gmail.com`). That build is incompatible with GNOME Shell 50.1, and enabling it makes every app-grid icon disappear.

- This was **not** caused by keeping Ubuntu's original desktop around — leaving the Ubuntu session and its packages installed is completely fine.
- The right fix is managing extensions, not touching system desktop packages.

## 7. Restore Extensions and Isolate One by One

First, re-enable user extensions:

```bash
gsettings set org.gnome.shell disable-user-extensions false
```

Then **enable exactly one extension at a time**, log out and back in, and check the app grid after each one:

```bash
gnome-extensions enable dash-to-dock@micxgx.gmail.com
```

Test the prime suspect (Dash to Dock) first. Once you find the incompatible extension, decide: wait for the author to update it, switch to an alternative, or just keep it disabled — instead of dropping every other extension for the sake of one, and certainly not uninstalling the Ubuntu desktop.

**If you simply want a dock**: you don't need the third-party Dash to Dock. Ubuntu ships its own **Ubuntu Dock** (UUID `ubuntu-dock@ubuntu.com`), which is essentially Ubuntu's maintained fork of Dash to Dock — Ubuntu keeps it in sync with the GNOME Shell version shipped by the system, so it's far more reliable than a third-party EGO build. Enable it right inside the GNOME session:

```bash
gnome-extensions enable ubuntu-dock@ubuntu.com
```

## 8. Final Setup and Reminders

The end state looks like this:

```text
Ubuntu
├── Ubuntu session (kept — switch back anytime)
└── GNOME session (daily use)
    └── GNOME Shell 50.1, upstream behavior
```

The underlying ecosystem stays untouched: apt / .deb / Snap / PPA / Ubuntu repositories, all still there.

Key takeaways, repeated for emphasis:

1. **Keep `ubuntu-session` / `ubuntu-desktop` installed.** Want stock GNOME? Pick the GNOME session at login.
2. Stock GNOME ≠ deleting Ubuntu customizations — it means **switching sessions**. Both coexist and are reversible, which is the safest path.
3. Enable extensions **one at a time**, never all at once, so problems are easy to isolate.
4. Right after a major GNOME release (like the 50.x series this time), third-party extensions are most likely to break — suspect extensions first whenever the overview or app grid misbehaves.

---

[Chinese version](/blog/posts/zh/2026-09-08-ubuntu-upstream-gnome)
