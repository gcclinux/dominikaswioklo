# Therapy Site

A modern, responsive therapy practice website with appointment scheduling built with React, Vite, and React Router.

## Project Structure

```
├── frontend/                    # Main website (port 5173)
│   ├── src/                    # Main site source code
│   │   ├── admin/              # Admin panel (integrated)
│   │   │   ├── components/     # Admin UI components
│   │   │   ├── pages/          # Settings, Documentation
│   │   │   └── utils/          # API helpers
│   │   ├── components/         # Shared components (Navbar, Scheduler)
│   │   ├── pages_en/           # English pages
│   │   ├── pages_pl/           # Polish pages
│   │   ├── context/            # React context (Language)
│   │   └── config/             # API configuration
│   ├── admin/                  # Legacy admin (deprecated)
│   ├── public/                 # Static assets
│   ├── index.html              # HTML entry point
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
├── backend/                     # API server (port 5000)
│   ├── src/
│   │   ├── database/           # Database queries and init
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, rate limiting
│   │   ├── services/           # Business logic
│   │   ├── types/              # TypeScript types
│   │   └── server.ts           # Express server
│   ├── database/
│   │   └── scheduler.db        # SQLite database (created on init)
│   ├── package.json            # Backend dependencies
│   └── tsconfig.json           # TypeScript configuration
├── .env                         # Environment variables (create from .env.example)
├── .env.example                # Example environment configuration
├── package.json                # Root scripts
└── README.md                   # This file
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

**Clone the easyscheduler branch:**

```bash
git clone -b easyscheduler https://github.com/gcclinux/dominikaswioklo.git
cd dominikaswioklo
```

**Or clone and switch to the branch:**

```bash
git clone https://github.com/gcclinux/dominikaswioklo.git
cd dominikaswioklo
git checkout easyscheduler
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# API Base URL
VITE_API_BASE_URL=http://localhost:5000

# Database
DB_PATH=./backend/database/scheduler.db
DB_TYPE=sqlite

# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=change-this-to-a-strong-random-secret-in-production

# Admin Dev Mode (bypass authentication)
VITE_ADMIN_DEV_MODE=false

# Premium Features
PREMIUM_FEATURES_PURCHASE_URL=https://gumroad.com/easyscheduler
PREMIUM_FEATURES_ENCRYPTION=easyscheduler-has-additional-key

# MongoDB (only if DB_TYPE=mongodb)
MONGODB_URI=mongodb://admin_user:user_password@host_id:27017
MONGO_DB_NAME=easyscheduler
```

### 3. Install all dependencies
```bash
npm run install:all
```

This installs dependencies for root, frontend, and backend.

### 4. Initialize database (first time only)
```bash
npm run db:init
```

This creates the SQLite database with all required tables.

### 5. Start all development servers
```bash
npm run dev
```

This will start:
- **Frontend**: `http://localhost:5173`
- **Admin Panel**: `http://localhost:5173/#/admin`
- **Scheduler**: `http://localhost:5173/#/easyscheduler`
- **Backend API**: `http://localhost:5000`

### 6. First Time Admin Setup

Navigate to: `http://localhost:5173/#/admin`

You'll be prompted to create the first admin account:
- First Name
- Last Name  
- Email
- Username
- Password

### 7. Configure Your Site

After logging in, configure:

**Settings → Header Message**
- Set your site title/name (appears in navbar and browser tab)

**Settings → Site Theme**
- Choose between Purple Gradient or Dark Green theme

**Settings → Appointment Details**
- Create appointment types with:
  - Name, Duration, Price, Currency
  - Language (EN/PL)
  - Description and Features
- These automatically appear on the Prices page

**Settings → Working Days & Hours**
- Configure business hours and weekend availability

**Settings → Customer Booking Limits**
- Set daily and weekly appointment limits

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
