FROM node:18-alpine

RUN npm install -g pnpm@8

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/platform/package.json ./packages/platform/
RUN pnpm install --frozen-lockfile --prod

COPY packages/platform/ ./packages/platform/
RUN cd packages/platform && npx prisma generate

EXPOSE 3001
CMD ["node", "packages/platform/src/index.js"]