---
title: Linux修改连通性测试地址
description: Linux修改连通性测试地址
pubDatetime: 2026-08-31T00:00:00Z
modDatetime: 2026-08-31T00:00:00Z
draft: false
tags:
  - Linux
  - Fedora
lang: zh
---

# Linux NetworkManager 境外可用连通性测试地址及配置指南

通过修改 NetworkManager 配置，将默认的海外测试地址替换为境外机构运营但在中国大陆境内访问稳定的节点，可彻底解决网络图标误报问号（?）的问题。

推荐的境外测试地址

1. Cloudflare

地址：`http://cp.cloudflare.com/generate_204`

响应要求：`无（返回 204 No Content）`

2. Apple

地址：`http://captive.apple.com/hotspot-detect.html`

响应要求：`Success`

3. Microsoft

地址：`http://www.msftconnecttest.com/connecttest.txt`

响应要求：`Microsoft Connect Test`

## 使用与配置说明

1. 创建或编辑 NetworkManager 的连通性配置文件：

```bash
sudo nano /etc/NetworkManager/conf.d/20-connectivity.conf
```

2. 根据需要的服务商填入对应的配置内容即可：

Cloudflare

```bash
[connectivity]
uri=http://cp.cloudflare.com/generate_204
response=
```

Microsoft

```bash
[connectivity]
uri=http://www.msftconnecttest.com/connecttest.txt
response=Microsoft Connect Test
```

Apple

```bash
[connectivity]
uri=http://captive.apple.com/hotspot-detect.html
response=Success
```

**(注：如果选择 Apple 或 Microsoft，需同时修改对应的 uri 与 response 字段。例如 Apple 需写明 response=Success)**

3. 保存并退出编辑器，随后重启 NetworkManager 服务使配置立即生效：

```bash
sudo systemctl restart NetworkManager
```

4. 验证连通性状态：

在终端执行以下命令进行即时检查：

```bash
nmcli networking connectivity check
```
