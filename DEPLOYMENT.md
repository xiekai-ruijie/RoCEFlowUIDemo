---
tags: [output, prototype, deployment, github]
date: 2026-03-17
---

# AIGC3.0_RoCE流路径交互原型 - 仓库与部署说明

## 1. 当前已完成

- 原型目录已统一命名为 `AIGC3.0_RoCE流路径交互原型`
- 页面与文档标题已统一为 `AIGC3.0_RoCE流路径交互原型`
- 当前目录已初始化为**独立 Git 仓库**
- 当前仓库默认分支已调整为 `main`
- 已创建首个本地提交
- 已补充 `.gitignore`
- 已绑定远端 `origin=git@github.xiekai.ruijie:xiekai-ruijie/RoCEFlowUIDemo.git`
- 已新增 GitHub Pages 工作流：`.github/workflows/pages.yml`
- 已补充 `.nojekyll`

## 2. 当前目录

```text
OutPut/AIGC3.0_RoCE流路径交互原型/
```

## 3. 本地仓库状态

在本目录执行可查看：

```zsh
git branch --show-current
git status
git log --oneline -n 3
```

## 4. 当前 GitHub 推送状态

目标仓库：

```text
git@github.xiekai.ruijie:xiekai-ruijie/RoCEFlowUIDemo.git
```

当前本地仓库已经完成：

```zsh
git remote add origin git@github.xiekai.ruijie:xiekai-ruijie/RoCEFlowUIDemo.git
```

且已经实际尝试执行：

```zsh
git push -u origin main
```

当前源码推送链路已切换到 **SSH 远端**，可以继续用 SSH 推送。

## 5. GitHub Pages 部署文件

当前仓库已经补充：

```text
.github/workflows/pages.yml
.nojekyll
```

工作流逻辑：
- 当 `main` 分支有新提交时自动触发
- 只发布运行站点所需文件：`index.html`、`assets/`、`.nojekyll`
- 使用 GitHub 官方 Pages Actions 完成部署

## 6. 仍需在 GitHub 网页完成的最小步骤

由于 Pages 是否允许公开访问受企业 GitHub 平台策略影响，通常还需要在网页确认：

1. 打开仓库 `Settings -> Pages`
2. 将 Source 设为 `GitHub Actions`
3. 查看 `Actions` 页签中 `Deploy GitHub Pages` 工作流是否成功
4. 若企业平台支持外部匿名访问，则记录生成的 Pages 地址

## 7. 之前 HTTPS 推送失败的原因记录

为了保留排障记录，之前在显式用户名模式下，Git 返回：

```text
Password for 'https://xiekai-ruijie@github.com':
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/xiekai-ruijie/RoCEFlowUIDemo.git/'
```

这说明后续需要使用 **PAT（Personal Access Token）** 或完成本机 `gh auth login` / Git 凭据配置后，再执行推送。

## 8. 为什么之前没有自动完成 GitHub 私有仓库创建 / 推送

当前环境已确认存在以下阻塞：

1. 本机 **未安装 `gh`**
2. 当前环境 **没有 `GITHUB_TOKEN` / `GH_TOKEN` / `GIT_TOKEN`**
3. 当前环境对 `git@github.com` 的 SSH 测试结果为 **`Permission denied (publickey)`**

这意味着：
- 我可以把本地仓库完全准备好
- 但**无法在无凭据的前提下自动创建 GitHub 私有仓库并推送**

## 9. 最短后续方案

### 方案 A：继续使用已验证可用的 SSH 推送（推荐）

在本目录执行：

```zsh
cd "/Users/alexmac2/Documents/个人/Obsidian Vault/AI_Avatar/OutPut/AIGC3.0_RoCE流路径交互原型"
git push -u origin main
```

推送完成后，到仓库网页确认 `Actions` 中的 Pages 工作流是否自动运行。

### 方案 B：使用 GitHub 网页启用 Pages

在仓库网页中完成：

```text
Settings -> Pages -> Source: GitHub Actions
```

## 10. 关于“私有仓库 + 外部可访问部署”

如果源码必须私有、但页面要外部可访问，推荐静态托管方案：

### 推荐路径 1：GitHub 私仓 + Netlify / Vercel
- 源码仓库保持 private
- 部署平台读取 GitHub 仓库后发布静态站点
- 站点本身可配置为公开访问

### 推荐路径 2：GitHub 私仓 + 手工上传静态产物
- 保留 GitHub 私仓只存源码
- 将当前目录作为静态产物上传到外部托管平台

## 11. 临时本地预览

```zsh
cd "/Users/alexmac2/Documents/个人/Obsidian Vault/AI_Avatar/OutPut/AIGC3.0_RoCE流路径交互原型"
python3 -m http.server 8017
```

访问：

```text
http://127.0.0.1:8017
```

