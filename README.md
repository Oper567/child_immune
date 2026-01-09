# 🛡️ ImmuniTrack: Centralized Vaccine Records

## 🚀 Quick Start
1. **Clone & Install:** `npm install`
2. **DB Setup:** Update `.env` in `packages/database` and run `npx prisma migrate dev`
3. **Run Backend:** `cd apps/server && npm run dev`
4. **Run Frontend:** `cd apps/web && npm run dev`

## 🏗️ Architecture
- **Next.js (App Router):** High-performance medical dashboards.
- **Express + Prisma:** Secure API for cross-clinic record access.
- **PostgreSQL:** ACID-compliant storage for patient safety.

## 🔐 Key Security Features
- **JWT Auth:** Role-based access for Health Workers and Admins.
- **UHID System:** Universal ID for continuity of care across facilities.