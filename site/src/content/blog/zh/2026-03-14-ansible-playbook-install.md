---
title: Ansible Playbook 的安装与基本使用
description: 在 Ubuntu/Debian、macOS 等系统上安装 Ansible 与 ansible-playbook，并跑通第一个 playbook
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
lang: zh
---

# Ansible Playbook 的安装与基本使用

Ansible 是一款无 Agent 的自动化运维工具，通过 SSH 对多台主机执行任务。**Ansible Playbook** 用 YAML 描述“要执行什么”，可复现地完成配置、部署等操作。本文介绍在常见系统上安装 Ansible（含 `ansible-playbook`），并运行第一个 playbook。

## 1. 安装 Ansible

### Ubuntu / Debian

推荐使用系统包管理器安装（版本较稳定）：

```bash
sudo apt update
sudo apt install -y ansible
```

安装后验证：

```bash
ansible --version
ansible-playbook --version
```

若需要较新版本，可启用 PPA（Ubuntu）或使用 pip/uv 安装（见下文）。

### sshpass（密码登录时可选）

当使用**密码**而非 SSH 密钥连接远程主机时，Ansible 依赖 `sshpass` 在非交互下传密码。

- **Ubuntu / Debian**：

```bash
sudo apt install -y sshpass
```

- **macOS**（Homebrew 不提供 sshpass，可用 ssh 密钥或 expect 等替代；若从源码装需先安装 Xcode 命令行工具）：

```bash
brew install hudochenkov/sshpass/sshpass
```

安装后，执行 playbook 时加上 `-k`（或 `--ask-pass`）让 Ansible 提示输入 SSH 密码；Ansible 会调用 sshpass 传密码。生产环境更推荐配置 **SSH 密钥**，避免密码落盘或命令行历史。

### macOS

使用 Homebrew：

```bash
brew install ansible
```

### 使用 pip / uv 安装（多系统通用）

在已有 Python 环境下可单独安装 Ansible，便于控制版本：

```bash
# 使用 uv（推荐，速度快）
uv tool install ansible

# 或使用 pip
pip install ansible
# 或仅当前用户
pip install --user ansible
```

安装后若命令未在 PATH 中，可用 `uv run ansible` 或把 `~/.local/bin` 加入 PATH。

## 2. 准备清单（inventory）

Ansible 通过 **inventory** 知道要操作哪些主机。本地测试可只写 `localhost`。

创建目录并写一个简单清单 `hosts.ini`：

```ini
[local]
localhost ansible_connection=local
```

若管理远程主机，可写 SSH 信息：

```ini
[webservers]
192.168.1.10 ansible_user=deploy
192.168.1.11 ansible_user=deploy
```

## 3. 第一个 Playbook

创建 `playbook.yml`：

```yaml
---
- name: 第一个 Playbook 示例
  hosts: local
  tasks:
    - name: 输出欢迎信息
      ansible.builtin.debug:
        msg: "Ansible Playbook 已成功运行"
```

在 playbook 所在目录执行：

```bash
ansible-playbook -i hosts.ini playbook.yml
```

若一切正常，会看到 TASK 与 “Ansible Playbook 已成功运行” 的输出。

## 4. 常用命令小结

| 命令 | 说明 |
|------|------|
| `ansible-playbook -i <inventory> <playbook.yml>` | 执行 playbook |
| `ansible -i <inventory> all -m ping` | 测试主机连通性 |
| `ansible-playbook playbook.yml --check` | 试跑（不实际改系统） |
| `ansible-playbook playbook.yml -v` | 输出更详细日志 |

## 5. 后续可做的事

- 使用 **roles** 组织任务与变量，便于复用。
- 用 **templates** 模块配合 Jinja2 生成配置文件。
- 用 **handlers** 在配置变更后重启服务（如 nginx、sshd）。
- 在 CI（GitHub Actions、GitLab CI 等）中调用 `ansible-playbook` 做自动部署。

更多语法与模块可查阅 [Ansible 官方文档](https://docs.ansible.com/)。
