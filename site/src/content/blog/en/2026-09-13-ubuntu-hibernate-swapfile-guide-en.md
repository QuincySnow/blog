---
title: "Hibernate on Ubuntu 26.04 with a swapfile: resume_offset + dracut, end to end"
description: "Hibernate on Ubuntu 26.04 / GNOME 50: create a swap partition and disable Secure Boot, then let ubuntu-gnome-hibernate do the rest — or compute resume_offset when you're stuck with a swapfile"
pubDatetime: 2026-09-13T00:00:00Z
modDatetime: 2026-09-13T00:00:00Z
draft: false
tags:
  - Ubuntu
  - Linux
  - GNOME
  - Tutorial
lang: en
---

Windows draws a hard line between "Sleep" and "Hibernate"; on Linux those are Suspend and Hibernate.

Start with the conclusion: **if you just want hibernate working with minimum fuss, go the swap-partition + Secure Boot-off route and then use [`jdtanner/ubuntu-gnome-hibernate`](https://github.com/jdtanner/ubuntu-gnome-hibernate)**. It configures GRUB, initramfs, PolicyKit, lid-close hibernate, and a GNOME 50 power-menu button in one shot — no pile of commands to type. The only two things you actually have to do yourself are **create a swap partition ≥ RAM** and **disable Secure Boot** — see section 2 for how.

If, like most Ubuntu users, you're on the default **swapfile** and don't want to repartition just for hibernate, you have to compute `resume_offset` yourself — that's what sections 4–8 cover, and where most tutorials get it wrong.

Measured on **Ubuntu 26.04.1 LTS + GNOME Shell 50.1 + kernel 7.0.0-31**.

---

## 1. Suspend or Hibernate?

Windows Sleep ≈ Linux Suspend: RAM stays powered, the CPU and most devices drop into low power, and a keypress brings everything back instantly:

```bash
systemctl suspend
```

Windows Hibernate ≈ Linux Hibernate: memory contents are written to disk and the machine **powers off completely**, then comes back exactly as you left it. That's the one that survives a night without power.

| Windows | Linux / Ubuntu |
| --- | --- |
| Sleep | Suspend |
| Hibernate | Hibernate |
| Hybrid Sleep | Hybrid Sleep |
| Shut down | Power Off |

Important caveat: **Hibernate usually is not usable out of the box on Ubuntu.** The kernel and systemd both support it (`cat /sys/power/disk` shows `platform`), but whether it actually works depends on swap size, whether swap is a partition or a swapfile, and whether the resume parameters are configured.

Start by inspecting the current state:

```bash
swapon --show
free -h
cat /proc/cmdline
cat /sys/power/state
cat /sys/power/disk
```

On my machine:

```text
NAME      TYPE SIZE   USED PRIO
/swap.img file  32G 184.6M   -1

Mem: total 30Gi   Swap: 31Gi
```

```text
freeze mem disk          # /sys/power/state — "disk" means hibernate is supported
[platform] shutdown reboot suspend test_resume
```

If `disk` appears in `/sys/power/state`, the system is capable of writing a hibernation image to disk.

## 2. The two things you actually need to do: swap partition + Secure Boot off

If you're taking the recommended route, **there are only two pieces of real work**: prepare a swap partition ≥ RAM, and turn off Secure Boot. Do those two and `ubuntu-gnome-hibernate` handles everything else in one script.

### 2.1 Disable Secure Boot

Hibernate needs the kernel to write and restore a memory image under a locked security policy; with Secure Boot on you get:

```text
Failed to hibernate system via logind: Sleep verb "hibernate" not supported
```

Check the current state:

```bash
mokutil --sb-state
```

`SecureBoot disabled` means you're done (that's my machine). If it says `enabled`, reboot into UEFI/BIOS setup and set **Security → Secure Boot** to **Disabled**.

This lowers your system's security posture, and that's the trade-off: Secure Boot blocks unsigned kernel modules and conflicts with the hibernate restore mechanism. If you must keep Secure Boot on, your only option is the manual swapfile route later in this post (and it isn't guaranteed either).

### 2.2 Prepare a swap partition

The rule is **size ≥ RAM**. With 30 GiB of RAM, I'd want a ~32 GiB swap partition.

Look at the current layout:

```bash
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT
```

```text
NAME          SIZE FSTYPE MOUNTPOINT
nvme1n1     953.9G
├─nvme1n1p1   300M vfat   /boot/efi
├─nvme1n1p2    16M
├─nvme1n1p3 349.1G ntfs
└─nvme1n1p4 604.5G ext4   /
```

There's no free space and no existing swap partition on this machine, so the job is to **carve 32 GiB out of an existing partition**. Two common approaches:

**Approach A: graphical (recommended, hardest to get wrong)**

```bash
sudo apt install gparted
sudo gparted
```

1. Pick a partition with room (here `/dev/nvme1n1p4`, the 604.5G ext4 root).
2. Right-click → **Resize/Move** → shrink it to free 32 GiB.
3. Right-click the unallocated space → **New** → filesystem **linux-swap**.
4. Click ✓ to apply.

If you're shrinking the **in-use root partition**, GParted needs to do it offline (it can't shrink ext4 online), so it will tell you to boot from a live USB. That's expected — follow the prompt.

**Approach B: command line (`parted` + `mkswap`)**

```bash
# Confirm device and partition numbers first; here shrinking /dev/nvme1n1p4 and creating p5
sudo parted /dev/nvme1n1
```

```text
(parted) print free          # check free space and partition boundaries
(parted) resizepart 4 <new end>
(parted) mkpart primary linux-swap <start> <end>
(parted) quit
```

> ⚠️ **Shrinking partitions is destructive — back up important data first.** Partition numbers and boundaries differ per machine; replace the placeholders with your actual `print free` output, don't copy mine.

Format the new partition as swap and enable it:

```bash
sudo mkswap /dev/nvme1n1p5
sudo swapon /dev/nvme1n1p5
swapon --show
```

Get its UUID:

```bash
lsblk -f /dev/nvme1n1p5
```

For it to mount automatically after reboot, add it to `/etc/fstab` (substitute your UUID):

```conf
UUID=<swap partition UUID>  none  swap  sw  0  0
```

If this machine previously used `/swap.img`, remove that line from fstab now (`ubuntu-gnome-hibernate`'s main script will do it for you too) — having both swaps active makes resume unpredictable.

### 2.3 Let the script do the rest

```bash
sudo bash hibernate-diagnose.sh          # note SWAP_PARTITION and SWAP_UUID
# edit the two constants at the top of complete-hibernate-setup-ubuntu-2604-gnome.sh
sudo ./complete-hibernate-setup-ubuntu-2604-gnome.sh
sudo reboot
sudo systemctl hibernate                 # test
```

### 2.4 Why I used a swapfile anyway

That line in Approach A — "shrinking an in-use root partition requires booting from a live USB" — is exactly why I didn't take this route: **this machine has no free space, so freeing 32 GiB meant shrinking root offline**, and the one-shot risk outweighed the benefit. Since a swapfile achieves exactly the same result, I chose not to repartition.

If your machine has free space, or you're willing to work from a live USB, **the swap-partition + project-script route is the easier one** and you can skip all the `resume_offset` derivation below.

## 3. swapfile vs. swap partition

Hibernate requires **swap at least as large as RAM** (more precisely, large enough for the compressed memory image — typically 0.5–1× RAM). My 30 GiB of RAM calls for ~32 GiB of swap, whether it's a partition or a swapfile.

The real difference between the two forms is **how resume locates the image**:

| | swap partition (recommended) | swapfile |
| --- | --- | --- |
| Locating it | `resume=UUID=<swap partition UUID>` | `resume=UUID=<root fs UUID>` + **`resume_offset=<physical offset>`** |
| Parameters needed | one | two (you must compute the offset) |
| How the kernel reads it | straight from the block device | needs the offset to find the image inside a file |
| Repartitioning required | yes | no |
| Best for | when you have space / will repartition | when you don't want to touch the partition table |

**Bottom line: use a partition if you can.** A partition needs only a single `resume=UUID=`, and `ubuntu-gnome-hibernate` will do the rest for you; a swapfile adds a hand-computed `resume_offset`, which is the entire source of complexity in the following sections.

Ubuntu now defaults to a **swapfile** (`/swap.img`). The trap: **during resume the kernel has no filesystem concept yet** — it can only read "root device + physical block offset". So `resume_offset` is mandatory.

Critically, this must be the file's **physical offset on disk**, not its logical offset within the filesystem. The latter is wrong and leads to a boot that hangs on resume or fails outright.

## 4. Computing resume_offset (the core of the swapfile approach)

For a swapfile on ext4, use `filefrag` to get the first physical block:

```bash
sudo filefrag -v /swap.img
```

The `physical_offset` block number on the first line, multiplied by the block size (4096 bytes on ext4), is `resume_offset`. On my machine that came out to:

```text
resume_offset=42401792
```

As a sanity check: 42401792 × 4096 ≈ 162 GiB into the root partition `/dev/nvme1n1p4`, which is plausible for its layout.

Confirm the root filesystem UUID:

```bash
lsblk -f
```

Substitute your real value and you have the two parameters used everywhere below:

```text
resume=UUID=7c9cf0b1-8fd6-4ea6-af62-a088b64c85f7
resume_offset=42401792
```

## 5. Configure GRUB

Add both resume parameters to `GRUB_CMDLINE_LINUX_DEFAULT` in `/etc/default/grub`:

```bash
sudo nano /etc/default/grub
```

```conf
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash resume=UUID=7c9cf0b1-8fd6-4ea6-af62-a088b64c85f7 resume_offset=42401792"
```

Then update GRUB:

```bash
sudo update-grub
```

## 6. dracut configuration (Ubuntu 26.04's initramfs)

On Ubuntu 26.04 the initramfs is actually generated by **dracut** (`initramfs-tools` isn't installed; the `dracut` package ships a compatible `update-initramfs` shim). dracut doesn't necessarily include resume support by default, so declare two things explicitly:

```bash
sudo tee /etc/dracut.conf.d/20-hibernate.conf <<'EOF'
add_dracutmodules+=" resume "
hostonly_cmdline="yes"
EOF
```

And write a file that bakes the resume parameters into the initramfs:

```bash
sudo mkdir -p /etc/cmdline.d
sudo tee /etc/cmdline.d/20-resume.conf <<'EOF'
resume=UUID=7c9cf0b1-8fd6-4ea6-af62-a088b64c85f7
resume_offset=42401792
EOF
```

Then rebuild the initramfs:

```bash
sudo dracut --force --regenerate-all
```

This regenerates `/boot/initrd.img-*` for the current kernel and overwrites the same path, so back it up first:

```bash
sudo cp /boot/initrd.img-$(uname -r) /boot/initrd.img-$(uname -r).before-hibernate
```

After the rebuild you can compare file sizes to confirm it really regenerated (mine went from 38,743,705 to 37,848,647 bytes).

## 7. Verify the systemd side

systemd ships the `systemd-hibernate-resume` generator and `systemd-hibernate.service`; as long as `resume` / `resume_offset` are present in the initramfs and kernel cmdline, it takes over automatically. Verify:

```bash
systemctl status systemd-hibernate.service --no-pager
cat /sys/power/resume
cat /sys/power/resume_offset
```

You should see:

```text
systemd-hibernate.service - System Hibernate
     Loaded: loaded (/usr/lib/systemd/system/systemd-hibernate.service; static)

259:4
42401792
```

`/sys/power/resume` is `major:minor` of the root device (259:4 here), and `/sys/power/resume_offset` must match the kernel parameter exactly. When those two agree, the Hibernate chain is complete.

## 8. Testing and the GNOME power-menu button

Before sleeping the machine normally, **just run it directly** and watch whether it powers off and comes back:

```bash
systemctl hibernate
```

My result: the machine powered off completely → press the power button → GNOME, Firefox, and the terminal all came back exactly as they were.

But at this point **GNOME's power menu still has no Hibernate entry**. GNOME hides Hibernate by default, and PolicyKit may not allow an unprivileged user to trigger it.

> If you took the `ubuntu-gnome-hibernate` route, it already did this for you (polkit rules plus the GNOME 50 extension) — skip ahead.

If you're configuring manually like me, add the button back with an extension. The one that works on GNOME 50 is **Hibernate Power Menu** (by arnakazim, supports GNOME 48/49/50) — that's the one I use:

```bash
# install from extensions.gnome.org
# hibernate-power-menu@arnakazim
```

Or confirm from the command line:

```bash
# the manual route uses this one (by arnakazim)
gnome-extensions enable hibernate-power-menu@arnakazim

# the project ships a different one: hibernate-status-gnome50/ installs UUID hibernate-status@dromi
gnome-extensions enable hibernate-status@dromi
```

After that, the power menu shows "Hibernate", equivalent to `systemctl hibernate`.

> These are two different extensions — don't mix them up: `hibernate-power-menu@arnakazim` is a community extension (it also adds a Hybrid Sleep option), while `hibernate-status@dromi` is `ubuntu-gnome-hibernate`'s GNOME 50 fork of the older Hibernate Status Button. Either works; pick one.

## 9. The easy path: `ubuntu-gnome-hibernate` (try this first)

Honestly, all those commands in sections 3–7 are exactly what [`jdtanner/ubuntu-gnome-hibernate`](https://github.com/jdtanner/ubuntu-gnome-hibernate) exists to save you from. I'm covering it in detail here because **for most people it is the right answer** — my machine just happened not to meet its prerequisites.

It covers the whole chain in one shot:

- GRUB `resume=`
- initramfs configuration
- PolicyKit authorization
- Hibernate button (including a GNOME 50 extension)
- Lid close → Hibernate
- Suspend → Hibernate
- Diagnostic script

It recognizes exactly the layering I broke out above: **Hibernate isn't a toggle, it's a chain** — kernel → swap/resume → GRUB → initramfs → PolicyKit → GNOME button → lid/automatic hibernate.

### How to use it

```bash
# 1. run the diagnostic first, note the swap partition and UUID
sudo bash hibernate-diagnose.sh

# 2. edit the two constants at the top of the main script
#    (its defaults are hardcoded for the author's machine)
#    SWAP_PARTITION="/dev/nvme1n1p1"
#    SWAP_UUID="ffa0a70a-..."

# 3. run it
chmod +x complete-hibernate-setup-ubuntu-2604-gnome.sh
sudo ./complete-hibernate-setup-ubuntu-2604-gnome.sh

# 4. reboot, then test
sudo systemctl hibernate
```

What the main script actually does (I read its source): verifies the swap partition and that its UUID matches, checks swap size ≥ RAM, disables `/swap.img` and removes it from fstab (backing up to `/etc/fstab.backup.swapfile`), enables the swap partition, backs up GRUB then writes `resume=UUID=` (stripping any stale `resume`/`resume_offset` first), writes `/etc/initramfs-tools/conf.d/resume`, rebuilds the initramfs, creates the `systemd-suspend.service → systemd-hibernate.service` symlink, writes `sleep.conf` (`AllowSuspend=no`), installs two polkit rules, and restarts logind/polkit. It's fully colour-coded with a confirmation pause, and a `SWAP_UUID` mismatch makes it exit with `die` — a sensible guard that stops you running the author's parameters on your own machine.

The diagnostic script is simpler than you'd expect: it only prints RAM, `swapon --show`, `lsblk`, `blkid | grep swap`, the current GRUB params, `mokutil --sb-state`, and the kernel version. Nothing else.

Optional lid-close and power-menu button:

```bash
sudo ./configure-lid-hibernate.sh             # lid → hibernate (restarts logind; your session ends)
cd hibernate-status-gnome50 && ./install.sh  # adds Hibernate to the power menu (UUID: hibernate-status@dromi)
```

The lid script is more thorough than I expected: it configures three places at once — the current user session's `gsettings` (AC and battery separately), the GDM login screen's gsettings (a failure there `warn`s rather than aborting), and `/etc/systemd/logind.conf.d/hibernate-lid.conf` as a safety net (`HandleLidSwitch=hibernate`, `HandleLidSwitchDocked=ignore`). So even if GNOME doesn't handle the lid event itself, logind catches it.

It even ships a complete uninstall procedure (restore the GRUB backup, remove the polkit rules, re-enable the swapfile), which is more responsible than most one-shot scripts.

### Its hard prerequisites

| Requirement | Notes |
| --- | --- |
| **Swap partition** | Must be a partition, not a swapfile, and ≥ RAM |
| **Secure Boot disabled** | Otherwise you get `Sleep verb "hibernate" not supported` |
| Ubuntu 26.04 | Other releases work with tweaks; the GNOME extension targets GNOME 50 only |
| Unencrypted swap | Encrypted swap needs extra setup the scripts don't cover |

The **critical difference** is that one line: the project only supports a **swap partition**, and its README states plainly that it does not handle a swapfile's `resume_offset`. Its main script will:

```text
disable /swap.img
↓
remove the swapfile from /etc/fstab
↓
enable a swap partition
```

In other words, **running the main script on a machine that already has a working swapfile setup will tear it down** and switch the system to a swap partition. So how to choose:

| Your situation | Recommendation |
| --- | --- |
| You have (or will create) a swap partition ≥ RAM | ✅ **Recommended: disable Secure Boot + `ubuntu-gnome-hibernate`** — skip the manual sections |
| Won't touch the partition table; swapfile only | Follow sections 4–8 here; compute `resume_offset` yourself |
| Encrypted swap | Neither path covers it without extra work |
| Secure Boot must stay on | ❌ Neither works; hibernate needs Secure Boot off |
| Already on a working swapfile setup | Borrow only its GNOME 50 extension and `configure-lid-hibernate.sh` |

Side-by-side:

| | `ubuntu-gnome-hibernate` (recommended) | Manual swapfile (this post) |
| --- | --- | --- |
| Repartitioning required | yes (swap partition) | no |
| Compute the offset yourself | ❌ | ✅ |
| Secure Boot must be off | yes | yes |
| Initramfs rebuild | script calls `update-initramfs -u` | `dracut --force` directly |
| Stale resume params | script strips them for you | you must check GRUB yourself |

> Note: on Ubuntu 26.04 the `update-initramfs` shipped by the `dracut` package is a compatibility shim that forwards to dracut (`initramfs-tools` isn't installed). Both routes end up generating the initramfs with dracut; the only difference is which `resume` config file you write.
| Ubuntu + GNOME | ✅ | ✅ |
| GNOME 50 | ✅ | ✅ |
| GRUB `resume` | ✅ | ✅ |
| initramfs | initramfs-tools path (generated by dracut) | dracut |
| swap partition | required | not required |
| swapfile | ❌ | ✅ |
| `resume_offset` | ❌ | ✅ |
| Lid → Hibernate | ✅ | borrowable |
| Suspend → Hibernate | force-redirects | left alone (recommended) |

Also, the project currently has 2 stars and 1 commit, so I wouldn't treat it as a mature system-level dependency — its value is the **GNOME 50 extension and diagnostic thinking**; for the core hibernate config on a swapfile, the approach above is actually more complete.

## 10. A recommendation: don't redirect Suspend to Hibernate globally

The project's README notes that it symlinks `systemd-suspend.service` → `systemd-hibernate.service`, which turns **every** suspend call (including GNOME lid-close sleep and keyboard shortcuts) into Hibernate.

If your goal is just "a Hibernate button in the power menu plus automatic hibernation at night", **there's no need** for that: Suspend resumes in a second, Hibernate writes to disk and powers off. Turning every lid close into a disk write makes daily use worse. If you want to save power, configure "hibernate some time after lid close" instead of replacing Suspend wholesale.

## 11. Final setup

The end state on this machine:

```text
Ubuntu 26.04.1 LTS + GNOME Shell 50.1 + kernel 7.0.0-31
└── Hibernate
    ├── /swap.img              32 GiB (swapfile)
    ├── resume=UUID=<root UUID>
    ├── resume_offset=42401792
    ├── GRUB  kernel cmdline
    ├── dracut  initramfs (resume module + /etc/cmdline.d/20-resume.conf)
    ├── systemd-hibernate-resume (verified 259:4 / 42401792 match)
    ├── GNOME 50: hibernate-power-menu@arnakazim extension
    └── tested: systemctl hibernate → power off → full restore on boot
```

Key takeaways:

1. **The recommended route is two steps: swap partition + Secure Boot off**, then one [`ubuntu-gnome-hibernate`](https://github.com/jdtanner/ubuntu-gnome-hibernate) script to finish. Don't hand-type the commands.
2. With a swap partition you never deal with `resume_offset` — that's a swapfile-only concern.
3. Hibernate ≠ Suspend. The former writes to disk and powers off; the latter keeps RAM powered.
4. If you're stuck with a swapfile, **`resume_offset`** is the crux — it must be the file's **physical** offset, computed with `filefrag -v`.
5. Ubuntu 26.04 uses **dracut**; you must add the `resume` module and write `/etc/cmdline.d/20-resume.conf`.
6. Verify with `/sys/power/resume` and `/sys/power/resume_offset`; they must match the kernel parameters.
7. GNOME 50 has no Hibernate button by default — add one with `hibernate-power-menu@arnakazim` (community) or the project's own `hibernate-status@dromi`.
8. `ubuntu-gnome-hibernate` only supports a swap partition; **swapfile users should not run its main script**, only borrow the extension and helper scripts.
9. Don't casually redirect all Suspend calls to Hibernate.

---

[Chinese version](/blog/posts/zh/2026-09-13-ubuntu-hibernate-swapfile-guide)
