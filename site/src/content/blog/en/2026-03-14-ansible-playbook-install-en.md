---
title: Installing and Using Ansible Playbook
description: Install Ansible and ansible-playbook on Ubuntu/Debian, macOS, and run your first playbook
pubDatetime: 2026-03-14T00:00:00Z
modDatetime: 2026-03-14T00:00:00Z
draft: false
tags:
  - ansible
  - sshpass
  - automation
  - devops
  - linux
  - macos
lang: en
---

# Installing and Using Ansible Playbook

Ansible is an agentless automation tool that runs tasks on multiple hosts over SSH. **Ansible Playbook** uses YAML to describe what to run, so you can reliably configure and deploy systems. This guide covers installing Ansible (including `ansible-playbook`) on common systems and running your first playbook.

## 1. Install Ansible

### Ubuntu / Debian

Using the system package manager is recommended (stable versions):

```bash
sudo apt update
sudo apt install -y ansible
```

Verify:

```bash
ansible --version
ansible-playbook --version
```

For a newer version, you can enable a PPA (Ubuntu) or install via pip/uv (see below).

### sshpass (optional, for password-based SSH)

When you use **password** instead of SSH keys to connect to hosts, Ansible uses `sshpass` to pass the password non-interactively.

- **Ubuntu / Debian**:

```bash
sudo apt install -y sshpass
```

- **macOS** (Homebrew does not ship sshpass; you can use SSH keys or tools like expect instead; or install from a tap):

```bash
brew install hudochenkov/sshpass/sshpass
```

After installing, run playbooks with `-k` (or `--ask-pass`) so Ansible prompts for the SSH password; it will use sshpass to supply it. For production, **SSH keys** are recommended to avoid storing passwords or leaving them in shell history.

### macOS

Using Homebrew:

```bash
brew install ansible
```

### Install via pip / uv (cross‑platform)

If you already have Python, you can install Ansible for a specific version:

```bash
# Using uv (recommended, fast)
uv tool install ansible

# Or pip
pip install ansible
# Or current user only
pip install --user ansible
```

If the commands are not on your PATH, use `uv run ansible` or add `~/.local/bin` to PATH.

## 2. Create an inventory

Ansible uses an **inventory** to know which hosts to manage. For local testing, `localhost` is enough.

Create a simple inventory file `hosts.ini`:

```ini
[local]
localhost ansible_connection=local
```

For remote hosts, add SSH details:

```ini
[webservers]
192.168.1.10 ansible_user=deploy
192.168.1.11 ansible_user=deploy
```

## 3. Your first playbook

Create `playbook.yml`:

```yaml
---
- name: First playbook example
  hosts: local
  tasks:
    - name: Print welcome message
      ansible.builtin.debug:
        msg: "Ansible Playbook ran successfully"
```

From the directory containing the playbook, run:

```bash
ansible-playbook -i hosts.ini playbook.yml
```

You should see the TASK and the message “Ansible Playbook ran successfully”.

## 4. Common commands

| Command | Description |
|--------|-------------|
| `ansible-playbook -i <inventory> <playbook.yml>` | Run a playbook |
| `ansible -i <inventory> all -m ping` | Test host connectivity |
| `ansible-playbook playbook.yml --check` | Dry run (no changes) |
| `ansible-playbook playbook.yml -v` | Verbose output |

## 5. Next steps

- Use **roles** to organize tasks and variables for reuse.
- Use the **templates** module with Jinja2 to generate config files.
- Use **handlers** to restart services (e.g. nginx, sshd) after config changes.
- Run `ansible-playbook` from CI (e.g. GitHub Actions, GitLab CI) for automated deployment.

For more syntax and modules, see the [Ansible documentation](https://docs.ansible.com/).

---

[Chinese version](2026-03-14-ansible-playbook-install)
