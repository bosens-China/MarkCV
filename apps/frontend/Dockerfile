FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json

RUN pnpm install --filter @mark-cv/frontend... --frozen-lockfile

COPY apps/frontend apps/frontend


RUN pnpm --filter @mark-cv/frontend build


FROM nginx:1.27-alpine AS runner

# 使用模板文件，nginx 会自动通过 envsubst 替换环境变量
COPY apps/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
