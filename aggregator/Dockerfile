FROM node:18-alpine

RUN npm install -g pnpm@8

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY aggregator/package.json ./aggregator/
COPY sdk/js/package.json ./sdk/js/
RUN pnpm install --frozen-lockfile --prod

COPY aggregator/ ./aggregator/
COPY sdk/js/ ./sdk/js/
RUN cd aggregator && npx prisma generate

EXPOSE 3000
CMD ["node", "aggregator/src/index.js"]
