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

## 4. 为什么还没有自动完成 GitHub 私有仓库创建

当前环境已确认存在以下阻塞：

1. 本机 **未安装 `gh`**
2. 当前环境 **没有 `GITHUB_TOKEN` / `GH_TOKEN` / `GIT_TOKEN`**
3. 当前环境对 `git@github.com` 的 SSH 测试结果为 **`Permission denied (publickey)`**

这意味着：
- 我可以把本地仓库完全准备好
- 但**无法在无凭据的前提下自动创建 GitHub 私有仓库并推送**

## 5. 最短后续方案

### 方案 A：手动在 GitHub 网页创建私有仓库（推荐）

在 GitHub 网页创建一个新的 **private** 仓库，例如：

```text
AIGC3.0_RoCE流路径交互原型
```

然后在本目录执行：

```zsh
git remote add origin <你的 GitHub 私有仓库地址>
git push -u origin main
```

### 方案 B：先安装并登录 GitHub CLI

```zsh
brew install gh
gh auth login
```

登录完成后，在本目录执行：

```zsh
gh repo create "AIGC3.0_RoCE流路径交互原型" --private --source=. --remote=origin --push
```

## 6. 关于“私有仓库 + 外部可访问部署”

如果源码必须私有、但页面要外部可访问，推荐静态托管方案：

### 推荐路径 1：GitHub 私仓 + Netlify / Vercel
- 源码仓库保持 private
- 部署平台读取 GitHub 仓库后发布静态站点
- 站点本身可配置为公开访问

### 推荐路径 2：GitHub 私仓 + 手工上传静态产物
- 保留 GitHub 私仓只存源码
- 将当前目录作为静态产物上传到外部托管平台

## 7. 临时本地预览

```zsh
cd "/Users/alexmac2/Documents/个人/Obsidian Vault/AI_Avatar/OutPut/AIGC3.0_RoCE流路径交互原型"
python3 -m http.server 8017
```

访问：

```text
http://127.0.0.1:8017
```

