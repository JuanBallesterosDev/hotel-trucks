# 🚛 Hotel Trucks

A full-stack hotel management system built for a truck driver hotel in Colombia. Replaces a manual Excel process with a modern web application used by employees and the administrator.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS → Deployed on Vercel
- **Backend:** Node.js + Express → Deployed on Render
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcryptjs

## Features

### Worker Dashboard
- Real-time room map with occupancy indicators
- Check-in with instant client registration
- Consumption tracking per room
- Debt management with full client history
- Partial payments using a greedy algorithm (oldest debt first)
- Shift management (open/close with cash control)

### Admin Dashboard
- Full operations panel (same as worker)
- Employee management
- Room management
- Product catalog management
- Records with filters, search and date range
- Professional Excel report generator for the accountant (3 sheets: Summary, Transactions, Pending Debts)

## Architecture
hotel-trucks/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── routes/
│   └── index.js
└── frontend/
└── src/
├── api/
├── components/
├── context/
└── pages/

## Models

- **Room** — number, type (single/double/triple), price, status, soft delete
- **Client** — truck driver info (name, ID, phone, plate, email)
- **Employee** — staff with role-based access (worker/admin)
- **Record** — stay record with auto-calculated balance
- **Consumption** — product snapshot linked to record
- **Shift** — cash control per employee turn
- **Product** — store catalog

## Key Design Decisions

- No customer-facing portal — internal staff use only
- Soft delete on rooms and clients
- Product name snapshot on consumption (price changes don't affect history)
- Greedy algorithm for debt payments — oldest debt cleared first
- JWT stored in localStorage (phase 1)

## Getting Started
### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (backend)
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key

## Status
🚧 In development — deploy coming soon
