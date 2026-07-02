# Linklytics Master Implementation Plan

This document outlines the step-by-step implementation strategy used to build the Linklytics URL Shortener & Analytics platform. It serves as a historical build guide detailing the setup, backend endpoints, frontend components, and architectural decisions.

---

## 🎯 Phase 1: Project Setup & Foundation

### 1.1 Repository & Environment Initialization
- Initialize a monolithic repository structure to hold both `frontend/` and `backend/` directories.
- Configure `.gitignore` for standard Node.js and React project exclusions (`node_modules`, `.env`).

### 1.2 Backend Foundation (Node.js/Express)
- Initialize `npm` in the `backend/` directory.
- Install core dependencies: `express`, `mongoose`, `dotenv`, `cors`, `helmet`.
- Set up `src/server.js` as the entry point, separating server listening logic from Express app configuration (`src/app.js`).
- Configure a base global error handler middleware to catch unhandled promise rejections.

### 1.3 Frontend Foundation (React/Vite)
- Initialize the React app using Vite (`npm create vite@latest frontend --template react`).
- Install and configure **Tailwind CSS** for utility-first styling.
- Install React Router (`react-router-dom`) for SPA navigation and Axios for HTTP requests.

---

## 💾 Phase 2: Database & Backend Architecture

### 2.1 MongoDB Configuration
- Configure the MongoDB connection URI via `.env`.
- Establish the connection in `server.js` before starting the HTTP server.

### 2.2 Mongoose Schema Definitions
Create the three core data models in `src/models/`:
1. **User Schema**: Fields for `name`, `email`, and `password`. Implement pre-save hooks to automatically hash passwords using `bcryptjs`.
2. **Url Schema**: Fields for `userId` (ref), `originalUrl`, `shortCode`, `customAlias`, and a denormalized `clicks` counter.
3. **Analytics Schema**: Time-series collection to track individual clicks, recording `urlId` (ref), `ip`, `device`, `browser`, `os`, and `country`.

### 2.3 Authentication Service
- Implement JWT generation using `jsonwebtoken`.
- Create the `auth.js` middleware to verify Bearer tokens on protected API routes and attach the decoded `user` object to the request.

---

## ⚙️ Phase 3: Core API Endpoints

### 3.1 Auth Routes (`/api/auth`)
- **POST `/signup`**: Validate input, hash password, create user, return JWT.
- **POST `/login`**: Verify credentials, return JWT.
- **GET `/me`**: Return currently authenticated user data (protected).

### 3.2 URL Management (`/api/urls`)
- **POST `/`**: Accept `originalUrl`. Generate a short code using `nanoid` (or use provided `customAlias`). Save to DB.
- **GET `/`**: Fetch all URLs belonging to the authenticated user.
- **DELETE `/:id`**: Verify ownership and delete the URL record.

### 3.3 The Redirect Engine (`/`)
- **GET `/:shortCode`**: 
  - Look up the URL by `shortCode`.
  - Issue an immediate **HTTP 302 Redirect** to the `originalUrl`.
  - *Asynchronously* (without blocking the redirect): Parse `User-Agent` using `express-useragent`, determine IP, increment URL `clicks`, and log a new record in the Analytics collection.

### 3.4 Analytics Aggregation (`/api/analytics`)
- **GET `/:urlId`**: Fetch the target URL and its associated visit records. Aggregate data (e.g., clicks per day, device breakdown) to be consumed by the frontend charting library.

---

## 🎨 Phase 4: Frontend Development

### 4.1 State Management & Routing
- Set up React Router in `AppRoutes.jsx`.
- Create `AuthContext.jsx` to manage global authentication state (`user`, `loading`, `login`, `logout`).
- Create `ProtectedRoute.jsx` to restrict access to the Dashboard and Analytics pages.

### 4.2 API Integration
- Configure a global Axios instance (`services/api.js`) with an interceptor to automatically attach the JWT from `localStorage` to all requests.
- Add response interceptors to automatically log out users if a `401 Unauthorized` is returned by the backend.

### 4.3 UI Components & Views
- **Landing Page**: Public-facing hero section explaining the product.
- **Auth Pages (Login/Signup)**: Forms with validation and error handling.
- **Dashboard**: The main authenticated view.
  - Implement `<CreateUrlForm />` for link generation.
  - Implement `<UrlCard />` to display links, a copy-to-clipboard button, and a QR Code modal (`qrcode.react`).
- **Analytics View**: 
  - Fetch aggregated data from the backend.
  - Render time-series charts and device breakdowns using **Recharts**.
  - Display a tabular `<VisitHistory />` component for recent clicks.

---

## 🔒 Phase 5: Refinement & Security

### 5.1 Security Hardening
- Implement `helmet` to set secure HTTP headers.
- Implement `express-rate-limit` on Auth and URL creation endpoints to prevent brute-force attacks and abuse.

### 5.2 Final Polish
- Ensure mobile responsiveness across all Tailwind components.
- Standardize API error responses via the global error handler.
- Write README documentation explaining setup instructions and architecture.
