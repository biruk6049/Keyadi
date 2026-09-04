# Keyadi — Geospatial Intelligence & Tri-Mode Radar

> Deterministic spatial radar, live tri-mode telemetry (Car, Walk, Bike), radius trackers, and native mobile app with grounded AI assistance.

![Keyadi Logo](public/keyadi-logo.png)

---

## Features

- 🛰️ **Deterministic Geospatial Radar**: Natural language query compilation to Overpass QL without AI hallucinations.
- ⚡ **Tri-Mode Telemetry**: Parallel routing for Driving, Walking, and Cycling with live minutes and distance estimates.
- 📱 **Native Mobile App (Capacitor)**:
  - Android native project configured with circular 4K logo launcher icons and splash screens.
  - Dedicated mobile bottom navigation bar (`MobileBottomNav`).
  - Downloadable `.apk` package for **$0** store fees.
- 📲 **Installable Progressive Web App (PWA)**: 1-click home screen install on Android & iOS.
- 🔐 **Supabase Authentication**: Secure email/password login, registration, and persistent sessions.
- 🗺️ **High-Performance Mapbox GL**: Dark/Light mode, high-res satellite streets cartography, compass bearing reset, and live GPS geolocation.
- 🤝 **Interactive FAQ & Workable Contact**: With ticket tracking and partner motion marquee.

---

## Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS
- **Mobile Engine**: Capacitor 7 (Android / iOS)
- **Map & Cartography**: Mapbox GL JS
- **Database & Auth**: Supabase (PostgreSQL + PostGIS)
- **Deployment**: Vercel / Netlify (SPA configured with `vercel.json` and `_redirects`)

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_GEMINI_API_KEY=your-gemini-key (optional)
```

### 3. Start Development Server
```bash
npm run dev
```

---

## Mobile App (Android)

### Open in Android Studio
```bash
npx cap open android
```
*(In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**).*

### Sync Latest Changes
```bash
npm run build
npx cap sync
```

---

## 1-Click Deployment

### Deploy to Vercel (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your repository: **`biruk6049/Keyadi`**.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MAPBOX_TOKEN`
4. Click **Deploy**. Your site will be live worldwide in ~45 seconds with automated continuous deployment on every git push!

### Deploy to Netlify
1. Go to [app.netlify.com](https://app.netlify.com).
2. Import repository **`biruk6049/Keyadi`**.
3. Build command: `npm run build`, Publish directory: `dist`.
4. Add the environment variables and click **Deploy**.
