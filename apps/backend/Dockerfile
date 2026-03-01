FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json

RUN pnpm install --filter @mark-cv/api... --frozen-lockfile

COPY apps/backend apps/backend

RUN pnpm --filter @mark-cv/api build


FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

ENV NODE_ENV=production

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json

RUN pnpm install --filter @mark-cv/api... --prod --frozen-lockfile

COPY --from=builder /app/apps/backend/dist apps/backend/dist

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["node", "dist/server.js"]
