# NEXUS - Neural Productivity Suite

> **A futuristic productivity suite with real-time collaboration, gamification, and enterprise-grade security.**

![Status](https://img.shields.io/badge/status-active-success)
![Backend](https://img.shields.io/badge/backend-NestJS-red)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue)
![Database](https://img.shields.io/badge/database-Neon%20PostgreSQL-green)

---

## 🏗️ Project Structure

```text
OrionTracking/
 ├── backend/        # NestJS + Prisma API (deploy to Render)
 ├── frontend/       # React + Vite UI (deploy to Vercel)
 └── README.md
```

---

## 🚀 Local Development

### Backend (NestJS)
```bash
cd backend
npm install
# Copy and fill in your environment variables
cp .env.example .env
# Push schema to Neon database
npx prisma db push
# Start dev server
npm run start:dev
```
Backend runs at: `http://localhost:3000`

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🌍 Deployment

### Backend → Render
| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run start:prod` |
| **Environment Variables** | `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `FRONTEND_URL`, `NODE_ENV=production` |

### Frontend → Vercel
| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Environment Variables** | `VITE_API_URL` = your Render backend URL |

---

## 🗄️ Database (Neon)

1. Create a project on [Neon](https://neon.tech)
2. Copy the **Connection String** from the dashboard
3. Set it as `DATABASE_URL` in `backend/.env`
4. Run migrations:
   ```bash
   cd backend
   npx prisma db push
   ```
5. (Optional) View data visually:
   ```bash
   npx prisma studio
   ```

---

## 📦 Environment Variables

### `backend/.env`
```env
DATABASE_URL="postgresql://user:password@host/nexus?sslmode=require"
JWT_SECRET="your-long-random-secret"
RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

### `frontend/.env` (create this file)
```env
VITE_API_URL="http://localhost:3000"
```

---

## ✨ Features

### Core Productivity
- ✅ **Task Management** — Kanban board with drag & priority sorting
- 🔄 **Habit Tracking** — Streak-based daily consistency logs
- 👥 **Squadron Hub** — Real-time team collaboration & squad chat

### Gamification
- 🏆 **XP & Levels** — Earn XP for completing tasks and habits
- 🎖️ **Achievements** — Unlock badges for milestones

### Security
- 🔒 **JWT Auth** — Secure access & refresh tokens via HttpOnly cookies
- 🛡️ **2FA Support** — TOTP-based two-factor authentication
- 📧 **Email Verification** — Powered by Resend

---

**Built with ❤️ for High-Performance Operators.**
