# Getting Started with MsgSync

MsgSync is a powerful messaging platform designed to synchronize and manage messages across multiple channels. Follow this guide to get your development environment up and running.

## Prerequisites

- **Node.js**: Version 16.0.0 or higher.
- **pnpm**: Version 8.0.0 or higher.
- **Docker** (Optional): For running PostgreSQL and Redis containers.
- **PostgreSQL**: Required for the aggregator database.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MsgSync/MsgSync.git
   cd MsgSync
   ```

2. Install dependencies for the root and workspaces:
   ```bash
   pnpm install
   ```

## Modules Overview

- **platform**: The core API and management dashboard.
- **aggregator**: The service that ingest messages from external sources.
- **sdk**: Libraries for integrating MsgSync into your applications.

## Initial Setup

### 1. Configure the Aggregator
The aggregator requires a database connection.

```bash
cd aggregator
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 2. Run Database Migrations
```bash
npx prisma migrate dev
```

### 3. Start Development Servers
You can start modules individually or from the root.

To start the aggregator:
```bash
cd aggregator
pnpm run dev
```

## Next Steps

- Explore the [Aggregator Guide](./aggregator-guide.md) to learn how to add message sources.
- Check out the [Platform API](./platform-api.md) for core message management details.
