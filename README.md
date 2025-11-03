# Therapy Site

A modern, responsive therapy practice website with appointment scheduling built with React, Vite, and React Router.

## Project Structure

```
├── frontend/          # Main website (port 5173)
│   ├── src/          # Main site source code
│   │   └── admin/    # Admin panel (integrated)
│   └── admin/        # Legacy admin (deprecated)
└── backend/          # API server (port 5000)
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### Installing Node.js with NVM (Recommended)

**macOS/Linux:**
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc  # or ~/.zshrc

# Install Node.js
nvm install 20
nvm use 20
```

**Windows:**
- Download [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
- Install and run:
```bash
nvm install 20
nvm use 20
```

**Alternative:** Download Node.js directly from [nodejs.org](https://nodejs.org/)

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/gcclinux/dominikaswioklo.git
cd dominikaswioklo
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Initialize database (first time only)
```bash
npm run db:init
```

### 4. Start all development servers
```bash
npm run dev
```

This will start:
- Frontend: `http://localhost:5173`
- Admin Panel: `http://localhost:5173/#/admin`
- Scheduler: `http://localhost:5173/#/easyscheduler`
- Backend API: `http://localhost:5000`

## Routing Structure

### Main Site (with Navbar)
- Home: `http://localhost:5173/#/`
- Prices: `http://localhost:5173/#/prices`
- About: `http://localhost:5173/#/about`
- Contact: `http://localhost:5173/#/contact`
- Appointment: `http://localhost:5173/#/appointment`

### Admin Panel (no Navbar)
- Dashboard: `http://localhost:5173/#/admin` → `frontend/src/admin/AdminApp.jsx`
- Settings: `http://localhost:5173/#/admin/settings` → `frontend/src/admin/pages/Settings.jsx`
- Documentation: `http://localhost:5173/#/admin/documentation` → `frontend/src/admin/pages/Documentation.jsx`

### Scheduler (no Navbar)
- Scheduler: `http://localhost:5173/#/easyscheduler` → `frontend/src/components/WeeklyScheduler.jsx`

## Available Scripts

- `npm run dev` - Start all servers (frontend + backend)
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run build` - Build frontend for production
- `npm run db:init` - Initialize database
- `npm run install:all` - Install dependencies for all projects
- `npm run lint` - Run ESLint

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

Live site: [https://gcclinux.github.io/dominikaswioklo/](https://gcclinux.github.io/dominikaswioklo/)

## Tech Stack

### Frontend
- React 19
- Vite 7
- React Router 7

### Backend
- Node.js
- Express
- SQLite
- TypeScript

### Admin Panel
- React 18
- Vite 5
- React Router 6
