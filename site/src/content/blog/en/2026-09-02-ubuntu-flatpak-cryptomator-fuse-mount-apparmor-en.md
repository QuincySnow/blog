---
title: "Fix fuse_mount failed for Flatpak Cryptomator on Ubuntu"
description: "Flatpak Cryptomator on Ubuntu fails to mount a Vault with fuse_mount failed — the root cause is Ubuntu's AppArmor fusermount3 profile denying the FUSE mount. Generate an allow rule with aa-logprof"
pubDatetime: 2026-09-02T00:00:00Z
modDatetime: 2026-09-02T00:00:00Z
draft: false
tags:
  - Cryptomator
  - Flatpak
  - FUSE
  - AppArmor
  - Ubuntu
  - Linux
lang: en
---

## 1. The Problem

On Ubuntu, when using Flathub's Flatpak build of Cryptomator 1.19.3, unlocking a Vault fails to mount, showing:

```text
Error Code 6HCL:2GTN:IBE9

org.cryptomator.integrations.mount.MountFailedException:
org.cryptomator.jfuse.api.FuseMountFailedException: fuse_mount failed
```

The stack trace shows the failure happens when Cryptomator mounts the decrypted filesystem using Linux FUSE:

```text
Vault.unlock()
    ↓
Mounter.mount()
    ↓
LinuxFuseMountProvider.mount()
    ↓
Fuse.mount()
    ↓
fuse_mount failed
```

So this is not a wrong password, and you can't conclude the Vault is corrupted. Check FUSE and the system security policy first.

## 2. Confirm Cryptomator Is the Flatpak Build

Confirm where it was installed from:

```bash
flatpak info org.cryptomator.Cryptomator
```

Output:

```text
Version: 1.19.3
Origin: flathub
Installation: system
Runtime: org.freedesktop.Platform/x86_64/25.08
```

So it's the Flathub Flatpak build.

## 3. Check FUSE

Check `/dev/fuse`:

```bash
ls -l /dev/fuse
```

Output:

```text
crw-rw-rw- 1 root root 10, 229 ...
```

The FUSE device exists and regular users have read/write access.

Check the FUSE tools:

```bash
fusermount3 --version
```

Output:

```text
fusermount3 version: 3.18.2
```

Check that the kernel supports FUSE:

```bash
cat /proc/filesystems | grep fuse
```

Output:

```text
fuseblk
nodev   fuse
nodev   fusectl
```

The system itself has FUSE support.

## 4. Confirm the Flatpak Sandbox Can Reach FUSE Too

Enter the Cryptomator Flatpak environment:

```bash
flatpak run --command=sh org.cryptomator.Cryptomator
```

Inside the sandbox, check:

```bash
ls -l /dev/fuse
fusermount3 --version
cat /proc/filesystems | grep fuse
```

You see the same:

```text
/dev/fuse
fusermount3 version: 3.18.2
```

and:

```text
fuseblk
nodev   fuse
nodev   fusectl
```

This means:

- `/dev/fuse` exists
- Flatpak can access `/dev/fuse`
- `fusermount3` runs inside Flatpak
- The Flatpak sandbox sees FUSE filesystem support

So this is not simply a missing Flatpak FUSE device permission.

Even a further test:

```bash
flatpak run --device=all org.cryptomator.Cryptomator
```

still fails to mount.

So the "just add `--device=all` to Flatpak" solution can be ruled out.

## 5. Check the Logs and Find the AppArmor Denial

Now check the kernel log:

```bash
sudo journalctl -k --since "10 minutes ago" | \
grep -iE 'fuse|apparmor|denied|cryptomator|mount'
```

The key AppArmor log appears:

```text
apparmor="DENIED"
operation="..."
profile="fusermount3"
comm="fusermount3"
```

with Cryptomator's Flatpak runtime paths in it.

This reveals the real problem:

> **Ubuntu's AppArmor `fusermount3` profile denies Cryptomator from completing the FUSE mount.**

This also explains why Cryptomator works on another Fedora system: the two Linux security policy stacks differ — Fedora defaults to SELinux, while Ubuntu uses AppArmor.

## 6. Verify AppArmor Is the Root Cause

If Ubuntu doesn't ship `aa-complain`, install it:

```bash
sudo apt update
sudo apt install apparmor-utils
```

Then temporarily set `fusermount3` to complain mode:

```bash
sudo aa-complain /usr/bin/fusermount3
```

Start Cryptomator again:

```bash
flatpak run org.cryptomator.Cryptomator
```

Unlock the Vault.

Result:

> **The Vault mounts successfully.**

This completes the key verification.

Complain mode doesn't block the offending operation the way enforce mode does — it just logs AppArmor events — so Cryptomator can finish the FUSE mount.

This confirms:

```text
Cryptomator
    ↓
jfuse
    ↓
fusermount3
    ↓
AppArmor
    ↓
DENIED ❌
    ↓
fuse_mount failed
```

## 7. Generate an Allow Rule with `aa-logprof`

Since AppArmor is confirmed as the cause, don't disable AppArmor entirely.

Run:

```bash
sudo aa-logprof
```

and let AppArmor generate rules from the actual `DENIED` logs.

After you allow the relevant `fusermount3` rules, Cryptomator works normally.

That's a much more reasonable approach than disabling AppArmor outright.

## 8. Caution: Don't Blindly Allow Everything in `aa-logprof`

This troubleshooting had an important lesson.

Running:

```bash
sudo aa-logprof
```

doesn't necessarily only show Cryptomator rules.

In practice, other AppArmor profile changes also appeared:

```text
snap-confine
cupsd
systemd-detect-virt
```

Even inside `fusermount3` there were entries like:

```text
include <abstractions/postfix-common>
include <abstractions/glycin>
```

and:

```text
capability dac_override,
capability setuid,
```

and:

```text
mount options=(rbind, rw) /home/ub/.local/share/Cryptomator/mnt/ -> /,
mount options=(rbind, rw) /run/user/1000/ -> /,
mount options=(rprivate, rw) -> /,
```

Some of these rules are clearly related to Cryptomator's FUSE mount, but others may come from other AppArmor events elsewhere on the system.

So:

> **Don't habitually press A (allow) all the way through `aa-logprof`.**

Only handle the rules you just triggered and can clearly map to the target program.

## 9. What If You Accidentally Saved AppArmor Changes?

If `aa-logprof` already saved changes and the config looks wrong, you can restore the package's original config.

First find which package owns the config file:

```bash
sudo dpkg -S /etc/apparmor.d/fusermount3
```

For example:

```text
apparmor: /etc/apparmor.d/fusermount3
```

So it belongs to the `apparmor` package.

Note that:

```bash
sudo apt install --reinstall apparmor
```

**doesn't necessarily overwrite an AppArmor config you've modified.**

`/etc/apparmor.d/fusermount3` is a Debian/Ubuntu conffile, and the package manager protects configs the user has changed.

To restore the distro's original file, extract it from the current `apparmor` `.deb`:

```bash
cd /tmp
apt download apparmor
```

Then:

```bash
rm -rf /tmp/apparmor-original
mkdir /tmp/apparmor-original

dpkg-deb -x /tmp/apparmor_*.deb /tmp/apparmor-original
```

Diff first:

```bash
diff -u \
  /tmp/apparmor-original/etc/apparmor.d/fusermount3 \
  /etc/apparmor.d/fusermount3
```

Then restore after confirming:

```bash
sudo cp \
  /tmp/apparmor-original/etc/apparmor.d/fusermount3 \
  /etc/apparmor.d/fusermount3
```

Reload:

```bash
sudo apparmor_parser -r /etc/apparmor.d/fusermount3
```

Then re-trigger Cryptomator's AppArmor denial and use:

```bash
sudo aa-logprof
```

to allow only the rules you actually need.

## 10. The Final Result

The correct approach is not:

```bash
flatpak run --device=all ...
```

nor:

```bash
sudo systemctl disable apparmor
```

nor leaving `fusermount3` in complain mode long-term:

```bash
sudo aa-complain /usr/bin/fusermount3
```

The correct approach is:

```text
Ubuntu
  │
  ├─ Flatpak Cryptomator 1.19.3
  │
  ├─ /dev/fuse                         ✅
  ├─ fusermount3                       ✅
  ├─ Kernel FUSE                       ✅
  ├─ Flatpak FUSE access               ✅
  │
  └─ AppArmor fusermount3 profile
             │
             └─ Cryptomator mount DENIED ❌
                          │
                          ↓
                    sudo aa-logprof
                          │
                          ↓
                  allow what is needed
                          │
                          ↓
                 Cryptomator mounts ✅
```

## Summary

When you hit Cryptomator's:

```text
FuseMountFailedException: fuse_mount failed
```

don't assume the Vault is corrupted, and don't just give Flatpak `--device=all`.

Follow this order:

```bash
# 1. Check FUSE
ls -l /dev/fuse
fusermount3 --version
cat /proc/filesystems | grep fuse

# 2. Check FUSE inside Flatpak
flatpak run --command=sh org.cryptomator.Cryptomator

# 3. Check AppArmor
sudo journalctl -k --since "10 minutes ago" | \
grep -iE 'fuse|apparmor|denied|cryptomator|mount'

# 4. If fusermount3 is blocked by AppArmor
sudo apt install apparmor-utils
sudo aa-complain /usr/bin/fusermount3

# 5. Once Cryptomator is confirmed working
sudo aa-logprof

# 6. Finally restore enforce mode
sudo aa-enforce /usr/bin/fusermount3
```

**Core takeaway: `fuse_mount failed` for Flatpak Cryptomator on Ubuntu may not be a missing FUSE or a missing Flatpak device permission — it can be Ubuntu's AppArmor `fusermount3` profile denying the actual FUSE mount operation.**
