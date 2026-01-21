# UPSC AI Application - Complete Flow Documentation

## 🚀 Application Startup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER OPENS BROWSER → http://localhost:3001                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ index.html (HTML Entry Point)                                   │
│ - Loads Tailwind CSS from CDN                                   │
│ - Creates <div id="root"> container                             │
│ - Imports <script src="/index.jsx">                             │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Vite Dev Server (vite.config.js)                                │
│ - Port: 3001 (localhost:3000 was in use)                        │
│ - Loads environment variables from .env file                    │
│ - Provides VITE_GEMINI_API_KEY to the app                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ index.jsx (React Entry Point)                                   │
│ 1. Imports React, ReactDOM, and App component                   │
│ 2. Gets root HTML element (#root)                               │
│ 3. Creates React root with ReactDOM.createRoot()                │
│ 4. Renders <App /> component                                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ App.jsx (Main App Component)                                    │
│ - Sets up HashRouter for client-side routing                    │
│ - Renders AIAssistant (floating chat widget)                    │
│ - Defines Routes with ProtectedRoute middleware                 │
│                                                                 │
│ Routes:                                                         │
│   /login → Login component (public)                             │
│   /      → Dashboard (protected)                                │
│   /scraper → NewsScraper (protected)                            │
│   /notes → SavedNotes (protected)                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼ (User not authenticated?)
┌─────────────────────────────────────────────────────────────────┐
│ Login.jsx Page                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 1. User enters email & password                              │ │
│ │ 2. Clicks "Sign In" or "Sign Up" button                      │ │
│ │ 3. authService.login() called                                │ │
│ │    - Sends POST to http://localhost:5000/api/auth/login      │ │
│ │    - Server validates credentials                            │ │
│ │    - Returns JWT token + user data                           │ │
│ │    - Stores in localStorage                                  │ │
│ │ 4. On success → Navigate to Dashboard (/)                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼ (User authenticated)
┌─────────────────────────────────────────────────────────────────┐
│ ProtectedRoute Middleware (App.jsx)                             │
│ - Checks authService.getStoredAuth()                            │
│ - If authenticated: Renders <Layout><Outlet /></Layout>         │
│ - If not: Redirects to /login                                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layout.jsx (Sidebar + Main Content)                             │
│ ┌──────────────────┐  ┌─────────────────────────────────────┐  │
│ │ Sidebar          │  │ Main Content Area {children}        │  │
│ │ ────────────────  │  │ ───────────────────────────────    │  │
│ │ • Dashboard      │  │                                     │  │
│ │ • News Scraper   │  │ Renders current page:               │  │
│ │ • Saved Notes    │  │ • Dashboard                         │  │
│ │ • Settings       │  │ • NewsScraper                       │  │
│ │ • Logout         │  │ • SavedNotes                        │  │
│ └──────────────────┘  └─────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┬──────────────┐
        │                    │              │
        ▼                    ▼              ▼
    Dashboard           NewsScraper      SavedNotes
    (Dashboard.jsx)     (NewsScraper.jsx) (SavedNotes.jsx)
```

---

## 📄 Page-by-Page Flow Details

### **1. Dashboard.jsx**
```
Flow:
  1. Component loads with useEffect
  2. Calls db.getNotes() - Gets user's saved notes
  3. Calls db.getRecentArticles() - Gets scraped articles
  4. Display recent articles & saved notes
  5. Optional: Generate daily digest with Gemini AI
```

### **2. NewsScraper.jsx**
```
Flow:
  1. User selects source (BBC, Reuters, etc.)
  2. User enters topic (Economy, Politics, etc.)
  3. Clicks "Scrape News" button
  4. Calls geminiService.fetchNewsViaAI()
     ├─ Uses Gemini 2.5 Flash model
     ├─ Sends prompt with source + topic
     └─ Returns 5 news articles as JSON
  5. For each article:
     ├─ User can click "Generate Notes"
     ├─ Calls geminiService.generateNoteFromContent()
     ├─ Analyzes for UPSC relevance
     ├─ Returns: GS Paper, MCQs, Mains Q&A
     └─ Saves to database via db.saveNote()
  6. Articles also saved via db.saveArticle()
```

### **3. SavedNotes.jsx**
```
Flow:
  1. Component loads
  2. Fetches all saved notes via db.getNotes()
  3. Displays notes with filters (GS Paper, Tags, etc.)
  4. User can:
     ├─ View note details
     ├─ Download as PDF (jspdf, html2canvas)
     ├─ Edit tags
     └─ Delete notes
```

### **4. AIAssistant.jsx (Floating Chat)**
```
Flow:
  1. Floating button appears on all pages (bottom-right)
  2. User clicks button to open chat
  3. Chat opens with welcome message
  4. User types UPSC question
  5. Calls geminiService with conversation history
  6. Gemini responds with expert UPSC guidance
  7. Chat continues with multi-turn conversation
```

---

## 🔧 Backend Server Flow (server.js)

```
┌──────────────────────────────────────┐
│ npm start / node server.js           │
│ Listens on http://localhost:5000     │
└──────────────────┬───────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
   Database    Express      Routes
   Connect     Setup        /api/*
```

### **Backend Routes**

**Authentication Routes:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login, returns JWT token

**Note Routes (Protected):**
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Save new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

**Article Routes (Protected):**
- `GET /api/articles` - Get scraped articles
- `POST /api/articles` - Save article

**Health Check:**
- `GET /api/health` - Server status

### **Fallback Logic**
- MongoDB tries to connect using `MONGODB_URI` from `.env`
- If connection fails → Uses in-memory storage (RAM)
- All routes work with both MongoDB & memory storage

---

## 📦 Service Layer

### **authService.js**
```
Functions:
  • getStoredAuth() → Returns stored token + user from localStorage
  • login(email, password) → Authenticates user, saves token
  • register(name, email, password) → Creates new account
  • logout() → Clears token, redirects to /login
```

### **dbService.js**
```
Functions:
  • getNotes() → Fetches user's saved notes
  • saveNote(note) → Saves analysis to database
  • getRecentArticles() → Gets scraped articles
  • saveArticle(article) → Stores scraped news
  
Fallback:
  • Tries backend API first (http://localhost:5000/api)
  • If fails → Uses localStorage
```

### **geminiService.js**
```
Functions:
  • fetchNewsViaAI(source, topic) → Scrapes news via Gemini
  • generateNoteFromContent(text, source) → Creates UPSC notes
  • generateDailyDigest(articles) → Creates summary digest
  
API: Google Gemini 2.5 Flash
Environment Variable: VITE_GEMINI_API_KEY (from .env file)
```

---

## 🎯 Component Hierarchy

```
<App>
├── <HashRouter>
│   ├── <AIAssistant /> (Floating Chat)
│   └── <Routes>
│       ├── /login → <Login />
│       └── <ProtectedRoute>
│           ├── / → <Layout><Dashboard /></Layout>
│           ├── /scraper → <Layout><NewsScraper /></Layout>
│           └── /notes → <Layout><SavedNotes /></Layout>
│
└── <Layout>
    ├── <Sidebar>
    │   ├── Navigation Links
    │   └── User Menu
    └── Main Content
        ├── <ArticleCard /> (in NewsScraper)
        ├── <NoteViewer /> (in SavedNotes)
        └── Other components
```

---

## 🔄 Data Flow Example: Scraping News

```
User Action: Clicks "Scrape News"
    ↓
NewsScraper.jsx calls handleScrape()
    ↓
Calls geminiService.fetchNewsViaAI("BBC", "Economy")
    ↓
Sends API request to Gemini model with prompt
    ↓
Gemini searches web for top 5 economy news from BBC
    ↓
Returns JSON with [title, summary, url, date]
    ↓
Articles displayed on screen
    ↓
User clicks "Generate Notes" on an article
    ↓
Calls geminiService.generateNoteFromContent(text, "BBC")
    ↓
Gemini analyzes: GS Paper, MCQs, Mains Q&A
    ↓
Returns structured UPSC study material
    ↓
User clicks "Save Note"
    ↓
Calls db.saveNote(noteData)
    ↓
Sends POST to /api/notes (backend)
    ↓
Backend stores in MongoDB (or memory)
    ↓
Success! Note saved
    ↓
Note appears in SavedNotes page
```

---

## 🌍 Environment Variables

**Required in `.env` file:**
```
VITE_GEMINI_API_KEY=your_google_ai_api_key_here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_jwt_secret_key
```

---

## 📱 Key Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7 |
| Build Tool | Vite 6.4 |
| Styling | Tailwind CSS |
| UI Icons | Lucide React |
| Backend | Express.js |
| Database | MongoDB (with fallback) |
| AI API | Google Gemini 2.5 Flash |
| Auth | JWT + localStorage |

---

## 🔐 Authentication Flow

```
1. User visits app
   ↓
2. App checks authService.getStoredAuth()
   ↓
3. Is token in localStorage?
   ├─ YES → Show Dashboard
   └─ NO → Show Login page
   ↓
4. User enters email/password
   ↓
5. Sends to POST /api/auth/login
   ↓
6. Server validates against database
   ↓
7. If valid:
   ├─ Generates JWT token
   ├─ Returns {token, user}
   ├─ Frontend saves to localStorage
   └─ Navigate to Dashboard
   ↓
8. On subsequent requests:
   ├─ Token sent in Authorization header
   ├─ Backend validates JWT
   ├─ User confirmed
   └─ Data returned
   ↓
9. On logout:
   ├─ Token removed from localStorage
   ├─ Redirect to /login
   └─ Session ends
```

---

## 🎪 File Structure Reference

```
civil-services-ai/
├── index.html          ← Browser entry point
├── index.jsx          ← React mount point
├── App.jsx            ← Main router & layout
├── .env               ← Environment variables
├── .env.local         ← Local secrets (not in git)
├── vite.config.js     ← Vite build config
├── server.js          ← Backend Express server
├── tsconfig.json      ← TypeScript config (unused in JS)
├── package.json       ← Dependencies
│
├── pages/
│   ├── Dashboard.jsx      ← Home page
│   ├── Login.jsx          ← Auth page
│   ├── NewsScraper.jsx    ← Scraping page
│   └── SavedNotes.jsx     ← Notes library
│
├── components/
│   ├── AIAssistant.jsx    ← Floating chat
│   ├── ArticleCard.jsx    ← News card
│   ├── Layout.jsx         ← Sidebar + main
│   └── NoteViewer.jsx     ← Note display
│
└── services/
    ├── authService.js     ← Auth logic
    ├── dbService.js       ← Database/API
    └── geminiService.js   ← AI integration
```

---

## ⚙️ Startup Checklist

✅ Vite dev server running: `npm run dev` (port 3001)
✅ Backend server running: `node server.js` (port 5000)
✅ `.env` file with VITE_GEMINI_API_KEY
✅ Browser opens http://localhost:3001
✅ Login or register with test account
✅ Dashboard loads with layout
✅ Try scraping news from NewsScraper page
✅ Chat works by clicking floating button
✅ Notes save to database/localStorage

