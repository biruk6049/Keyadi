# Place Tracker

Keyword-based local discovery + tracking app. Search any keyword (material, place type, street name)
and find matching places nearby on a live map. Save searches to get alerted when new matches appear.

## Stack
- React + Vite + Tailwind
- Supabase (Auth + Postgres + PostGIS)
- Mapbox GL JS for the map
- Google Places API for real place data (to be wired into a backend/API route)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create a Supabase project
1. Go to https://supabase.com and create a new project.
2. In **Project Settings > API**, copy your Project URL and anon public key.
3. In **SQL Editor**, run the contents of `supabase/schema.sql` to set up PostGIS, the
   `trackers` and `tracker_matches` tables, and Row Level Security policies.

### 3. Enable Google login in Supabase
1. Go to **Authentication > Providers > Google** in your Supabase dashboard.
2. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (OAuth Client ID, type: Web application).
3. Add the redirect URL Supabase gives you to your Google OAuth client's authorized redirect URIs.
4. Paste the Google Client ID and Secret into Supabase and save.

### 4. Get a Mapbox token
Sign up at https://account.mapbox.com and grab a public access token.

### 5. Configure environment variables
```bash
cp .env.example .env
```
Fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_MAPBOX_TOKEN`.

### 6. Run it
```bash
npm run dev
```

## What's built so far
- ✅ Email/password signup + login (Supabase Auth)
- ✅ Google OAuth login
- ✅ Protected `/dashboard` route (redirects to `/login` if not authenticated)
- ✅ Map + keyword search UI (currently returns **mock results** — see `Dashboard.jsx`)
- ✅ "Track" button that saves a search to Supabase (`trackers` table)
- ✅ Database schema with PostGIS for proximity queries + Row Level Security

## What's next (not yet built)
- **Backend API route** to actually call Google Places API (Text Search / Nearby Search) and
  return real results — currently `handleSearch` in `Dashboard.jsx` returns mock data. Google
  API keys must never live in frontend code, so this needs a small server (Express, or Vercel/
  Supabase Edge Function).
- **Background job** to periodically re-run saved trackers against the Places API and insert
  new matches into `tracker_matches`.
- **Notifications** (email via Resend/SendGrid, or Telegram bot) when new matches are found.
- **Trackers dashboard page** to view/manage saved searches and match history.

## Project structure
```
src/
  lib/supabaseClient.js       Supabase client init
  context/AuthContext.jsx     Auth state + signup/login/logout functions
  components/ProtectedRoute.jsx
  pages/Login.jsx
  pages/Signup.jsx
  pages/Dashboard.jsx         Main map + search UI
supabase/schema.sql           DB schema, PostGIS, RLS policies
```
