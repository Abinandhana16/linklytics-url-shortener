# MASTER IMPLEMENTATION PLAN: URL SHORTENER WITH ANALYTICS

## PART 1 — PRE-DEVELOPMENT SETUP

### Tools to Install
- **Node.js**: Install version 18.x LTS or higher. Verify by running `node -v` in your terminal.
- **npm**: Comes with Node.js. Install version 9.x or higher. Verify by running `npm -v`.
- **VS Code**: The recommended code editor. Download from code.visualstudio.com.
- **Git & GitHub**: Install Git. Run `git config --global user.name "Name"` and `git config --global user.email "email@example.com"`. Create a free account on GitHub.com.
- **Postman or Thunder Client**: Install the Postman desktop app or the Thunder Client VS Code extension to test API endpoints.

### Accounts to Create
- **MongoDB Atlas**: Create an account at mongodb.com/atlas for a free tier M0 cloud database.
- **Render**: Create an account at render.com (free tier) for backend hosting.
- **Vercel**: Create an account at vercel.com (free tier) for frontend hosting.
- **GitHub**: Needed to connect repositories for automated deployment.

### Recommended VS Code Extensions
- **Prettier - Code formatter**: Ensures consistent code formatting across the project automatically.
- **ESLint**: Catches syntax errors and enforces code quality rules dynamically.
- **Thunder Client**: Allows testing backend REST APIs directly inside VS Code.
- **Tailwind CSS IntelliSense**: Essential for auto-completion and linting of Tailwind utility classes.
- **ES7+ React/Redux/React-Native snippets**: Speeds up creating React components with shortcuts like `rafce`.

### Folder Structure Setup
Run the following terminal commands to create the project skeleton:
```bash
mkdir url-shortener-analytics
cd url-shortener-analytics
mkdir backend frontend
```

---

## PART 2 — BACKEND IMPLEMENTATION PLAN

### Step 1: Project Initialization
- **WHAT**: Initialize the backend Node.js application.
- **HOW**: `cd backend` and run `npm init -y`.
- **PACKAGES**: Run `npm install express mongoose bcryptjs jsonwebtoken cors dotenv nanoid express-validator express-rate-limit helmet express-useragent`. Run `npm install -D nodemon`.
- **SCRIPTS**: In `package.json`, add:
  `"start": "node src/server.js"`,
  `"dev": "nodemon src/server.js"`
- **.ENV**: Create a `.env` file with: `PORT=5000`, `MONGO_URI=your_atlas_string`, `JWT_SECRET=strong_random_string`, `BASE_URL=http://localhost:5000`, `FRONTEND_URL=http://localhost:5173`.

### Step 2: config/db.js
- **WHAT**: Connects the Node app to MongoDB.
- **WHY**: Essential for all database operations. Without it, the app cannot store data.
- **VERIFY**: Run `npm run dev` and ensure "MongoDB Connected" logs to the console.

### Step 3: config/env.js
- **WHAT**: Validates that critical environment variables (`MONGO_URI`, `JWT_SECRET`) exist.
- **WHY**: Prevents the app from running and crashing cryptically later if a variable is missing.
- **VERIFY**: Remove `JWT_SECRET` from `.env` temporarily and ensure the app throws an explicit missing variable error and exits.

### Step 4: Models
1. **User.js**
   - **Fields**: `name` (String, required), `email` (String, required, unique), `password` (String, required).
   - **Indexes**: Unique index on `email` to prevent duplicate registrations.
2. **Url.js**
   - **Fields**: `userId` (ObjectId ref User), `originalUrl` (String, required), `shortCode` (String, required, unique), `customAlias` (String), `clicks` (Number, default 0), `createdAt` (Date).
   - **Indexes**: Sparse unique index on `customAlias` (so multiple null/empty aliases don't trigger duplicate key errors). Compound index on `{ userId: 1, createdAt: -1 }` for fast dashboard sorting.
3. **Analytics.js**
   - **Fields**: `urlId` (ObjectId ref Url), `visitedAt` (Date), `ip` (String), `device` (String), `os` (String), `browser` (String), `country` (String), `referer` (String).
   - **Indexes**: Compound index on `{ urlId: 1, visitedAt: -1 }` for rapid time-series aggregation.

### Step 5: Utils
1. **generateShortCode.js**
   - **WHAT**: Uses `nanoid` (import specific length version, e.g., 6 chars).
   - **WHY**: Generates random string. Include a `while` loop that checks the DB for collisions, retrying generation if the code exists.
2. **isExpired.js**
   - **WHAT**: Takes a date and compares it to `Date.now()`.
   - **WHY**: Safely handles null/undefined dates (returning false) and correctly identifies if a link's expiration time has passed.

### Step 6: Middleware
1. **authMiddleware.js**
   - **WHAT**: Extracts `Bearer <token>` from the Authorization header. Uses `jwt.verify()`.
   - **WHY**: Validates the token and attaches the decoded payload to `req.user`.
   - **VERIFY**: Return 401 if missing, invalid, or expired.
2. **rateLimiter.js**
   - **WHAT**: Uses `express-rate-limit`. Protects against DDoS and brute force.
   - **WHY**: `globalLimiter` (e.g., 100 req/15min). `authLimiter` (e.g., 5 req/15min for login/signup).
3. **errorHandler.js**
   - **WHAT**: Must have exact signature `(err, req, res, next)`.
   - **WHY**: Centralizes error formatting. Specifically catches MongoDB `code 11000` to return a 409 Conflict with the extracted duplicated field name instead of a 500 crash.

### Step 7: Validators
1. **authValidator.js**
   - **WHAT**: Uses `express-validator` chains (`body('email').isEmail()`).
   - **WHY**: Rejects bad data early. Runs `validationResult(req)` and returns 400 with errors if present.
2. **urlValidator.js**
   - **WHAT**: Validates `originalUrl`. Rejects `ftp://`, `data://`, or javascript execution URIs.
   - **WHY**: Security. Also validates `customAlias` using a strict regex (e.g., `/^[a-zA-Z0-9-_]+$/`) to prevent spaces or special characters in URLs.

### Step 8: Services
1. **authService.js**
   - **WHAT**: Core signup/login logic. Hashes passwords using `bcrypt.hash` with salt rounds = 12 (strong balance of security/speed).
   - **WHY**: Signs JWTs containing `{ userId, email }`. We include email to avoid needing to query the DB just to know who the token belongs to in basic middleware.
2. **urlService.js**
   - **WHAT**: `createUrl`: Decision tree to check if `customAlias` is requested -> check availability. If none, invoke `generateShortCode`.
   - **WHY**: `getUserUrls`: Implement pagination `skip = (page - 1) * limit`. `deleteUrl`: Enforces ownership check (ensure URL belongs to `req.user.userId`). Must cascade delete associated Analytics documents.
3. **analyticsService.js**
   - **WHAT**: MongoDB aggregation pipelines.
   - **WHY**: Uses `$match` on `urlId`, `$group` to aggregate by device/browser/country. Uses `$dateToString: { format: "%Y-%m-%d", date: "$visitedAt" }` to group daily clicks. Sorts by `_id` (the grouped date) chronologically.

### Step 9: Controllers
1. **authController.js**
   - **WHAT**: Handles HTTP req/res for auth.
   - **WHY**: Signup -> hash -> create -> sign -> return 201. Login -> find -> compare -> sign -> return 200. Never returns `passwordHash` in the response body.
2. **urlController.js**
   - **WHAT**: Maps to URL endpoints.
   - **WHY**: Constructs the final short URL by appending the shortCode to the `BASE_URL` env variable. Handles pagination query params (`req.query.page`).
3. **analyticsController.js**
   - **WHAT**: Fetches stats.
   - **WHY**: Uses `Promise.all([getDailyClicks, getDeviceStats, getBrowserStats])` to fetch all aggregations in parallel. Parallel execution drastically reduces overall response time compared to sequential `await`.
4. **redirectController.js**
   - **WHAT**: The core engine of the shortener.
   - **WHY**: Extremely performance critical. Order: Find URL -> Check active -> Check expiry. Synchronously send `res.redirect(302, originalUrl)` while asynchronously calling `Analytics.create()` and `Url.updateOne({ $inc: { clicks: 1 }})` so the user doesn't wait for the DB write.

### Step 10: Routes
- **authRoutes.js**: POST `/signup` (with authLimiter, authValidator), POST `/login` (with authLimiter).
- **urlRoutes.js**: All routes protected by `authMiddleware`. POST `/` (urlValidator), GET `/`, GET `/:id`, DELETE `/:id`.
- **analyticsRoutes.js**: GET `/:urlId` (protected by `authMiddleware`).
- **redirectRoutes.js**: GET `/:shortCode`.
- **WHY**: Middleware runs left-to-right: limiter -> auth -> validator -> controller. `redirectRoutes` MUST be mounted last in `app.js` so `/:shortCode` doesn't accidentally catch `/api/...` routes.

### Step 11: app.js
- **WHAT**: Express app setup.
- **WHY**: Order matters: `helmet()` -> `cors({ origin: process.env.FRONTEND_URL })` -> `express.json()` -> `express-useragent.express()` -> `/api/...` routes -> `/` redirect routes -> `errorHandler`.

### Step 12: server.js
- **WHAT**: The entry point.
- **WHY**: Runs `validateEnv()` FIRST. Then `connectDB()`. Only when DB is connected does it run `app.listen()`.

---

## PART 3 — BACKEND TESTING PLAN

*Tools: Use Postman or Thunder Client.*

### Sequence (Must follow this exact order):

1. **Health Check**
   - Request: GET `http://localhost:5000/health`
   - Expect: 200 OK. Identifies server is running.
2. **Auth Endpoints**
   - Request: POST `/api/auth/signup` with JSON body. Expect: 201 Created. Run again -> Expect 409 Conflict.
   - Request: POST `/api/auth/login` with correct body. Expect: 200 OK & token. Test with wrong password -> Expect 401.
   - Request: GET `/api/auth/me` with Bearer Token in Auth Header. Expect 200 OK. Remove token -> Expect 401.
3. **URL Endpoints** *(Requires Token)*
   - Request: POST `/api/urls`. Body: `{ "originalUrl": "https://google.com" }`. Expect: 201.
   - Request: POST `/api/urls`. Body: `{ "originalUrl": "invalid-url" }`. Expect: 400 Bad Request.
   - Request: POST `/api/urls`. Body: `{ "originalUrl": "https://bing.com", "customAlias": "mybing" }`. Expect 201.
   - Request: GET `/api/urls?page=1`. Expect: 200 OK with array of created URLs.
   - Request: DELETE `/api/urls/:id`. Expect: 200 OK. Run GET again to verify it's gone.
4. **Redirect Endpoint** *(Public)*
   - Request: GET `http://localhost:5000/mybing`. Expect: 302 Found (check headers for Location: https://bing.com).
   - Request: GET `http://localhost:5000/mybing`. Verify MongoDB Analytics collection now has a new document.
   - Request: GET `http://localhost:5000/invalid_code`. Expect: 404 Not Found.
5. **Analytics Endpoint** *(Requires Token)*
   - Request: GET `/api/analytics/:urlId` (use ID of the URL you just redirected).
   - Expect: 200 OK. Verify JSON contains `devices`, `browsers`, and a `clicks` array containing today's date with a count of 1.

---

## PART 4 — FRONTEND IMPLEMENTATION PLAN

### Step 1: Project Initialization
- **WHAT**: `npm create vite@latest frontend -- --template react`
- **TAILWIND**: `cd frontend`, `npm install -D tailwindcss postcss autoprefixer`, `npx tailwindcss init -p`. Configure `tailwind.config.js` content paths. Add directives to `index.css`.
- **PACKAGES**: `npm install react-router-dom axios recharts lucide-react qrcode.react clsx tailwind-merge date-fns`
- **ENV**: Create `.env` containing `VITE_API_BASE_URL=http://localhost:5000`.

### Step 2: services/api.js
- **WHAT**: `const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })`.
- **WHY**: Request interceptor attaches `localStorage.getItem('token')` to `config.headers.Authorization`. Response interceptor watches for 401 status; if seen, calls `localStorage.removeItem('token')` and redirects to login.

### Step 3: API Services
- **WHAT**: Create `authService.js`, `urlService.js`, `analyticsService.js`.
- **WHY**: Abstracts Axios calls. e.g., `urlService.create = (data) => api.post('/urls', data)`. Every function must have a try/catch returning standardized error strings.

### Step 4: context/AuthContext.jsx
- **WHAT**: React Context provider for user state.
- **WHY**: Avoids prop drilling. Maintains a `loading` state set to `true` initially. On mount, checks for token and calls `/api/auth/me`. Sets `loading` to `false` when done. Prevents the router from flashing the login page if the user is actually authenticated. Implements `login()` and `logout()` functions.

### Step 5: Hooks
- **WHAT**: `useAuth`, `useUrls`, `useAnalytics`.
- **WHY**: Extracts useEffect logic. `useUrls` implements optimistic UI updates on delete (removes the URL from local React state immediately, then calls the API, reverting if the API fails) to make the interface feel instant. `useAnalytics` triggers fetch whenever its `urlId` argument changes.

### Step 6: Utils
- **WHAT**: `formatDate.js` (uses date-fns for "2 hours ago"), `validators.js` (client-side URL regex), `copyToClipboard.js`.
- **WHY**: `copyToClipboard` uses `navigator.clipboard.writeText`, providing a reliable way to copy short links to the user's clipboard.

### Step 7: Components (Build Order)
1. **Loader.jsx**: Build first. A simple CSS spinner.
2. **Navbar.jsx**: Reads `useAuth`. Shows "Logout" if logged in, else "Login".
3. **ProtectedRoute.jsx**: Returns `<Outlet />` if user exists. Returns `<Loader />` if context is loading. Returns `<Navigate to="/login" />` if no user.
4. **CopyButton.jsx**: Button that calls copy util, sets local `copied` state to true for 2 seconds (changing icon to a checkmark), then resets.
5. **QrModal.jsx**: Uses `<QRCodeCanvas />`. Grabs the canvas element ref and uses `.toDataURL("image/png")` to trigger a download anchor tag.
6. **ClickChart.jsx**: Uses Recharts `<ResponsiveContainer>`. **Crucial**: Parent div MUST have a strict height (e.g., `h-64`). Formats X-axis date labels. Handles empty state if no clicks exist.
7. **VisitHistory.jsx**: Maps recent visits table. Extracts and formats browser names gracefully.
8. **CreateUrlForm.jsx**: Controlled inputs for `originalUrl` and `customAlias`. Validates URL on submit *before* API call. Accepts `onCreated` prop to pass new data back up to Dashboard.
9. **UrlCard.jsx**: Displays short link. Integrates CopyButton and QrModal. Contains delete button with window.confirm pattern. Accepts `onDelete` prop.

### Step 8: Pages (Build Order)
1. **LoginPage.jsx**: Form submission calls `login()` from AuthContext. Displays API errors in a red banner. Redirects to `/dashboard` on success.
2. **SignupPage.jsx**: Has a "Confirm Password" field validated client-side only. Calls `register()`.
3. **DashboardPage.jsx**: Uses `useUrls` hook. Calculates total links/clicks for top stat cards. Renders `CreateUrlForm` and maps `UrlCard`s. Passes `page` state to pagination controls.
4. **AnalyticsPage.jsx**: Uses `useParams` to get `urlId`. Fetches via `useAnalytics`. Layout: Stats row -> ClickChart -> VisitHistory. Includes "Back to Dashboard" navigation.
5. **NotFoundPage.jsx**: Shown for bad routes.

### Step 9: Routing Configuration
- **WHAT**: `main.jsx` wraps `<App>` in `<BrowserRouter>`. `App.jsx` wraps routes in `<AuthProvider>`.
- **WHY**: Setup public routes (`/login`, `/signup`). Setup `<Route element={<ProtectedRoute />}>` containing `/dashboard` and `/analytics/:id`. Setup `<Route path="/" element={<Navigate to="/dashboard" replace />} />`.

---

## PART 5 — INTEGRATION TESTING PLAN

1. **Signup Flow**: Open browser -> `/signup` -> Fill form -> Submit -> Verify redirect to `/dashboard` -> Refresh page -> Verify still on dashboard.
2. **Login Flow**: Click logout -> Go to `/login` -> Use credentials -> Verify dashboard loads.
3. **Create URL Flow**: Paste long URL -> Submit -> Verify it appears instantly -> Submit another with custom alias -> Verify alias appears.
4. **Redirect Flow**: Click CopyButton on dashboard -> Open new tab -> Paste short URL -> Verify redirect to original URL -> Go back to dashboard -> Go to Analytics -> Verify click count incremented.
5. **Analytics Flow**: Click Analytics on a card -> Verify chart renders data -> Verify Recent Visits table shows your exact browser/OS.
6. **Delete Flow**: Click Delete -> Accept alert -> Verify URL vanishes -> Try to visit the short URL -> Verify backend returns 404.
7. **Auth Guard Flow**: Logout -> Type `/dashboard` in URL bar -> Hit enter -> Verify forced redirect to `/login`.
8. **Edge Cases**: Enter invalid URL -> Verify form error. Enter duplicate alias -> Verify backend 409 error displays gracefully. Clear token from application storage -> Refresh -> Verify forced logout.

---

## PART 6 — DEPLOYMENT PLAN

### MongoDB Atlas Setup
1. Go to mongodb.com/atlas. Create project.
2. Build Cluster -> M0 Free Tier -> Select nearest region.
3. Database Access -> Add New Database User -> Set username/password.
4. Network Access -> Add IP Address -> `0.0.0.0/0` (Allows Render to connect dynamically).
5. Overview -> Connect -> Drivers -> Copy Connection String. Replace `<password>` with real password.

### Render Deployment (Backend)
1. Push backend code to GitHub.
2. On Render.com, create "Web Service".
3. Connect GitHub repo. Set Root Directory to `backend`.
4. Build Command: `npm install`. Start Command: `npm start`.
5. Environment Variables:
   - `MONGO_URI`: Atlas connection string.
   - `JWT_SECRET`: Generate a random secure string.
   - `PORT`: `10000` (Render default).
   - `BASE_URL`: The URL Render gives you (e.g., `https://my-app.onrender.com`).
   - `FRONTEND_URL`: Temporary placeholder (update after Vercel deploy).
6. Deploy. First boot takes 2 mins. Wait for "Server listening on port 10000" in logs.

### Vercel Deployment (Frontend)
1. Push frontend code to GitHub.
2. On Vercel.com, add new project, import from GitHub.
3. Framework Preset: Vite. Root Directory: `frontend`.
4. Environment Variables:
   - `VITE_API_BASE_URL`: Your Render URL (e.g., `https://my-app.onrender.com`).
5. Deploy.
6. **CRITICAL**: Copy the final Vercel URL. Go back to Render -> Environment Variables -> Update `FRONTEND_URL` to this Vercel URL (no trailing slash). Restart Render server to apply new CORS rules.

### Post-Deployment Checklist
- [ ] Test signup on production.
- [ ] Create short URL on production.
- [ ] Test redirect link.
- [ ] Check console network tab to ensure no CORS blocking errors exist.

---

## PART 7 — DEBUGGING GUIDE

### Backend Errors
1. **MongoServerError: E11000 duplicate key error**: Caused by trying to use an email or custom alias that already exists. Fix: Ensure `errorHandler.js` catches code 11000 specifically.
2. **JsonWebTokenError: invalid signature**: Token modified or JWT_SECRET changed on server. Fix: Clear browser localStorage and login again.
3. **JsonWebTokenError: jwt must be provided**: Auth middleware didn't find token in headers. Fix: Ensure frontend axios interceptor is attaching `Bearer <token>`.
4. **TokenExpiredError: jwt expired**: Token lifecycle ended. Fix: Intercept 401 on frontend and redirect to login.
5. **Cannot find module 'nanoid'**: ESM vs CommonJS clash. Fix: `npm i nanoid@3.3.4` (older version supports CommonJS `require()`).
6. **MongooseError: buffering timed out**: DB connection lost or IP blocked. Fix: Ensure `0.0.0.0/0` is whitelisted in Atlas Network Access.
7. **CORS error: No 'Access-Control-Allow-Origin' header**: Origin mismatch. Fix: Ensure Render's `FRONTEND_URL` exactly matches the Vercel URL without a trailing slash.
8. **ValidationError: Path 'email' is required**: Missing data in request. Fix: Check frontend form payload and backend validator middleware.
9. **ReferenceError: Cannot access before initialization**: Circular dependency or bad variable scope. Fix: Check import orders and variable declarations.
10. **Render: application failed to respond**: Wrong port binding. Fix: Ensure `app.listen(process.env.PORT)` is used, not a hardcoded port.

### Frontend Errors
1. **Axios Network Error**: Backend offline or URL wrong. Fix: Check `VITE_API_BASE_URL`.
2. **401 on every request after refresh**: Token not persisting. Fix: Ensure `localStorage.setItem('token')` is happening on login.
3. **Recharts: "Each child in a list should have unique key"**: Array mapping missing keys. Fix: Add `key={item.id}` to map returns.
4. **QR code not rendering**: Bad prop type. Fix: Ensure value passed to QRCodeCanvas is a valid string URL.
5. **React Router: No routes matched location "/"**: Missing root route. Fix: Add `<Route path="/" element={<Navigate to="/dashboard" />} />`.
6. **Tailwind classes not applying**: Purge config wrong. Fix: Ensure `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]` is in `tailwind.config.js`.
7. **VITE_API_BASE_URL is undefined**: Vite specific env issue. Fix: Env vars MUST be prefixed with `VITE_` to be exposed to the client.
8. **White screen with no error**: Unhandled promise rejection crashing React. Fix: Wrap async effects in try/catch.
9. **useAuth must be inside AuthProvider error**: Hook called outside context. Fix: Ensure `<AuthProvider>` wraps the entire routing tree in `App.jsx`.

---

## PART 8 — IMPLEMENTATION CHECKLIST

### Phase 1 — Environment Setup
- [ ] Node.js installed and version verified
- [ ] npm version verified
- [ ] VS Code installed with all recommended extensions
- [ ] Git configured with name and email
- [ ] GitHub account created
- [ ] MongoDB Atlas account created
- [ ] Render account created
- [ ] Vercel account created
- [ ] Postman or Thunder Client installed

### Phase 2 — Backend Setup
- [ ] backend/ folder created
- [ ] npm init completed
- [ ] All packages installed
- [ ] .env file created with all variables
- [ ] package.json scripts added (start, dev)

### Phase 3 — Backend Core
- [ ] src/config/db.js
- [ ] src/config/env.js
- [ ] src/models/User.js
- [ ] src/models/Url.js
- [ ] src/models/Analytics.js
- [ ] src/utils/generateShortCode.js
- [ ] src/utils/isExpired.js
- [ ] src/middleware/authMiddleware.js
- [ ] src/middleware/rateLimiter.js
- [ ] src/middleware/errorHandler.js
- [ ] src/validators/authValidator.js
- [ ] src/validators/urlValidator.js
- [ ] src/services/authService.js
- [ ] src/services/urlService.js
- [ ] src/services/analyticsService.js
- [ ] src/controllers/authController.js
- [ ] src/controllers/urlController.js
- [ ] src/controllers/analyticsController.js
- [ ] src/controllers/redirectController.js
- [ ] src/routes/authRoutes.js
- [ ] src/routes/urlRoutes.js
- [ ] src/routes/analyticsRoutes.js
- [ ] src/routes/redirectRoutes.js
- [ ] src/app.js
- [ ] src/server.js

### Phase 4 — Backend Testing
- [ ] Test GET /health
- [ ] Test POST /api/auth/signup (Success + Conflict)
- [ ] Test POST /api/auth/login (Success + Failure)
- [ ] Test GET /api/auth/me
- [ ] Test POST /api/urls (With & without alias)
- [ ] Test GET /api/urls (Pagination)
- [ ] Test DELETE /api/urls/:id
- [ ] Test GET /:shortCode (Redirect success)
- [ ] Test GET /:shortCode (Analytics write success)
- [ ] Test GET /api/analytics/:urlId

### Phase 5 — Frontend Setup
- [ ] frontend/ created with Vite
- [ ] Tailwind installed and configured
- [ ] All packages installed
- [ ] .env file created

### Phase 6 — Frontend Core
- [ ] src/services/api.js
- [ ] src/services/authService.js
- [ ] src/services/urlService.js
- [ ] src/services/analyticsService.js
- [ ] src/context/AuthContext.jsx
- [ ] src/hooks/useAuth.js
- [ ] src/hooks/useUrls.js
- [ ] src/hooks/useAnalytics.js
- [ ] src/utils/formatDate.js
- [ ] src/utils/validators.js
- [ ] src/utils/copyToClipboard.js
- [ ] src/components/Loader.jsx
- [ ] src/components/Navbar.jsx
- [ ] src/components/ProtectedRoute.jsx
- [ ] src/components/CopyButton.jsx
- [ ] src/components/QrModal.jsx
- [ ] src/components/ClickChart.jsx
- [ ] src/components/VisitHistory.jsx
- [ ] src/components/CreateUrlForm.jsx
- [ ] src/components/UrlCard.jsx
- [ ] src/pages/LoginPage.jsx
- [ ] src/pages/SignupPage.jsx
- [ ] src/pages/DashboardPage.jsx
- [ ] src/pages/AnalyticsPage.jsx
- [ ] src/pages/NotFoundPage.jsx
- [ ] src/AppRoutes.jsx
- [ ] src/App.jsx
- [ ] src/main.jsx

### Phase 7 — Integration Testing
- [ ] Signup flow end-to-end
- [ ] Login flow end-to-end
- [ ] Create URL flow end-to-end
- [ ] Redirect tracking flow end-to-end
- [ ] Analytics display flow end-to-end
- [ ] Delete flow end-to-end
- [ ] Auth guard protection flow end-to-end

### Phase 8 — Deployment
- [ ] Atlas Cluster configured and whitelisted
- [ ] Backend pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Frontend pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Render CORS FRONTEND_URL updated
- [ ] Production E2E test successful

---

## PART 9 — TIME BREAKDOWN

| Task | Estimated Time | Notes |
|------|---------------|-------|
| Environment Setup | 30 mins | Account creation, skeleton setup. |
| Backend Core | 2.5 hours | Models, Middleware, Services, Controllers, Routes. |
| Backend Testing | 45 mins | Strict Postman API verification. |
| Frontend Core | 3 hours | Context, API services, Components, Pages, Charts. |
| Integration Testing | 45 mins | E2E browser testing of user flows. |
| Deployment | 1 hour | Atlas, Render, Vercel setup and CORS debugging. |
| Buffer for Debugging | 1 hour | Addressing unknown runtime errors. |

- **Total time for backend only:** 3 hours 15 mins
- **Total time for frontend only:** 3 hours
- **Total time end-to-end:** 9 hours 30 mins
- **Recommended Day 1 targets:** Env Setup, Backend Core, Backend Testing, Initial Frontend Auth Setup.
- **Recommended Day 2 targets:** Frontend Core, Integration Testing, Deployment.
- **Cut List (If short on time):** 
  1. QR Code Modal (low impact feature)
  2. Detailed OS/Browser charts (keep only total clicks graph)
  3. Custom Aliases (force random generation only)

---

## PART 10 — QUICK REFERENCE CARD

### API Endpoints
- `POST /api/auth/signup` - [Public] Create account
- `POST /api/auth/login` - [Public] Authenticate & get token
- `GET /api/auth/me` - [Auth] Verify token identity
- `POST /api/urls` - [Auth] Create short URL
- `GET /api/urls` - [Auth] List user's URLs
- `DELETE /api/urls/:id` - [Auth] Remove URL
- `GET /api/analytics/:id` - [Auth] Fetch stats
- `GET /:shortCode` - [Public] 302 Redirect & log analytics

### Environment Variables
**Backend (.env)**
`PORT=5000`
`MONGO_URI=mongodb+srv://...`
`JWT_SECRET=super_secret_string`
`BASE_URL=http://localhost:5000`
`FRONTEND_URL=http://localhost:5173`

**Frontend (.env)**
`VITE_API_BASE_URL=http://localhost:5000`

### NPM Commands
**Backend Install:** `npm i express mongoose bcryptjs jsonwebtoken cors dotenv nanoid express-validator express-rate-limit helmet express-useragent && npm i -D nodemon`
**Frontend Install:** `npm i react-router-dom axios recharts lucide-react qrcode.react clsx tailwind-merge date-fns`

### Local Dev Startup Commands
**Backend:** `npm run dev` (Runs nodemon server.js)
**Frontend:** `npm run dev` (Runs vite dev server)

### Top 5 Error Fixes
1. **MongoServerError E11000**: Catch in errorHandler and return 409 Conflict.
2. **CORS Error**: Ensure Render `FRONTEND_URL` matches Vercel exactly (no trailing slash).
3. **Cannot find module 'nanoid'**: Use `npm i nanoid@3.3.4` for CommonJS support.
4. **Recharts missing keys**: Add `key={item.name}` inside map().
5. **401 Unauthorized loops**: Intercept on frontend, `localStorage.removeItem('token')`, redirect to `/login`.

### Deployment URLs Format
- **Local backend:** `http://localhost:5000`
- **Local frontend:** `http://localhost:5173`
