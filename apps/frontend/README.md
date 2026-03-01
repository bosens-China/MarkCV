# MarkCV Frontend

Vue 3 前端应用，提供简历编辑、预览和管理界面。

> 这是 [MarkCV](../../README.md) 项目的前端部分。

## 技术栈

- Vue 3 + Composition API
- TypeScript
- Vite
- Pinia
- Naive UI
- UnoCSS

## 开发

```bash
# 在仓库根目录执行
pnpm install
pnpm --filter @mark-cv/frontend dev
```

访问 http://localhost:5173

## 构建

```bash
pnpm --filter @mark-cv/frontend build
```

输出目录：`dist/`

## Docker

```bash
docker build -f apps/frontend/Dockerfile -t markcv-frontend:latest .
```

## 生产部署说明（2026-03）

前端容器使用 Nginx 反向代理 `/api/v1` 到后端，默认目标为 `http://backend:3000`。

如需覆盖，请在 `docker-compose.prod.yml` 中设置：

- `BACKEND_URL`（示例：`http://backend:3000` 或你的内部网关地址）
