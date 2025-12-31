# MsgSync Deployment Guide

This guide explains how to deploy MsgSync using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- A PostgreSQL database (can be run via Docker)
- A Redis instance (can be run via Docker)

## Docker Compose Setup

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: msgsync
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: msgsync_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  platform:
    build: 
      context: ./platform
    environment:
      DATABASE_URL: "postgresql://msgsync:password123@postgres:5432/msgsync_platform?schema=public"
      REDIS_URL: "redis://redis:6379"
      PORT: 3001
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  aggregator:
    build:
      context: ./aggregator
    environment:
      DATABASE_URL: "postgresql://msgsync:password123@postgres:5432/msgsync_platform?schema=public"
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## Dockerfiles

### Platform Dockerfile (`platform/Dockerfile`)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]
```

### Aggregator Dockerfile (`aggregator/Dockerfile`)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]
```

## Deployment Steps

1.  **Build and Start**:
    ```bash
    docker-compose up -d --build
    ```

2.  **Initialize Database**:
    ```bash
    docker-compose exec platform npx prisma migrate deploy
    docker-compose exec platform npm run prisma:seed
    ```

3.  **Verify**:
    - Platform API: `http://localhost:3001/health`
    - Aggregator API: `http://localhost:3000/health`
```
