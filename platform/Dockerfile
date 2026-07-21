FROM node:18-alpine

RUN npm install -g pnpm@8

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY platform/package.json ./platform/
RUN pnpm install --frozen-lockfile --prod

COPY platform/ ./platform/
RUN cd platform && npx prisma generate

EXPOSE 3001
CMD ["node", "platform/src/index.js"]
