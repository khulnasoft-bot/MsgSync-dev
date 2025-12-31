# MsgSync 🚀

> **The Enterprise-Grade Communications Infrastructure.** Unified SMS, OTP, and Campaign Management with native multi-tenancy and real-time observability.

[![CI](https://github.com/MsgSync/MsgSync/workflows/CI/badge.svg)](https://github.com/MsgSync/MsgSync/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](docker-compose.yml)

## 💎 Project Overview

MsgSync is a high-performance, polyglot communications platform designed to bridge the gap between complex external data sources and reliable message delivery. Built with a focus on **SaaS readiness**, it provides a unified API for all your messaging needs.

### 🏗️ Unified Core Architecture
- **Platform**: Central delivery engine powered by Node.js, Prisma, and BullMQ.
- **Aggregator**: Smart normalization engine for bridging Slack, Webhooks, and custom APIs.
- **Multi-SDK**: Native, high-quality clients for **JavaScript**, **Python**, and **Go**.

---

## 🌟 Key Features

### 🏢 Multi-Tenant SaaS Engine
First-class support for **Organizations**. Every message, campaign, and API key is isolated at the database level, making it perfect for building your own white-label messaging service.

### 🔐 Identity & OTP (2FA)
Native One-Time Password lifecycle management. Securely generate, send, and verify 4-6 digit codes with built-in expiration and "one-time-use" logic.

### 📢 Targeted Campaigns
Bulk SMS with a powerful variable substitution engine. Personalize thousands of messages using `{{firstName}}` and custom `{{attributes}}` stored in the Contact Manager.

### 📊 Real-time Observability
Premium dark-mode dashboard providing live statistics on delivery success rates, volume trends, and platform health.

---

## 🛠️ Stack & Technology

- **Backend**: Node.js / Express
- **Persistence**: PostgreSQL / Prisma ORM
- **Queueing**: Redis / BullMQ (Exponential backoff & retries)
- **Integrations**: Twilio, Slack (Alerts), Generic HTTP Webhooks
- **Deployment**: Docker / Docker Compose

---

## 🚀 Quick Start

### One-Command Launch (Docker)
```bash
docker-compose up -d --build
```

### Manual Setup
```bash
# Install Monorepo Dependencies
npm install

# Initialize Platform (Port 3001)
cd platform
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Initialize Aggregator (Port 3000)
cd ../aggregator
npx prisma migrate dev
npm run dev
```

---

## 📚 Components & SDKs

| Component | Path | Description |
| :--- | :--- | :--- |
| **Platform** | `/platform` | Core API & Delivery Engine |
| **Aggregator** | `/aggregator` | Message Bridge & Normalizer |
| **JS SDK** | `/sdk/js` | Official Node/JS Client |
| **Python SDK** | `/sdk/python` | Official Python Client |
| **Go SDK** | `/sdk/go` | Official Go Client |
| **PHP SDK** | `/sdk/php` | Official PHP Client |

### 🔍 Explore Demos
We have included complete end-to-end demonstrations in `examples/sdk-demo/`:
- `basic-usage.js`: Simple 1-to-1 messaging.
- `otp-flow.js`: Complete 2FA lifecycle.
- `bulk-campaign.js`: Variable substitution & marketing.
- `cross-sync.js`: Aggregator-to-Platform bridge.
- `php-demo/demo.php`: PHP SDK integration examples.

---

## 📈 Roadmap & Future
- [ ] Discord & MS Teams Integration Alerts.
- [ ] AI-powered SMS template optimization.
- [ ] Push Notification channel support.
- [ ] Dashboard Role-Based Access Control (RBAC).

---

**Built with ❤️ and Agents by the MsgSync Team.**
