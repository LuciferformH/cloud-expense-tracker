# Deployment Guide - Cloud Expense Tracker

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Vercel     │────▶│   Render     │────▶│ Neon PostgreSQL  │
│  (Frontend)  │ API │  (Backend)   │ DB  │   (Database)     │
│  React + Vite│     │  Express API │     │                  │
└──────────────┘     └──────────────┘     └─────────────────┘
```

---

## Step 1: Create GitHub Repository

```bash
cd cloud-expense-tracker
git init
git add .
git commit -m "Initial commit: Cloud Expense Tracker"
git remote add origin https://github.com/YOUR_USERNAME/cloud-expense-tracker.git
git push -u origin main
```

---

## Step 2: Set Up Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Create a new project
3. Copy the **connection string** (it looks like):
   ```
   postgresql://neondb_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/cloud_expense_tracker?sslmode=require
   ```
4. Keep this safe - you'll need it for Render

---

## Step 3: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `cloud-expense-tracker-api`
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     cd backend && npm install && npx prisma generate --schema=prisma/schema.postgresql.prisma && npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma && npm run build
     ```
   - **Start Command:**
     ```bash
     cd backend && node dist/server.js
     ```
5. Add **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | Generate a random 32-char string |
   | `JWT_REFRESH_SECRET` | Generate another random 32-char string |
   | `JWT_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `PORT` | `10000` |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | *(leave empty for now, update after frontend deploy)* |
   | `FRONTEND_URL` | *(leave empty for now, update after frontend deploy)* |

6. Click **Create Web Service**
7. Wait for deployment to finish
8. **Copy your Render URL** (e.g., `https://cloud-expense-tracker-api.onrender.com`)
9. Test it: visit `https://cloud-expense-tracker-api.onrender.com/api/health`

---

## Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New → Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add **Environment Variable:**
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://cloud-expense-tracker-api.onrender.com/api` |
6. Click **Deploy**
7. Wait for deployment to finish
8. **Copy your Vercel URL** (e.g., `https://cloud-expense-tracker.vercel.app`)

---

## Step 5: Update Backend CORS

1. Go back to **Render Dashboard → Environment**
2. Update these variables with your Vercel URL:
   | Key | Value |
   |-----|-------|
   | `CORS_ORIGIN` | `https://cloud-expense-tracker.vercel.app` |
   | `FRONTEND_URL` | `https://cloud-expense-tracker.vercel.app` |
3. Render will auto-redeploy

---

## Step 6: Seed the Production Database

After Render deploys, run the seed command:

```bash
# Via Render Shell (Dashboard → Shell tab)
cd backend
npx prisma db seed --schema=prisma/schema.postgresql.prisma
```

Or add a seed script to `package.json`:
```json
"prisma:seed": "ts-node prisma/seed.ts"
```

---

## Step 7: Set Up GitHub Secrets (for CI/CD)

Go to your GitHub repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | Get from Vercel Settings → Tokens |
| `VERCEL_ORG_ID` | Get from Vercel project settings |
| `VERCEL_PROJECT_ID` | Get from Vercel project settings |
| `RENDER_SERVICE_ID` | Get from Render Dashboard → Settings |
| `RENDER_API_KEY` | Get from Render Account → API Keys |

---

## Step 8: Verify Deployment

1. Visit your Vercel URL
2. Register a new account or use the demo credentials
3. Test all features:
   - Login/Register
   - Add expenses
   - Create budgets
   - View dashboard
   - Check analytics
   - Export reports
   - Get AI suggestions

---

## Environment Variables Summary

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret for access tokens | Random 32-char string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Random 32-char string |
| `CORS_ORIGIN` | Frontend URL | `https://xxx.vercel.app` |
| `FRONTEND_URL` | Frontend URL for emails | `https://xxx.vercel.app` |
| `PORT` | Server port | `10000` |

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://xxx.onrender.com/api` |

---

## Troubleshooting

### Backend won't start
- Check Render logs for Prisma migration errors
- Ensure `DATABASE_URL` is correct and includes `?sslmode=require`
- Verify all required env vars are set

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel environment variables
- Check CORS_ORIGIN matches your Vercel URL exactly
- Check browser console for network errors

### Database connection errors
- Ensure Neon database is running (check Neon dashboard)
- Verify connection string format
- Check if IP is whitelisted (Neon allows all by default)

---

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | **Free** |
| Render | Free | **Free** (with spin-down) |
| Neon | Free | **Free** (0.5 GB storage) |
| **Total** | | **$0/month** |
