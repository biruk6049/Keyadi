<div align="center">
  <img src="public/keyadi-logo.png" alt="Keyadi Logo" width="120" height="120" style="border-radius: 50%;" />

  # KEYADI
  **Next-Generation Geospatial Intelligence & Spatial Radar**

  *Deterministic Spatial Queries · Tri-Mode Real-Time Telemetry · Zero-Hallucination Grounded AI*

  [![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
  [![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
  [![Mapbox GL](https://img.shields.io/badge/Mapbox-GL%20JS-4264FB?logo=mapbox&logoColor=white)](https://www.mapbox.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20PostGIS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-Mobile%20App-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)

</div>

---

## 🧭 Executive Overview

**Keyadi** is a modern geospatial intelligence platform engineered to solve the core limitations of legacy mapping services. By unifying conversational natural-language parsing, deterministic OpenStreetMap query compilation, and parallel tri-mode routing telemetry, Keyadi gives users immediate, verifiable, ad-free spatial situational awareness.

Available simultaneously as a high-performance web application and a native mobile app (Android APK & PWA), Keyadi offers zero-barrier accessibility with no commercial store fees.

---

## ⚡ Why Keyadi is Different from Google Maps

While Google Maps is built around advertising revenue, sponsored search placement, and closed ecosystems, **Keyadi is designed from the ground up for privacy, precision, and deterministic clarity.**

| Feature | 🔴 Google Maps | 🟡 Keyadi |
| :--- | :--- | :--- |
| **Search Paradigm** | Opaque ranking algorithm biased toward paid ads and sponsored pins. | **Deterministic OpenStreetMap engine** matching actual verified business attributes and open tags. |
| **AI Reliability** | Generic summaries that frequently hallucinate operating hours or amenities. | **Grounded RAG (Gemini 3.8)**: Generates insights strictly from verifiable spatial database records—zero hallucinations. |
| **Route Comparison** | Requires switching tabs sequentially between driving, walking, and transit. | **Simultaneous Tri-Mode Telemetry**: Car, walking, and cycling times & paths rendered concurrently. |
| **Proximity Trackers** | Passive saved lists without radius-based boundary monitoring. | **Active Spatial Radar**: Define geographic radiuses with PostGIS to monitor neighborhoods and keyword updates. |
| **User Privacy** | Continuously logs, profiles, and monetizes personal location history for ad targeting. | **Client-Side Spatial Math**: Proximity queries computed locally; zero location profiling or telemetry selling. |
| **Cost & Ecosystem** | Requires Google Play or Apple App Store accounts and developer fees. | **100% Free**: Instant direct Android APK download and zero-delay PWA home-screen installation. |
| **Visual Cartography** | Cluttered with promotional icons, review banners, and popups. | **Studio-Grade Dark/Light Vector GL**: Minimalist aesthetic focusing purely on coordinates, telemetry, and points of interest. |

---

## 🎯 Core Capabilities

### 1. Deterministic Spatial Radar
Traditional search engines guess what you mean and return sponsored chains. Keyadi parses queries like *"quiet specialty cafe with wifi"* or *"hardware store with cement and rebar"* into strict, injection-safe Overpass QL syntax. It queries live OpenStreetMap nodes, ways, and relations in real time.

### 2. Tri-Mode Vector Telemetry
Whenever a venue is selected, Keyadi queries driving, pedestrian, and cycling routing profiles in parallel. Instant duration metrics and distance vectors appear directly on the map, allowing immediate transit decisions.

### 3. Grounded Geospatial Assistant
Integrated with Gemini 3.8 and local semantic fallback engines, Keyadi provides instant answers to place-specific questions (*"Is it walkable?", "What are the hours?", "Contact information?"*) derived strictly from verified OpenStreetMap metadata.

### 4. Native Mobile Architecture (Capacitor)
- Native Android app package with full hardware GPS acceleration.
- Custom circular 4K icon set across all launcher densities.
- Dedicated mobile glassmorphic bottom navigation bar with safe-area support.
- Direct APK download distribution model for **$0** store fees.

---

## 🛡️ Enterprise Security & Hardening

Keyadi is fortified following rigorous security standards:
- **Injection-Proof Spatial Parsing**: All search inputs and tag filters are sanitized with strict character whitelisting before query compilation.
- **Secure API Key Transport**: Upgraded to header-based authentication (`x-goog-api-key`) preventing credential leakage via HTTP request URLs.
- **Transport Security**: Cleartext HTTP traffic is strictly disabled in mobile app bundles, enforcing end-to-end TLS/HTTPS.
- **Row-Level Security (RLS)**: Database tables utilize granular PostgreSQL policies (`auth.uid() = user_id`) ensuring user trackers and spatial history are strictly isolated.
- **Protected Environment Variables**: Automatic Git exclusion and web server directory denial policies ensure API secrets are never exposed.

---

## 🏗️ Technical Architecture

```
Keyadi Platform
├── Client Interface (React 18 + Tailwind CSS + Mapbox GL JS)
│    ├── Landing Page (Motion Marquee, Interactive FAQ, Direct APK Modal)
│    ├── Dashboard (Vector Map, Tri-Mode Overlays, Reverse Geocoding)
│    └── Mobile UX (MobileBottomNav, Responsive Touch Controls)
├── Mobile Shell (Capacitor 7 Native Android & PWA Engine)
│    ├── Android Studio Native Project (android/)
│    └── Web App Manifest & Service Worker Hooks
├── Intelligence Layer (aiSearch.js)
│    ├── Gemini 3.8 Spatial RAG Compiler
│    └── Local Deterministic Semantic Pattern Fallback
└── Backend Infrastructure (Supabase)
     ├── PostgreSQL + PostGIS (Spherical Geography & Spatial Indexing)
     └── Row-Level Security Policies & Auth Engine
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) Android Studio for native Android compilation

### Installation
```bash
# Clone the repository
git clone https://github.com/biruk6049/Keyadi.git
cd Keyadi

# Install dependencies
npm install

# Configure your environment
cp .env.example .env
```

Add your credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MAPBOX_TOKEN=your-mapbox-access-token
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Launch Development Server
```bash
npm run dev
```

### Build & Deploy
```bash
# Production web build
npm run build

# Sync updates to native Android project
npx cap sync

# Open in Android Studio
npx cap open android
```

---

## 🌐 Instant Cloud Deployment

Keyadi is pre-configured for continuous zero-config deployment:
- **Vercel**: Single-page application rewrites handled automatically via [`vercel.json`](vercel.json).
- **Netlify**: Fallback routing rules configured via [`public/_redirects`](public/_redirects).

---

<div align="center">
  <sub>Built by <strong>HAWAZ TECHNOLOGIES</strong> · Privacy-focused geographic exploration and live telemetry. © 2026 Keyadi. All rights reserved.</sub>
</div>
