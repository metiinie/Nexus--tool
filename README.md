# NEXUS - Neural Productivity Suite

> **A futuristic, holographic-themed productivity suite with real-time collaboration, gamification, and enterprise-grade security.**

![Status](https://img.shields.io/badge/status-active-success)
![Neural Link](https://img.shields.io/badge/neural--link-stable-cyan)
![Deployment](https://img.shields.io/badge/deployment-vercel-black)

---

## 🏗️ Monorepo Structure

```text
OrionTracking/
 ├── frontend/           # Vite + React (UI & Features)
 ├── backend/            # NestJS + Prisma (Secure API)
 ├── api/                # Vercel Serverless entry
 ├── package.json        # Root Workspace configuration
 └── README.md           # This guide
```

---

## 🚀 Neural Quickstart

### 1. Initialization
```bash
# Install everything
npm install
npm run install:all

# Setup Database
cd backend
npx prisma db push
```

### 2. Launching Systems
You can run both systems simultaneously from the root:
```bash
npm run dev
```

Or manually:
- **Core API**: `cd backend && npm run start:dev`
- **Neural UI**: `cd frontend && npm run dev`

---

## 🌍 Deployment

The project is optimized for deployment on **Vercel**.

1.  **Database**: Setup a PostgreSQL database (e.g., Neon).
2.  **Guide**: Follow the detailed [Deployment Guide](./DEPLOYMENT.md) for step-by-step instructions.
3.  **CI/CD**: Automatic deployments are configured via GitHub integration.

---

## 📊 Database Management

To view and edit your data visually, use the built-in Neural Terminal:
```bash
npm run studio
```
*This launches Prisma Studio at http://localhost:5555*

---

## ✨ Features & Architecture

### Core Productivity
- ✅ **Task Management**: Advanced Kanban with real-time sync.
- 🔄 **Habit Tracking**: Streak-based consistency logging.
- 👥 **Squadron Hub**: Real-time team collaboration.

### Security
- 🔒 **Quantum Auth**: JWT + HttpOnly Cookies.
- 🛡️ **Authoritative DB**: Prisma + PostgreSQL/SQLite.
- ⚡ **Neural Link**: Real-time backend status monitoring.

---

**Built with ❤️ for High-Performance Operators.**
