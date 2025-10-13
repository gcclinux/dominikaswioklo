# Therapy Site

A modern, responsive therapy practice website built with React, Vite, and React Router.

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

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

The site will be available at `http://localhost:5173/dominikaswioklo/`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

Live site: [https://gcclinux.github.io/dominikaswioklo/](https://gcclinux.github.io/dominikaswioklo/)

## Tech Stack

- React 19
- Vite 7
- React Router 7
- GitHub Pages
