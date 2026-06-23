# HealthCare Management System — Redesigned

## Structure
- `frontend/` — React app (CRA)
- `backend/` — Node.js + Express server

## Setup

### Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI, JWT secret, Razorpay keys
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## What's Changed (UI/UX Redesign)
- **Removed** the old double navbar (Nav-bar-top + Nav-bar-bottom) from all pages
- **New Landing Page** — Modern hero layout with gradient background, auth card, stats bar
- **New User Dashboard** — Persistent left sidebar with navigation (Home, Appointments, Notifications, Chat)
- **New Doctor Dashboard** — Professional sidebar with quick-action cards
- **Appointments** — Clean table layout with status badges
- **Chat** — Two-panel chat UI (contacts list + message window)
- **Notifications** — Card-based with read/unread indicators
- All functionality (Razorpay, appointments, chat, auth) unchanged

## Ports
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
