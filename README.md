# ACommerce

Full-stack marketplace platform with a React frontend and an Express + Prisma backend.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Environment

Create `backend/.env` with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/acommerce
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=optional-for-ai-endpoints
NODE_ENV=development
ADMIN_DASHBOARD_EMAIL=secret@gmail.com
```

Create `.env.local` for frontend:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_DASHBOARD_EMAIL=secret@gmail.com
```

## Install

```bash
npm install
cd backend && npm install
```

## Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

## Run

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
npm run dev
```

## Build Checks

Frontend typecheck:

```bash
npx tsc --noEmit
```

Backend typecheck:

```bash
npx tsc --noEmit -p backend/tsconfig.json
```
