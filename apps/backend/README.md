# MarkCV Backend

Fastify 后端 API，提供认证和简历数据服务。

> 这是 [MarkCV](../../README.md) 项目的后端部分。

## 技术栈

- Fastify
- Drizzle ORM
- PostgreSQL
- Zod

## 开发

### 1. 启动数据库

```bash
docker compose up -d
```

使用端口 `55439` 避免冲突。

### 2. 配置环境变量

```bash
cp .env.example .env
```

关键变量：

| 变量 | 说明 |
|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret |
| `GITHUB_CALLBACK_URL` | OAuth 回调地址 |
| `COOKIE_SECRET` | Cookie 加密密钥 |
| `DATABASE_URL` | PostgreSQL 连接字符串 |

### 3. 启动服务

```bash
# 在仓库根目录
pnpm --filter @mark-cv/api dev
```

服务启动在 http://localhost:3000

## API 列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/auth/github/login` | GitHub 登录入口 |
| GET | `/api/v1/auth/github/callback` | OAuth 回调 |
| GET | `/api/v1/auth/me` | 获取当前用户 |
| POST | `/api/v1/auth/logout` | 退出登录 |
| GET | `/api/v1/resumes` | 获取简历列表 |
| POST | `/api/v1/resumes` | 创建简历 |
| GET | `/api/v1/resumes/:id` | 获取简历详情 |
| PATCH | `/api/v1/resumes/:id` | 更新简历 |
| DELETE | `/api/v1/resumes/:id` | 删除简历 |

## Docker

```bash
docker build -f apps/backend/Dockerfile -t markcv-backend:latest .
```

使用仓库根目录的 `docker-compose.prod.yml` 部署时，以下环境变量必须显式设置，否则服务将无法启动：`FRONTEND_URL`、`GITHUB_CALLBACK_URL`、`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`COOKIE_SECRET`。另外请确认 GitHub OAuth App 的 `Authorization callback URL` 与 `GITHUB_CALLBACK_URL` 完全一致。
