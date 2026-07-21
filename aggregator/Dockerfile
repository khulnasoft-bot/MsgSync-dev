FROM node:18-alpine

RUN npm install -g pnpm@8

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY aggregator/package.json ./aggregator/
RUN pnpm install --frozen-lockfile --prod

COPY aggregator/ ./aggregator/
RUN cd aggregator && npx prisma generate

EXPOSE 3000
CMD ["node", "aggregator/src/index.js"]
