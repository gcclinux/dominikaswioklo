import React, { useMemo, useRef, useState } from 'react';
import Modal from '../components/Modal';
import './Settings.css';
import './Documentation.css';
import emailSetupMd from './docs/EMAIL_SETUP.md?raw';

// Generate a slug for heading anchors
const slugify = (text = '') => text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// Parse simple Markdown-like content and build a TOC and enhanced nodes
const parseDocContent = (content) => {
  const lines = content.split('\n');
  const nodes = [];
  const toc = [];
  let key = 0;

  const renderInline = (text) => {
    // Links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      const [full, label, url] = match;
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      parts.push(<a key={`lnk-${key++}`} href={url} target="_blank" rel="noreferrer" className="doc-link">{label}</a>);
      lastIndex = match.index + full.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));

    // Bold **text** and inline code `code`
    const processBold = (arr) => arr.flatMap((segment, i) => {
      if (typeof segment !== 'string') return [segment];
      if (!segment.includes('**')) return [segment];
      const b = segment.split('**');
      return b.map((part, idx) => idx % 2 ? <strong key={`b-${key++}`} className="doc-strong">{part}</strong> : part);
    });

    const processCode = (arr) => arr.flatMap((segment, i) => {
      if (typeof segment !== 'string') return [segment];
      if (!segment.includes('`')) return [segment];
      const c = segment.split('`');
      return c.map((part, idx) => idx % 2 ? <code key={`cd-${key++}`} className="doc-inline-code">{part}</code> : part);
    });

    return processCode(processBold(parts));
  };

  const pushHeading = (level, text) => {
    const id = slugify(text);
    toc.push({ level, text, id });
    const Tag = `h${level}`;
    nodes.push(
      <Tag key={`h-${key++}`} id={id} className={`doc-h doc-h${level}`}>
        {renderInline(text)}
      </Tag>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/,'');

    if (line.startsWith('# ')) { pushHeading(1, line.substring(2)); continue; }
    if (line.startsWith('## ')) { pushHeading(2, line.substring(3)); continue; }
    if (line.startsWith('### ')) { pushHeading(3, line.substring(4)); continue; }

    // Blockquote
    if (line.startsWith('> ')) {
      const quotes = [line.substring(2)];
      while (i + 1 < lines.length && lines[i + 1].startsWith('> ')) { i++; quotes.push(lines[i].substring(2)); }
      nodes.push(<blockquote key={`q-${key++}`} className="doc-quote">{renderInline(quotes.join(' '))}</blockquote>);
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const language = line.replace('```','').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      const codeText = codeLines.join('\n');
      nodes.push(
        <div key={`cb-${key++}`} className="code-block">
          <button className="code-copy" onClick={() => navigator.clipboard?.writeText(codeText)}>Copy</button>
          <pre>
            <code className={language ? `lang-${language}` : undefined}>{codeText}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items = [line.substring(2)];
      while (i + 1 < lines.length && lines[i + 1].startsWith('- ')) { i++; items.push(lines[i].substring(2)); }
      nodes.push(
        <ul key={`ul-${key++}`} className="doc-ul">
          {items.map((it, idx) => <li key={`li-${key++}`}>{renderInline(it)}</li>)}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [line.replace(/^\d+\.\s/, '')];
      while (i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1])) { i++; items.push(lines[i].replace(/^\d+\.\s/, '')); }
      nodes.push(
        <ol key={`ol-${key++}`} className="doc-ol">
          {items.map((it) => <li key={`oli-${key++}`}>{renderInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    // Empty line spacer
    if (line.trim() === '') { nodes.push(<div key={`sp-${key++}`} className="doc-spacer" />); continue; }

    // Paragraph
    nodes.push(<p key={`p-${key++}`} className="doc-p">{renderInline(line)}</p>);
  }

  return { nodes, toc };
};

function Documentation({ onBack }) {
  const [activeDoc, setActiveDoc] = useState(null);
  const [query, setQuery] = useState('');
  const contentRef = useRef(null);

  const docs = [
    {
      id: 'mongo-setup',
      title: 'MongoDB Setup & Migration',
      icon: '🍃',
      color: '#10B981',
      tags: ['mongodb','database','migration','env','backend'],
      description: 'Use MongoDB instead of SQLite, test the connection, and migrate data.',
      content: `# MongoDB Setup & Migration

This project supports two database adapters: SQLite (default) and MongoDB. You can switch adapters via environment variables and use built-in scripts to test the connection and migrate data from SQLite to MongoDB.

## 🔧 How it works

- Adapter entrypoint: \`backend/src/database/index.ts\` selects the implementation based on \`DB_TYPE\`.
- SQLite init and queries remain under \`backend/src/database/init.ts\` and \`backend/src/database/queries.ts\`.
- Mongo init lives at \`backend/src/database/mongoInit.ts\`.
- Server startup (\`backend/src/server.ts\`) initializes the chosen adapter and reports it in \`GET /api/status\`.

## 🧩 Environment variables (.env in repo root)

Add or update the following keys in \`.env\` at the repository root:

\`\`\`env
# Database adapter selection: sqlite (default) | mongodb
DB_TYPE=sqlite

# MongoDB connection (required when DB_TYPE=mongodb)
MONGODB_URI=mongodb://admin:password@192.168.1.4:27017
MONGO_DB_NAME=easyscheduler
\`\`\`

Tips:
- If your Mongo credentials are in the \`admin\` database, append \`?authSource=admin\` to \`MONGODB_URI\`.
- Keep credentials secret. For public screenshots/logs, mask them.

## 📦 Packages (backend)

The backend already includes required packages in \`backend/package.json\`:
- \`mongodb\` (MongoDB driver)
- \`sqlite3\` (existing SQLite support)
- \`ts-node\` / \`ts-node-dev\` (script execution in TypeScript)

No extra installs are needed if you ran the root installer or backend install.

## ✅ Test Mongo connection

Use the included script to verify connectivity and list collection counts.

PowerShell:
\`\`\`powershell
npm run mongo:test --prefix ".\backend"
\`\`\`

What it does:
- Loads \`.env\`
- Connects using \`MONGODB_URI\` and \`MONGO_DB_NAME\`
- Prints existing collection counts
- Closes the connection cleanly

Output example:
\`\`\`
🔌 Connecting to MongoDB...
 → URI: mongodb://****@192.168.1.4:27017
 → DB : easyscheduler
✅ Connected. Found X collections.
 • users: 3
 • appointments: 11
 ...
\`\`\`

## 🔁 Migrate from SQLite to MongoDB

Run the migration script to copy all data (users, admins, appointments, settings, appointment types, blocked, email settings, licenses) from the SQLite DB to Mongo.

PowerShell:
\`\`\`powershell
npm run mongo:migrate --prefix ".\backend"
\`\`\`

Details:
- Reads \`DB_PATH\` from \`.env\` (defaults to \`./backend/database/scheduler.db\`)
- Upserts into Mongo collections, preserving original numeric IDs as fields (Mongo still assigns \`_id\`)
- Strips null/undefined fields on upsert to avoid unique index collisions (e.g., \`saleId=null\` in \`licenses\`)

## 🚀 Switch API to MongoDB

1) Set in \`.env\`:
\`\`\`env
DB_TYPE=mongodb
\`\`\`
2) Restart the backend.
3) Check \`GET /api/status\` — it should show \`database: "MongoDB"\`.

## 🧪 Useful commands

PowerShell:
\`\`\`powershell
# Build backend
npm run build --prefix ".\backend"

# Start backend in dev (stop any process already on port 5000)
npm run dev --prefix ".\backend"

# Test Mongo connection
npm run mongo:test --prefix ".\backend"

# Migrate all data from SQLite to MongoDB
npm run mongo:migrate --prefix ".\backend"
\`\`\`

## 🛠️ Troubleshooting

- Port 5000 already in use: stop the existing process or change \`PORT\` in \`.env\`.
- Auth error connecting to Mongo: ensure credentials are correct; add \`?authSource=admin\` if needed.
- Duplicate key error in \`licenses\`: migration strips null fields to avoid conflicts; re-run the migration.
- Network issues: verify that the Mongo server (192.168.1.4:27017) is reachable from this host and firewall rules allow access.

## 📁 Relevant files

- \`backend/src/database/index.ts\` — adapter selector (SQLite vs MongoDB)
- \`backend/src/database/mongoInit.ts\` — Mongo connection and index setup
- \`backend/src/database/testMongoConnection.ts\` — connection test script
- \`backend/src/database/migrateSqliteToMongo.ts\` — migration logic
- \`backend/src/server.ts\` — initializes the chosen DB and logs adapter on boot
`
    },
    { 
      id: 'admin-layout', 
      title: 'Admin Layout', 
      icon: '📊',
      color: '#4A90E2',
      tags: ['dashboard','overview','tiles'],
      description: 'Guide to the admin dashboard tiles and what each does.',
      content: `# Admin Dashboard Guide

Complete reference for all admin tiles and their functionality in the EasyScheduler admin dashboard.

## 📊 Main Dashboard Tiles

### ⚙️ Settings
**Description**: Configure system settings, working hours, availability, and messages
**What it does**: Central hub for all system configuration. Access various settings categories to customize how your scheduler operates.

### 👥 Users
**Description**: View and manage registered users and their appointments
**What it does**: 
- View all registered customers
- See user details (name, email, phone, registration date)
- Delete individual users
- Block users (prevents them from booking)
- View blocked status indicators
- Search and filter users

### 🚫 Blocked
**Description**: Manage blocked users and IP addresses
**What it does**:
- View all blocked entries (users, emails, IPs)
- See block reason and date added
- Remove entries from blocked list
- Prevent specific users or IPs from booking appointments

### 📅 Appointments
**Description**: View, confirm, and manage all appointments
**What it does**:
- View all appointments with status indicators
- Confirm pending appointments
- Cancel appointments
- Block appointments (and optionally block the user)
- Filter by pending-only appointments
- Hide blocked users from list
- Sort by date/time
- See appointment details (customer info, duration, status)

### 🔐 Admin
**Description**: Manage admin users and access controls
**What it does**:
- View all admin accounts
- Add new admin users
- Delete admin accounts
- Manage admin credentials
- Control dashboard access

### 🌐 Open Scheduler
**Description**: View the public appointment booking page
**What it does**: Opens the customer-facing scheduler in a new tab so you can see what customers see when booking appointments.

## ⚙️ Settings Sub-Tiles

### 📊 Customer Booking Limits
Set daily and weekly appointment limits per customer to prevent over-booking.

### 🕐 Working Days & Hours
Configure business start and end hours, enable/disable weekend bookings, and allow 30-minute appointments.

### 📅 Display Availability
Control how far ahead customers can see available slots (1-52 weeks).

### 🔒 Availability Lock
Temporarily disable all new bookings with optional automatic unlock date/time.

### 🧮 Appointments Filter
Control how many days of past and future appointments to show in admin lists.

### 💬 Header Message
Customize the calendar header message displayed to users (max 200 characters).

### 📧 Email Configuration
Configure SMTP settings for automated email notifications (confirmations, cancellations, reminders).

## 💡 Best Practices

1. **Set reasonable booking limits** - Prevent customers from monopolizing slots
2. **Configure working hours accurately** - Matches your actual availability
3. **Use availability lock** - For holidays or planned downtime
4. **Keep header messages current** - Communicate important updates
5. **Test email settings** - Ensure customers receive confirmations
6. **Review blocked list regularly** - Remove entries when appropriate
7. **Monitor appointments daily** - Confirm pending bookings promptly`
    },
    { 
      id: 'admin-features', 
      title: 'Admin Features', 
      icon: '🔐',
      color: '#50C878',
      tags: ['admin','security','management'],
      description: 'Complete feature set available to administrators.',
      content: `# Admin Features

## Overview
Admin panel provides comprehensive management tools for controlling appointments, users, settings, and system configuration.

## Authentication
- Secure login system with bcrypt password hashing
- Session-based authentication
- Protected admin routes

## Core Admin Features

### 1. Appointment Management
- View all appointments with user details
- Filter appointments by date range, status, and user information
- Confirm pending appointments
- Cancel appointments
- View appointment history
- Export appointment data

### 2. User Management
- View all registered users
- Search users by name or email
- View user appointment history
- Block/unblock users
- Track user IP addresses

### 3. Blocked List Management
- Block users by IP address
- Add block reason/notes
- View all blocked IPs
- Unblock users
- Prevent abuse and spam

### 4. Settings Configuration

#### Business Hours
- Set opening hour (0-23)
- Set closing hour (0-23)
- Define available appointment times

#### Appointment Limits
- Maximum appointments per day
- Maximum appointments per week
- Control booking capacity

#### Availability Display
- Configure weeks ahead to display (1-52)
- Control customer booking window

#### Availability Lock
- Global availability lock toggle
- Lock availability until specific date
- Prevent bookings during maintenance or holidays

#### Header Message
- Customize calendar header text
- Maximum 200 characters
- Personalize customer experience

### 5. Appointment Types Management
- Create and manage appointment types
- Define appointment names and tags
- Set pricing for each appointment type
- Configure global currency for all appointments
- Direct booking via URL parameters (e.g., http://localhost:3000/?appTag=massage)

### 6. Email Settings
- Configure SMTP server settings
- Set sender email address
- Customize email templates
- Test email configuration
- Manage notification preferences

### 7. Admin Account Management
- Create new admin accounts
- Update admin information
- Change admin passwords
- Delete admin accounts
- View admin activity

## Security Features
- Password hashing with bcrypt
- Protected API endpoints
- Input validation
- Rate limiting
- IP tracking and blocking
- Secure session management`
    },
    { 
      id: 'setup', 
      title: 'Setup', 
      icon: '⚙️',
      color: '#9B59B6',
      tags: ['install','environment','quickstart'],
      description: 'Install, configure, and run EasyScheduler locally.',
      content: `# Setup Guide

Complete installation and setup instructions for EasyScheduler.

## 📋 Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd EasyScheduler
\`\`\`

### 2. Install All Dependencies
\`\`\`bash
npm run install:all
\`\`\`

### 3. Configure Environment Variables
Create a \`.env\` file in the project root directory:
\`\`\`env
PORT=5000
NODE_ENV=development
API_BASE_URL=http://localhost:5000
DB_PATH=./database/scheduler.db
JWT_SECRET=your-super-secret-jwt-key-change-this
PREMIUM_FEATURES_PURCHASE_URL=https://gumroad.com/your-product
VITE_ADMIN_DEV_MODE=false
\`\`\`

### 4. Initialize the Database
\`\`\`bash
npm run db:init
\`\`\`

### 5. Start Development Servers
\`\`\`bash
npm run dev
\`\`\`

This will start:
- **Backend API**: http://localhost:5000
- **Frontend UI**: http://localhost:3000

## 📦 Available Scripts

### Installation
\`\`\`bash
npm run install:all
\`\`\`

### Development
\`\`\`bash
npm run dev              # Run frontend and backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only
\`\`\`

### Production Build
\`\`\`bash
npm run build            # Build both
npm run build:frontend   # Frontend only
npm run build:backend    # Backend only
\`\`\`

### Production Start
\`\`\`bash
npm start                # Start backend
npm run start:prod       # Start with NODE_ENV=production
\`\`\`

### Database
\`\`\`bash
npm run db:init          # Initialize database
\`\`\`

## 🔐 First Admin Setup

On first run:
1. Navigate to http://localhost:3000
2. You'll see "First Time Setup" screen
3. Create your admin account
4. You'll be auto-logged into the admin dashboard

## 🆘 Troubleshooting

### Port Already in Use
Change PORT in .env file

### Database Errors
\`\`\`bash
rm backend/database/scheduler.db
npm run db:init
\`\`\`

### Module Not Found
\`\`\`bash
npm run install:all
\`\`\``
    },
    { 
      id: 'customer-features', 
      title: 'Customer Features', 
      icon: '👥',
      color: '#E74C3C',
      tags: ['customer','booking','ui'],
      description: 'What customers see and can do while booking.',
      content: `# Customer Features

## Overview
EasyScheduler provides a simple, intuitive interface for customers to book appointments without requiring an account or login.

## Core Features

### 1. Weekly Calendar View
- Visual weekly calendar displaying available time slots
- Navigate between weeks to find suitable appointment times
- Color-coded availability indicators
- Real-time availability updates

### 2. Appointment Booking
- Select date and time from available slots
- One-hour appointment duration
- Provide personal information:
  - First name (required)
  - Middle name (optional)
  - Last name (required)
  - Email address (required)
  - Phone number (optional)

### 3. Appointment Management
- Receive confirmation via email
- View appointment details
- Cancel appointments if needed
- Unique appointment identifier (UUID) for tracking

### 4. User-Friendly Interface
- Clean, modern design
- Mobile-responsive layout
- Easy navigation
- Clear error messages and validation
- No account creation required

### 5. Availability Display
- Shows available time slots based on business hours
- Respects maximum appointments per day/week limits
- Displays locked availability periods
- Configurable weeks ahead visibility

## Booking Process

1. Click "Schedule Appointment" button
2. Navigate to desired week
3. Select available time slot
4. Fill in personal information
5. Submit appointment request
6. Receive confirmation

## Restrictions

- Maximum appointments per day (configurable by admin)
- Maximum appointments per week (configurable by admin)
- Business hours constraints
- IP-based rate limiting for abuse prevention
- Blocked users cannot book appointments`
    },
    { 
      id: 'license', 
      title: 'License', 
      icon: '📜',
      color: '#16A085',
      tags: ['legal','terms','premium'],
      description: 'EasyEdit Scheduler Community License (EESCL).',
      content: `# EasyEdit Scheduler Community License (EESCL) v1.0

Copyright (c) 2024-present Ricardo Wagemaker (gcclinux) and contributors

> Summary: Free to use with optional premium features. Email notifications, admin access via mobile device, and branding removal require a lifetime license. See the admin panel for upgrade options.

## 1. Definitions
- **Software** means the EasyEdit Scheduler project and all accompanying source code, configuration, templates, and assets distributed in this repository.
- **Free Features** means all functionality available without a license key as shipped in the Software by default.
- **Premium Features** means functionality that requires a lifetime license to enable, including: (i) Email notifications, (ii) Admin access via mobile device, and (iii) Branding removal.
- **You** means any individual or legal entity exercising permissions granted by this license.

## 2. License Grant (Free Features)
Subject to the terms below, You are granted a perpetual, worldwide, non-exclusive, royalty-free license to:
- use, run, and self-host the Software,
- copy and modify the Software,
- create derivative works, and
- deploy the Software for personal or commercial use,

in each case only with Free Features enabled.

## 3. Premium Features and Licensing
- Premium Features require a valid lifetime license. See the admin panel for upgrade options.
- You must not bypass, remove, or circumvent any technical or product measures that control or limit access to Premium Features.
- If You distribute or deploy the Software with Premium Features enabled, each running instance must be properly licensed.

## 4. Branding
- Unless You obtain a lifetime license that includes branding removal, You must retain the original EasyEdit Scheduler branding and notices in user interfaces and documentation.

## 5. Redistribution
You may redistribute the Software (source or binary) provided that You:
- include this license text with any distribution, and
- clearly indicate any changes You make.

Redistribution of Premium Features in an enabled or unlocked state without a valid license is prohibited.

## 6. Trademarks
This license does not grant permission to use the EasyEdit Scheduler name, logos, or trademarks except as required for reasonable and customary use in describing the origin of the Software and reproducing the content of the user interface as provided.

## 7. No Warranty
THE SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE SOFTWARE IS WITH YOU.

## 8. Limitation of Liability
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## 9. Termination
This license automatically terminates if You breach any terms. Upon termination You must cease using the Premium Features and, if directed, cease using and distributing the Software. Sections 6–8 survive termination.

## 10. Miscellaneous
Nothing in this license restricts You from purchasing a lifetime license to enable Premium Features. Operational details and purchasing options are provided in the admin panel.

For questions, feature licensing, or commercial arrangements, please open an issue on GitHub or contact the project maintainers.`
    },
    { 
      id: 'api-routes', 
      title: 'API Routes', 
      icon: '🔌',
      color: '#F39C12',
      tags: ['api','backend','endpoints'],
      description: 'REST endpoints, auth requirements, and formats.',
      content: `# API Routes

## Base URL
\`\`\`
http://localhost:5000
\`\`\`

## Authentication
The API uses JWT (JSON Web Token) authentication for protected routes.

### Public Routes (No Authentication)
- \`GET /api/health\` - Health check
- \`GET /api/status\` - Status check
- \`GET /api/appointments/date/:date\` - View available slots
- \`POST /api/appointments\` - Create appointment
- \`GET /api/settings\` - Get system settings
- \`GET /api/license\` - Get license info
- \`GET /api/admins/check\` - Check if admin exists
- \`POST /api/admins/login\` - Admin login

### Protected Routes
All other routes require JWT token in Authorization header:
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## Response Format
\`\`\`json
{
  "success": true|false,
  "data": {},
  "message": "string",
  "error": "string"
}
\`\`\`

## Appointments

### GET \`/api/appointments\`
Get all appointments with user information.

### POST \`/api/appointments\`
Create new appointment.

**Request Body:**
\`\`\`json
{
  "date": "2025-10-15",
  "timeStart": "09:00",
  "timeEnd": "10:00",
  "appTag": "consultation",
  "user": {
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
\`\`\`

### PUT \`/api/appointments/:id/confirm\`
Confirm appointment by ID.

### PUT \`/api/appointments/:id/cancel\`
Cancel appointment by ID.

## Users

### GET \`/api/users\`
Get all users.

### POST \`/api/users\`
Create new user.

### DELETE \`/api/users/:id\`
Delete user by ID.

## Settings

### GET \`/api/settings\`
Get current application settings.

### PUT \`/api/settings\`
Update settings (partial updates supported).

## Admin

### GET \`/api/admins\`
Get all admin users.

### POST \`/api/admins\`
Create new admin.

### DELETE \`/api/admins/:aid\`
Delete admin by ID.

### POST \`/api/admins/login\`
Admin login endpoint.

## Blocked IPs

### GET \`/api/blocked\`
Get all blocked IP addresses.

### POST \`/api/blocked\`
Block an IP address.

### DELETE \`/api/blocked/:bid\`
Unblock an IP address.

## License

### GET \`/api/license\`
Get license information.

### POST \`/api/license/activate\`
Activate premium license.

## Error Responses

- **400** Bad Request - Invalid request
- **401** Unauthorized - Authentication required
- **403** Forbidden - Access denied
- **404** Not Found - Resource not found
- **409** Conflict - Resource already exists
- **500** Internal Server Error

## Rate Limiting
- General API: Rate limited
- Appointments: Additional rate limiting
- Users: Additional rate limiting`
    },
    {
      id: 'email-setup',
      title: 'Email Setup',
      icon: '📧',
      color: '#2563EB',
      tags: ['email','smtp','notifications'],
      description: 'Configure SMTP and templates for admin and user notifications.',
      content: emailSetupMd
    }
  ];

  const tiles = useMemo(() => docs.map(doc => ({
    ...doc,
    onClick: () => setActiveDoc(doc)
  })), [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tiles;
    return tiles.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [tiles, query]);

  return (
    <div className="settings-container">
      <header className="settings-header docs-header">
        <div className="docs-header-left">
          <button onClick={onBack} className="back-button">← Back to Dashboard</button>
          <div>
            <h1>📚 Documentation</h1>
            <p className="settings-subtitle">Search, browse, and learn how to use EasyScheduler</p>
          </div>
        </div>
        <div className="docs-search">
          <input
            type="search"
            placeholder="Search topics, e.g. appointments, email, setup…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>
      <main className="settings-main">
        <div className="docs-grid">
          {filtered.map((tile) => (
            <div 
              key={tile.id} 
              className="doc-card" 
              style={{ '--doc-color': tile.color }} 
              onClick={tile.onClick}
            >
              <div className="doc-card-top">
                <div className="doc-card-icon">{tile.icon}</div>
                <div className="doc-card-body">
                  <h3 className="doc-card-title">{tile.title}</h3>
                  {tile.description && <p className="doc-card-desc">{tile.description}</p>}
                  {tile.tags?.length ? (
                    <div className="doc-card-tags">
                      {tile.tags.map((tg) => <span key={tg} className="doc-tag">#{tg}</span>)}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="doc-card-footer">
                <span className="doc-card-cta">Open →</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {activeDoc && (
        <Modal 
          isOpen={!!activeDoc} 
          onClose={() => setActiveDoc(null)} 
          title={`${activeDoc.icon} ${activeDoc.title}`}
          maxWidth="1100px"
          maxHeight="90vh"
        >
          <div className="doc-modal">
            <aside className="doc-toc">
              <h4>On this page</h4>
              <DocTOC content={activeDoc.content} contentRef={contentRef} />
            </aside>
            <article className="doc-article" ref={contentRef}>
              <DocBody content={activeDoc.content} />
            </article>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Documentation;

// Separate components using the parser above
const DocBody = ({ content }) => {
  const parsed = useMemo(() => parseDocContent(content), [content]);
  return (
    <div className="doc-content">
      {parsed.nodes}
      <footer className="doc-footer">
        <span>Last updated: {new Date().toLocaleDateString()}</span>
      </footer>
    </div>
  );
};

const DocTOC = ({ content, contentRef }) => {
  const toc = useMemo(() => parseDocContent(content).toc, [content]);
  const onClick = (id) => {
    const root = contentRef?.current;
    const target = root?.querySelector(`#${id}`);
    if (target && root) {
      const top = target.offsetTop - 8;
      root.scrollTo({ top, behavior: 'smooth' });
    }
  };
  return (
    <ul className="doc-toc-list">
      {toc.map((t) => (
        <li key={`${t.id}`} className={`toc-item level-${t.level}`}>
          <button onClick={() => onClick(t.id)} title={t.text}>{t.text}</button>
        </li>
      ))}
    </ul>
  );
};
