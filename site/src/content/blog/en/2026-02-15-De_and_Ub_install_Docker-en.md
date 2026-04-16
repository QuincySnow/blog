---
title: Install Docker Engine on Debian and Ubuntu (2026)
description: Clean old config and set up a sudo-free dev environment
pubDatetime: 2026-02-15T00:00:00Z
modDatetime: 2026-02-15T00:00:00Z
draft: false
tags:
  - docker
  - debian
  - ubuntu
  - apt
  - deb822
  - trixie
  - fish-shell
lang: en
---

**Systems**: Ubuntu 24.04 (Noble), 25.10 (Questing), 22.04 (Jammy); Debian 13 (Trixie), 12 (Bookworm), 11 (Bullseye).

### Step 0: Remove old Docker config (critical)

Remove all old Docker sources and keys to avoid conflicts:

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt-get remove --purge -y $pkg || true
done
sudo rm -f /etc/apt/sources.list.d/docker.list /etc/apt/sources.list.d/docker.sources
sudo rm -f /etc/apt/sources.list.d/*docker*
sudo rm -f /etc/apt/keyrings/docker* /usr/share/keyrings/docker* /usr/share/keyrings/*docker*
sudo apt-get update
```

Then add the official Docker APT repo (deb822 format), install `docker-ce`, and add your user to the `docker` group so you can run Docker without sudo. For the exact repo and package steps, see the [Chinese version](2026-02-15-De_and_Ub_install_Docker) of this guide.
