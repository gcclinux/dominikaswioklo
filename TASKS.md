# TASKS: Dynamic About Details Feature

## Overview
Create a new "About Details" admin tile that allows updating the About page sections through a form. This involves adding a database table, API routes, admin form component with localization, and updating the About pages to fetch dynamic content.

---

## Tasks

### 1. Database Table Creation
**File:** `backend/src/database/init.ts`

- [ ] Create `about_sections` table with fields:
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `sectionKey` TEXT NOT NULL (e.g., 'header', 'intro', 'approach', 'expertise', 'personal')
  - `language` TEXT NOT NULL ('en' or 'pl')
  - `title` TEXT
  - `body` TEXT (HTML string)
  - `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
  - `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP
- [ ] Add UNIQUE constraint on (sectionKey, language) combination

---

### 2. Database Queries
**File:** `backend/src/database/queries.ts`

- [ ] Add `getAboutSections()` - fetch all sections
- [ ] Add `getAboutSectionsByLanguage(language: string)` - fetch sections for specific language
- [ ] Add `getAboutSection(sectionKey: string, language: string)` - fetch single section
- [ ] Add `upsertAboutSection(section)` - create or update a section
- [ ] Add `deleteAboutSection(id: number)` - delete a section

---

### 3. API Routes
**File:** `backend/src/routes/about.ts` (new file)

- [ ] Create Express router
- [ ] GET `/api/about` - public, fetch all sections
- [ ] GET `/api/about/:language` - public, fetch sections by language
- [ ] PUT `/api/about` - protected, upsert section (requires admin auth)
- [ ] DELETE `/api/about/:id` - protected, delete section

**File:** `backend/src/server.ts`

- [ ] Import and register about routes

---

### 4. Translation Files
**File:** `frontend/admin/public/locales/en/translation.json`

- [ ] Add `aboutDetails` tile title and description under `settings.tiles`
- [ ] Add form labels: section names, title field, body field, save/cancel buttons
- [ ] Add success/error messages

**File:** `frontend/admin/public/locales/pl/translation.json`

- [ ] Add Polish translations for all above keys

---

### 5. Editor Component
**File:** `frontend/src/admin/components/AboutDetailsEditor.jsx` (new file)

- [ ] Create form with language tabs (EN / PL)
- [ ] For each section (header, intro, approach, expertise, personal):
  - [ ] Title input field
  - [ ] Body textarea (accepts HTML)
- [ ] Fetch existing content on mount
- [ ] Save button calls API to upsert
- [ ] Show success/error toast notifications

---

### 6. Modal Components
**File:** `frontend/src/admin/components/modals/AboutDetailsModalDesktop.jsx` (new file)

- [ ] Create modal wrapper using base Modal component
- [ ] Embed AboutDetailsEditor component

**File:** `frontend/src/admin/components/modals/AboutDetailsModalMobile.jsx` (new file)

- [ ] Create mobile-friendly modal version

**File:** `frontend/src/admin/components/modals/index.js`

- [ ] Export new modal components

---

### 7. Settings Page Update
**File:** `frontend/src/admin/pages/Settings.jsx`

- [ ] Add new tile config to `settingsTiles` array:
  ```javascript
  { 
    id: 'aboutDetails', 
    title: t('settings.tiles.aboutDetails.title'), 
    description: t('settings.tiles.aboutDetails.description'), 
    icon: 'ℹ️', 
    color: '#9b59b6' 
  }