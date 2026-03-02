# MarkCV

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-boses%2Fmarkcv-blue)](https://hub.docker.com/r/boses/markcv-backend)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

开源的在线 Markdown 简历制作工具，支持实时预览、云端同步和 PDF 导出。

**在线体验**: https://markcv.xiaowo.live

![Tech Stack](https://img.shields.io/badge/Vue%203-4FC08D?logo=vue.js&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Fastify-000000?logo=fastify&logoColor=white)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

## 功能特点

- ✍️ **Markdown 编辑** - 使用熟悉的 Markdown 语法编写简历
- 👁️ **实时预览** - 边写边看，所见即所得
- 📄 **PDF 导出** - 基于 Paged.js 的 A4 分页预览
- ☁️ **云端同步** - GitHub 登录，数据自动同步
- 🎨 **自定义样式** - 支持主题色、字体、边距自定义

## 版本选择

| 版本               | 地址                                   | 特点                              |
| ------------------ | -------------------------------------- | --------------------------------- |
| **在线版（推荐）** | https://markcv.xiaowo.live             | GitHub 登录、云端同步、多设备访问 |
| **纯本地版**       | https://bosens-china.github.io/MarkCV/ | 无需登录、数据存在浏览器、纯静态  |

> 纯本地版适合不想使用联网功能的用户，数据完全保留在本地浏览器。

## 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/bosens-China/MarkCV.git
cd MarkCV

# 2. 复制并填写配置
cp .env.prod.example .env.prod
# 编辑 .env.prod，配置 GitHub OAuth 等信息

# 3. 启动
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

访问 http://localhost:8080

### 方式二：本地开发

```bash
# 安装依赖
pnpm install

# 启动数据库
cd apps/backend && docker compose up -d

# 配置环境变量
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# 编辑 .env 文件，配置 GitHub OAuth

# 启动后端
pnpm --filter @mark-cv/api dev

# 启动前端（新终端）
pnpm --filter @mark-cv/frontend dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3000

## 配置 GitHub OAuth

1. 登录 GitHub → Settings → Developer settings → [OAuth Apps](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息：
   - **Application name**: MarkCV
   - **Homepage URL**: 你的域名（如 `https://markcv.xiaowo.live`）
   - **Authorization callback URL**: `https://你的域名/api/v1/auth/github/callback`
4. 保存后获取 **Client ID** 和 **Client Secret**
5. 填入 `.env` 或 `.env.prod` 文件

## 项目结构

```
apps/
  frontend/   # Vue 3 前端
  backend/    # Fastify 后端 API
docker-compose.prod.yml  # 生产部署配置
```

详细说明：

- [前端文档](apps/frontend/README.md)
- [后端文档](apps/backend/README.md)

## 环境变量

### 必填项（生产部署）

使用 `docker-compose.prod.yml` 部署时，以下变量必须显式设置，否则服务将无法启动：

| 变量                   | 说明                        | 示例                                      |
| ---------------------- | --------------------------- | ----------------------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub OAuth Client ID      | `Iv1.xxx`                                 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret  | `xxx`                                     |
| `GITHUB_CALLBACK_URL`  | OAuth 回调地址              | `https://xxx/api/v1/auth/github/callback` |
| `FRONTEND_URL`         | 前端地址                    | `https://xxx`                             |
| `COOKIE_SECRET`        | Cookie 加密密钥（至少32位） | `your-random-secret-key`                  |

### 可选项

| 变量                | 说明       | 默认值   |
| ------------------- | ---------- | -------- |
| `POSTGRES_PASSWORD` | 数据库密码 | 随机生成 |

## Docker 镜像

镜像已发布到 Docker Hub：

```bash
# 后端
docker pull boses/markcv-backend:latest

# 前端
docker pull boses/markcv-frontend:latest
```

## 贡献

欢迎 Issue 和 PR！

- 提交 Issue: https://github.com/bosens-China/MarkCV/issues
- 提交 PR: https://github.com/bosens-China/MarkCV/pulls

## License

[MIT](LICENSE)
