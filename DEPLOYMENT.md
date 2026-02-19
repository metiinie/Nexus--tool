# 🚀 NEXUS Deployment Guide

This project is configured for a **Monorepo Deployment** on Vercel. Both the NestJS backend and React frontend are deployed as a single unit.

## 🛠️ Prerequisites

1.  **Neon Account**: You need a serverless PostgreSQL database. Get your connection string from the Neon dashboard.
2.  **Vercel Account**: For hosting the application.
3.  **Resend API Key**: Required for email notifications/verification.

## 📡 Database Setup

1.  Create a new project on [Neon](https://neon.tech).
2.  Go to **Dashboard** -> **Connection Details**.
3.  Copy the **Connection String** (use the pooled connection string if available for serverless).
4.  Run migrations locally to ensure your Neon DB is ready:
    ```bash
    cd backend
    # Replace with your Neon URL temporarily or set it in .env
    npx prisma db push
    ```

## 🚀 Deploying to Vercel

### 1. Project Configuration
Connect your GitHub repository to Vercel and use the following settings:

- **Framework Preset**: `Other` (or `Vite` if it detects it, but we use a custom build command)
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`

### 2. Environment Variables
Add the following variables in the Vercel Dashboard:

| Variable | Source / Value |
| :--- | :--- |
| `DATABASE_URL` | Your Neon Connection String |
| `JWT_SECRET` | A random long string for security |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) |
| `RESEND_API_KEY` | Your Resend API Key |
| `GEMINI_API_KEY` | Your Google Gemini API Key |

### 3. Build Process
When you push to `main` (or run `vercel --prod`), Vercel will:
1.  Install dependencies for the entire monorepo.
2.  Run `prisma generate` for both backend and frontend.
3.  Compile the NestJS backend.
4.  Build the React frontend using Vite.
5.  Serve the frontend assets from `frontend/dist`.
6.  Route all `/api` requests to the serverless function in `api/index.ts`.

## 🧪 Local Production Test
To test the production build locally:
```bash
npm run build
# You can use a tool like 'serve' to test the frontend
# and 'node backend/dist/main' for the backend
```

## ⚠️ Troubleshooting
- **Prisma Issues**: Ensure `DATABASE_URL` is correct. For Neon, verify you are using the pooled connection string if required.
- **CORS Errors**: Check that `FRONTEND_URL` in your backend environment variables matches your actual Vercel URL.
- **API 404s**: Ensure `vercel.json` is in the root directory and contains the correct rewrites.
