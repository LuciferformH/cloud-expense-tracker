# Cloud Expense Tracker

> A production-quality SaaS application for tracking cloud infrastructure costs with AI-powered optimization suggestions.

## Live Demo

- **Frontend**: https://cloud-expense-tracker.vercel.app
- **Backend API**: https://cloud-expense-tracker-api.onrender.com/api

## Features

- **Authentication**: Register, Login, JWT + Refresh Tokens, Password Reset
- **Expense Management**: CRUD operations with search, filter, sort, pagination
- **Budget Tracking**: Monthly budgets with configurable alert thresholds
- **Analytics Dashboard**: Interactive charts (line, bar, pie) with spending trends
- **Reports**: PDF and CSV export with date range selection
- **AI Insights**: Spending analysis, anomaly detection, cost optimization suggestions, forecasting
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS for styling
- React Query for data fetching/caching
- React Hook Form + Zod for forms/validation
- Recharts for visualizations
- React Router for navigation

### Backend
- Node.js + Express.js + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication (Access + Refresh tokens)
- bcrypt for password hashing
- Nodemailer for emails
- PDFKit + csv-stringify for reports

### Infrastructure
- Docker + Docker Compose
- GitHub Actions CI/CD
- PostgreSQL (Neon for production)

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/LuciferformH/cloud-expense-tracker.git
   cd cloud-expense-tracker
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```
   This starts PostgreSQL, backend, and frontend.

3. **Or set up manually:**

   **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your env vars
   npx prisma migrate dev
   npx ts-node prisma/seed.ts  # Seed demo data
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

### Demo Account
- Email: demo@cloudexpensetracker.com
- Password: Demo1234

## Project Structure

```
cloud-expense-tracker/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client & endpoints
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── store/         # Auth context
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helper functions
│   └── ...
├── backend/                # Express API
│   ├── src/
│   │   ├── config/        # Environment & DB config
│   │   ├── controllers/   # HTTP handlers
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Error, response, JWT, PDF
│   │   └── validators/    # Zod schemas for requests
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data script
│   └── ...
├── docker/                 # Docker configs
├── .github/workflows/     # CI/CD pipelines
├── docs/                  # Documentation
└── docker-compose.yml     # Dev orchestration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| GET | /api/expenses | List expenses (paginated) |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/budgets | List budgets |
| POST | /api/budgets | Create budget |
| PUT | /api/budgets/:id | Update budget |
| DELETE | /api/budgets/:id | Delete budget |
| GET | /api/analytics/dashboard | Dashboard summary |
| GET | /api/analytics | Analytics data |
| GET | /api/reports/export | Export PDF/CSV report |
| GET | /api/ai/suggestions | AI optimization suggestions |
| GET | /api/ai/forecast | Spending forecast |

## Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories.

## License

MIT
