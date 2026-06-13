# 📚 URL Shortener with Analytics — Full Project Documentation

> **Scope:** This document covers the complete project structure, all dependency versions, and a file-by-file reference guide. No source code has been modified.

---

## 📦 Dependency Versions

### Backend (`backend/package.json`)

| Package | Version | Role |
|---|---|---|
| `express` | `^4.18.2` | HTTP server & REST API framework |
| `mongoose` | `^8.0.0` | MongoDB ODM — schema definition & DB queries |
| `jsonwebtoken` | `^9.0.2` | JWT generation & verification |
| `bcryptjs` | `^2.4.3` | Password hashing & comparison |
| `cors` | `^2.8.5` | Cross-Origin Resource Sharing middleware |
| `dotenv` | `^16.3.1` | Environment variable loader |
| `nanoid` | `^3.3.4` | Unique short code generator |
| `express-useragent` | `^1.0.15` | Parses User-Agent strings for analytics |
| `express-validator` | `^7.0.1` | Request data validation |
| `express-rate-limit` | `^7.1.0` | Brute force & DDoS protection |
| `helmet` | `^7.1.0` | Security headers middleware |

**Dev Dependencies:**
| Package | Version | Role |
|---|---|---|
| `nodemon` | `^3.0.1` | Dev server auto-restart on file changes |

**Node.js Runtime:** v18.x or v20.x (recommended)
**Entry point:** `server.js`
**Dev command:** `npm run dev` → runs `nodemon src/server.js`
**Prod command:** `npm start` → runs `node src/server.js`

---

### Frontend (`frontend/package.json`)

| Package | Version | Role |
|---|---|---|
| `react` | `^18.2.0` | Core UI library |
| `react-dom` | `^18.2.0` | React DOM renderer |
| `react-router-dom` | `^6.20.0` | Client-side routing (SPA navigation) |
| `axios` | `^1.6.2` | HTTP client for REST API calls |
| `recharts` | `^2.10.3` | Data visualization charts |
| `lucide-react` | `^0.292.0` | Icon library (SVG icons as React components) |
| `qrcode.react` | `^3.1.0` | QR Code generator for short links |
| `tailwind-merge` | `^2.0.0` | Safely merges Tailwind class strings |
| `clsx` | `^2.0.0` | Utility for conditional className joining |
| `date-fns` | `^2.30.0` | Date formatting and manipulation |

**Dev Dependencies:**

| Package | Version | Role |
|---|---|---|
| `vite` | `^5.0.0` | Build tool & dev server |
| `@vitejs/plugin-react` | `^4.2.0` | Vite plugin for React/JSX |
| `tailwindcss` | `^3.3.5` | Utility-first CSS framework |
| `postcss` | `^8.4.31` | CSS post-processor (required by Tailwind) |
| `autoprefixer` | `^10.4.16` | Auto-adds CSS vendor prefixes |

**Dev command:** `npm run dev` → `vite` (local dev at `http://localhost:5173`)

---

## 🗂️ Complete File Structure

```
url-shortener-analytics/
│
├── 📄 README.md                        # Project overview & setup guide
├── 📄 DOCUMENTATION.md                 # This file — full project reference
├── 📄 IMPLEMENTATION.md                # Step-by-step build guide
│
├── 📁 backend/                         # Node.js + Express server
│   ├── 📄 .env                         # Environment secrets (not committed)
│   ├── 📄 package.json                 # Backend dependencies
│   │
│   └── 📁 src/
│       ├── 📄 server.js                # App entry point (DB connect & listen)
│       ├── 📄 app.js                   # Express app setup & middleware
│       │
│       ├── 📁 models/
│       │   ├── 📄 User.js              # Mongoose schema: User
│       │   ├── 📄 Url.js               # Mongoose schema: Shortened URL
│       │   └── 📄 Analytics.js         # Mongoose schema: Visit record
│       │
│       ├── 📁 routes/
│       │   ├── 📄 auth.js              # Auth API routes (register, login, me)
│       │   ├── 📄 url.js               # URL API routes (create, get, delete)
│       │   ├── 📄 analytics.js         # Analytics API routes (fetch stats)
│       │   └── 📄 redirect.js          # Short link redirection route
│       │
│       ├── 📁 controllers/
│       │   ├── 📄 auth.js              # Auth logic
│       │   ├── 📄 url.js               # URL CRUD logic
│       │   ├── 📄 analytics.js         # Aggregation logic
│       │   └── 📄 redirect.js          # Core redirect & tracking engine
│       │
│       ├── 📁 middleware/
│       │   ├── 📄 auth.js              # JWT verification
│       │   ├── 📄 rateLimiter.js       # Express rate limiter config
│       │   └── 📄 errorHandler.js      # Global error & Mongo error formatter
│       │
│       ├── 📁 services/                # Business logic & DB queries
│       │   ├── 📄 authService.js
│       │   ├── 📄 urlService.js
│       │   └── 📄 analyticsService.js
│       │
│       └── 📁 utils/
│           └── 📄 generateShortCode.js # NanoID collision handler
│
└── 📁 frontend/                        # React SPA (Vite)
    ├── 📄 index.html                   # HTML entry point
    ├── 📄 package.json                 # Frontend dependencies
    ├── 📄 tailwind.config.js           # Tailwind theme config
    │
    └── 📁 src/
        ├── 📄 main.jsx                 # React DOM root render
        ├── 📄 App.jsx                  # Root router wrapper
        ├── 📄 AppRoutes.jsx            # Route definitions
        ├── 📄 index.css                # Global styles + Tailwind directives
        │
        ├── 📁 context/
        │   └── 📄 AuthContext.jsx      # Global auth state
        │
        ├── 📁 hooks/
        │   ├── 📄 useAuth.js           # Auth state accessor
        │   ├── 📄 useUrls.js           # URL data fetching & state
        │   └── 📄 useAnalytics.js      # Analytics fetching hook
        │
        ├── 📁 services/
        │   ├── 📄 api.js               # Axios instance with interceptors
        │   ├── 📄 authService.js       # Auth API calls
        │   ├── 📄 urlService.js        # URL API calls
        │   └── 📄 analyticsService.js  # Analytics API calls
        │
        ├── 📁 components/
        │   ├── 📄 Navbar.jsx           # Top navigation bar
        │   ├── 📄 Loader.jsx           # Global spinner component
        │   ├── 📄 ProtectedRoute.jsx   # Route guard for Auth
        │   ├── 📄 CreateUrlForm.jsx    # Input form for shortening
        │   ├── 📄 UrlCard.jsx          # Individual URL display component
        │   ├── 📄 CopyButton.jsx       # Clipboard utility component
        │   ├── 📄 QrModal.jsx          # QR code rendering modal
        │   ├── 📄 ClickChart.jsx       # Recharts time-series chart
        │   └── 📄 VisitHistory.jsx     # Tabular recent visits view
        │
        └── 📁 pages/
            ├── 📄 Landing.jsx          # Public hero page
            ├── 📄 Login.jsx            # Login form page
            ├── 📄 Signup.jsx           # Registration form page
            ├── 📄 Dashboard.jsx        # Main URL list & creation
            ├── 📄 Analytics.jsx        # Detailed charts per URL
            └── 📄 NotFound.jsx         # 404 fallback
```

---

## 🔒 Backend — File Reference

---

### `backend/.env`

Environment configuration file. **Never commit to version control.**

| Variable | Example Value | Description |
|---|---|---|
| `PORT` | `5000` | Port on which the Express server listens |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `your_secret_key` | Secret used to sign/verify JSON Web Tokens |
| `BASE_URL` | `http://localhost:5000` | Backend domain, used for constructing short URLs |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |

---

### `backend/src/server.js` & `app.js`

**Role:** Application initialization and HTTP server.

**`app.js` Key Responsibilities:**
- Configures security (`helmet`) and `cors`.
- Injects `express.json()` and `express-useragent.express()`.
- Mounts all API routes (`/api/auth`, `/api/urls`, `/api/analytics`).
- Mounts the catch-all redirect route (`/`) at the very end.
- Attaches the global `errorHandler`.

**`server.js` Key Responsibilities:**
- Connects to MongoDB.
- Starts the `app.listen()` HTTP server once the DB is ready.

---

### `backend/src/models/Url.js`

**Role:** Mongoose schema for Shortened URLs.

**Schema Fields:**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `userId` | ObjectId | ✅ | — | Ref: User |
| `originalUrl` | String | ✅ | — | Destination link |
| `shortCode` | String | ✅ | — | 6-char random or custom alias |
| `customAlias` | String | ❌ | — | Sparse index applied |
| `clicks` | Number | ❌ | `0` | Denormalized click count for quick reads |
| `createdAt` | Date | — | Auto | Mongoose timestamps |

---

### `backend/src/models/Analytics.js`

**Role:** Mongoose schema for recording individual click events.

**Schema Fields:**

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `urlId` | ObjectId | ✅ | — | Ref: Url |
| `visitedAt` | Date | ❌ | `Date.now`| Timestamp of click |
| `ip` | String | ❌ | — | Visitor IP address |
| `device` | String | ❌ | — | Desktop/Mobile/Tablet |
| `os` | String | ❌ | — | Windows, macOS, iOS, Android |
| `browser` | String | ❌ | — | Chrome, Safari, etc. |
| `country` | String | ❌ | — | Geolocation (if implemented) |
| `referer` | String | ❌ | — | HTTP Referer header |

---

### `backend/src/middleware/auth.js`

**Role:** Express middleware to protect routes with JWT verification.

**How It Works:**
1. Reads `Authorization` header, strips `"Bearer "` prefix.
2. Verifies token using `jwt.verify(token, JWT_SECRET)`.
3. Attaches `req.user = decodedPayload` for downstream use.
4. Returns `401` if token is missing or invalid.

---

### `backend/src/controllers/redirect.js`

**Role:** The most critical endpoint. Resolves the short code and handles analytics asynchronously.

**Logic Flow:**
1. `Url.findOne({ shortCode: req.params.shortCode })`
2. If not found, return 404 (or redirect to frontend 404).
3. Synchronously execute `res.redirect(302, url.originalUrl)`.
4. Asynchronously (non-blocking) execute:
   - Extract `req.useragent` data (browser, os, isMobile).
   - `Analytics.create({...})`
   - `Url.updateOne({ $inc: { clicks: 1 } })`

---

## 🎨 Frontend — File Reference

---

### `frontend/src/main.jsx` & `AppRoutes.jsx`

**Role:** React application bootstrap and Routing.

**Routes (`AppRoutes.jsx`):**

| Path | Component | Guard |
|---|---|---|
| `/` | `<Landing />` | Public |
| `/login` | `<Login />` | Public (redirects if auth'd) |
| `/register` | `<Signup />` | Public (redirects if auth'd) |
| `/dashboard` | `<Dashboard />` | `ProtectedRoute` |
| `/analytics/:urlId` | `<Analytics />` | `ProtectedRoute` |

---

### `frontend/src/context/AuthContext.jsx`

**Role:** Global state container for authentication.

**State:**
| State | Type | Description |
|---|---|---|
| `user` | `object \| null` | Logged-in user data |
| `loading` | `boolean` | True during initial JWT validation on mount |

**Functions:**
- `login(email, password)`
- `register(name, email, password)`
- `logout()`: Clears localStorage token and state.

---

### `frontend/src/services/api.js`

**Role:** Axios HTTP client configuration.

**How It Works:**
- Uses `axios.create` with `baseURL` from `import.meta.env.VITE_API_BASE_URL`.
- **Request Interceptor**: Automatically attaches `localStorage.getItem('token')` to every request.
- **Response Interceptor**: Automatically watches for `401 Unauthorized` responses. If seen, it triggers a forced logout and redirects to `/login`.

---

### `frontend/src/pages/Dashboard.jsx`

**Role:** The main hub for users to view and create short links.

**Features:**
- Calls `useUrls()` hook to fetch data.
- Renders `CreateUrlForm` for submitting new links.
- Maps over URLs and renders a `UrlCard` for each.
- Top-level stat calculation (total links, total clicks sum).

---

### `frontend/src/components/UrlCard.jsx`

**Role:** Displays a single shortened URL's details.

**Features:**
- Shows original URL, short URL, and total click count.
- **CopyButton**: Quickly copy the short link to clipboard.
- **QR Code Button**: Opens `QrModal` to display a scannable code.
- **Analytics Button**: Navigates to `/analytics/:id`.
- **Delete Button**: Prompts confirmation, then deletes URL.

---

### `frontend/src/pages/Analytics.jsx`

**Role:** Detailed view of a specific URL's performance.

**Features:**
- Uses `useParams()` to grab the `urlId`.
- Calls `useAnalytics(urlId)` hook.
- Renders `<ClickChart />` mapping daily trends using Recharts.
- Renders Device/Browser breakdown stats.
- Renders `<VisitHistory />` table showing the most recent individual clicks.

---

## 🌐 API Reference Summary

### Authentication (`/api/auth`)

| Method | Endpoint | Body/Params | Auth | Response |
|---|---|---|---|---|
| POST | `/signup` | `{ name, email, password }` | ❌ | `{ token, user }` |
| POST | `/login` | `{ email, password }` | ❌ | `{ token, user }` |
| GET | `/me` | — | ✅ | `User` |

### URLs (`/api/urls`)

| Method | Endpoint | Body | Auth | Response |
|---|---|---|---|---|
| POST | `/` | `{ originalUrl, customAlias? }` | ✅ | Created `Url` object |
| GET | `/` | — | ✅ | `Url[]` (Array of user's URLs) |
| DELETE | `/:id` | — | ✅ | `{ success: true }` |

### Analytics (`/api/analytics`)

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/:urlId` | ✅ | `{ totalClicks, dailyClicks: [], devices: [], browsers: [], recentVisits: [] }` |

### Redirect (Root)

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/:shortCode` | ❌ | 302 Redirect to Original URL |

---

## 🗄️ MongoDB Collections

### `users` Collection
Stores user accounts. Secured by bcrypt hashes.

### `urls` Collection
Stores link mapping data. Linked to User via `userId`. Fast lookups powered by `shortCode` index.

### `analytics` Collection
Stores individual click events. Linked to Url via `urlId`. Time-series aggregation powered by compound index on `urlId` + `visitedAt`.
