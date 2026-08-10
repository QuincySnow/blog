---
title: Debian 和 Ubuntu 上安装 Docker Engine 的完整教程（2026 最新官方方式）
description: 从清理旧配置到免 sudo 全栈开发环境，一步到位
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
lang: zh
---

**适用系统**：

- Ubuntu：24.04 (Noble LTS)、25.10 (Questing)、22.04 (Jammy LTS)
- Debian：13 (Trixie)、12 (Bookworm)、11 (Bullseye)

### 步骤 0：彻底清理旧配置（防止冲突，最关键！）

在开始前，必须移除所有旧的 Docker 源和密钥（你之前遇到的错误几乎都源于此）：

```bash
# 卸载冲突包
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt-get remove --purge -y $pkg || true
done

# 删除旧源文件和密钥（覆盖常见残留位置）
sudo rm -f /etc/apt/sources.list.d/docker.list
sudo rm -f /etc/apt/sources.list.d/docker.sources
sudo rm -f /etc/apt/sources.list.d/*docker*
sudo rm -f /etc/apt/keyrings/docker*
sudo rm -f /usr/share/keyrings/docker*
sudo rm -f /usr/share/keyrings/*docker*

# 清理 apt 缓存并更新（现在应该无冲突）
sudo apt clean
sudo apt update
```

如果 `apt update` 还报 Docker 相关的签名/密钥错误，说明还有残留文件没删干净，可用以下命令查找并手动删除：

```bash
find /etc/apt /usr/share/keyrings -type f -name "*docker*" 2>/dev/null
```

### 步骤 1：安装必要工具并添加官方 GPG 密钥

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# 创建 keyrings 目录（推荐权限 0755）
sudo install -m 0755 -d /etc/apt/keyrings

# 下载 Docker 官方 GPG 密钥（.asc 格式，官方当前推荐）
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc   # Ubuntu 用这个
# 或 Debian：
# sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc
```

**注意**：Ubuntu 和 Debian 的 GPG URL 不同（`/linux/ubuntu/gpg` vs `/linux/debian/gpg`），但内容其实相同（同一个密钥）。用对应系统的即可。

### 步骤 2：添加 Docker 官方仓库（推荐 deb822 格式）

#### 对于 Ubuntu：

```bash
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(lsb_release -cs)
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
Architectures: $(dpkg --print-architecture)
EOF
```

#### 对于 Debian（包括 trixie）：

```bash
sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: $( . /etc/os-release && echo "$VERSION_CODENAME" )
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
Architectures: $(dpkg --print-architecture)
EOF
```

（如果你的系统 codename 识别有问题，可手动替换 `Suites: trixie` 或 `Suites: bookworm` 等。）

### 步骤 3：更新索引并安装 Docker

```bash
sudo apt update

# 如果这里出现 "Failed to parse keyring" 或 "not signed"：
#   - 确认 docker.asc 文件存在且非空：ls -l /etc/apt/keyrings/docker.asc
#   - cat /etc/apt/keyrings/docker.asc 看是否有内容（应为 ASCII armored 公钥）
#   - 权限正确：应为 -rw-r--r-- 或更宽松

sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 步骤 4：验证安装 & 配置

1. 检查版本：

```bash
docker --version
docker compose version   # 注意是 docker compose（新插件式）
```

2. 测试运行：

```bash
sudo docker run --rm hello-world
```

3. 启动并启用服务（通常自动）：

```bash
sudo systemctl enable --now docker
sudo systemctl status docker
```

4. **免 sudo 使用（强烈推荐）**：

```bash
sudo usermod -aG docker $USER
newgrp docker          # 立即生效，或注销重登录
```

### 常见问题快速修复表（基于你的实际报错）

| 错误描述                                 | 原因                          | 解决办法                                     |
| ---------------------------------------- | ----------------------------- | -------------------------------------------- |
| Conflicting values set for Signed-By     | 同一个源用了不同密钥文件      | 步骤 0 彻底删除所有旧密钥和源文件            |
| Failed to parse keyring ... No such file | 源指向的 docker.asc 不存在/空 | 重新下载密钥（步骤 1），确认文件存在且有内容 |
| repository is not signed                 | 密钥无效或未正确引用          | 用 deb822 格式 + 确认 Signed-By 路径正确     |
| sqv returned error code (1)              | trixie 上对坏密钥更严格       | 确保密钥文件非空、非损坏，权限 a+r           |

如果想用旧的 `.list` 格式（兼容性好，但官方现在推 deb822）：

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$(lsb_release -is | tr '[:upper:]' '[:lower:]') $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list
```

完成以上步骤后，Debian trixie 和 Ubuntu 都能正常安装最新 Docker Engine。

有任何一步报错，直接贴输出，我继续帮你调试～ 祝安装顺利！
