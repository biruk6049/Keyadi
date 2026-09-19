import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PageBackground from '../components/PageBackground'
import KeyadiLogo from '../components/KeyadiLogo'

/* ── Design tokens ── */
const ink = '#f3f1ec'
const inkMuted = 'rgba(243,241,236,0.65)'
const inkFaint = 'rgba(243,241,236,0.40)'
const hairline = 'rgba(243,241,236,0.12)'
const cardBg = 'rgba(14, 13, 11, 0.86)'
const amber = '#e8a33d'
const teal = '#2dd4bf'

/* ── Section component ── */
function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2
        className="text-lg font-bold tracking-tight mb-4 pb-2 border-b"
        style={{ color: amber, borderColor: hairline }}
      >
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: inkMuted }}>
        {children}
      </div>
    </section>
  )
}

/* ═══════════════════════ PRIVACY POLICY ═══════════════════════ */
function PrivacyPolicy() {
  return (
    <>
      <p className="text-sm leading-relaxed mb-8" style={{ color: inkMuted }}>
        <strong style={{ color: ink }}>Effective Date:</strong> September 2026 &nbsp;·&nbsp;
        <strong style={{ color: ink }}>Last Updated:</strong> September 2026
      </p>

      <Section title="1. Who We Are">
        <p>
          Keyadi is a geospatial search and navigation platform operated by <strong style={{ color: ink }}>Hawaz Technologies</strong>.
          For privacy-related questions, contact us at{' '}
          <a href="mailto:biruk5868@gmail.com" className="text-amber-400 underline decoration-amber-400/40">biruk5868@gmail.com</a>
          {' '}or call{' '}
          <a href="tel:+251909005450" className="text-emerald-400 underline decoration-emerald-400/40">+251 909 005 450</a>.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p><strong style={{ color: ink }}>Account Data:</strong> When you create an account, we collect your email address and an encrypted password hash. Passwords are never stored in plain text.</p>
        <p><strong style={{ color: ink }}>Location Data (Client-Side Only):</strong> Your GPS coordinates are processed exclusively within your browser to calculate proximity-based search queries. We do not transmit, store, or sell your real-time location to any server or third party.</p>
        <p><strong style={{ color: ink }}>User-Created Content:</strong> Saved trackers (keyword, radius, coordinates) are stored in your authenticated Supabase account.</p>
        <p><strong style={{ color: ink }}>Local Storage:</strong> We use browser localStorage to persist your preferences (theme, units, cookie consent choice). This data never leaves your device.</p>
        <p><strong style={{ color: ink }}>Contact Form Messages:</strong> If you submit a contact inquiry, your name, email, topic, and message are temporarily cached in localStorage and delivered via your default email client.</p>
      </Section>

      <Section title="3. Information We Do Not Collect">
        <p>Keyadi does <strong style={{ color: ink }}>not</strong> collect or process: tracking pixels, advertising identifiers, browsing history, social media profiles, financial/payment information, biometric data, or cookies for behavioral advertising.</p>
      </Section>

      <Section title="4. Third-Party Services">
        <p>Keyadi integrates the following third-party services. Each operates under its own privacy policy:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-2">
          <li><strong style={{ color: ink }}>Supabase</strong> — Authentication and database storage for user accounts and saved trackers.</li>
          <li><strong style={{ color: ink }}>Mapbox</strong> — Map rendering, geocoding, and routing. Mapbox processes tile requests which may include viewport coordinates.</li>
          <li><strong style={{ color: ink }}>OpenStreetMap (Overpass API)</strong> — Geospatial venue queries. Search queries include bounding-box coordinates but no personal identifiers.</li>
          <li><strong style={{ color: ink }}>Google Fonts</strong> — Typography delivery. Google may log standard web request metadata (IP address, user agent).</li>
          <li><strong style={{ color: ink }}>Vercel</strong> — Hosting and CDN delivery.</li>
        </ul>
      </Section>

      <Section title="5. How We Use Your Data">
        <p>Your data is used exclusively to: authenticate your account, save and retrieve your trackers, render map search results near your location, and respond to support inquiries. We do not sell, rent, or share your personal data with advertisers or data brokers.</p>
      </Section>

      <Section title="6. Data Retention & Deletion">
        <p>Account data and saved trackers are retained for as long as your account is active. You may request complete data deletion at any time through Settings → Request Data Deletion, or by emailing{' '}
          <a href="mailto:biruk5868@gmail.com" className="text-amber-400 underline decoration-amber-400/40">biruk5868@gmail.com</a>.
          Upon deletion, all associated data (trackers, preferences, account record) will be permanently removed within 30 days.
        </p>
      </Section>

      <Section title="7. Children's Privacy">
        <p>Keyadi is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, please contact us immediately and we will delete the account and associated data.</p>
      </Section>

      <Section title="8. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to: access and receive a copy of your data, correct inaccurate data, request deletion of your data, object to or restrict processing, and withdraw consent. To exercise any of these rights, email{' '}
          <a href="mailto:biruk5868@gmail.com" className="text-amber-400 underline decoration-amber-400/40">biruk5868@gmail.com</a>.
        </p>
      </Section>

      <Section title="9. Security">
        <p>We implement industry-standard security measures including HTTPS encryption, secure authentication via Supabase, HTTP security headers (X-Frame-Options, X-Content-Type-Options, Content-Security-Policy), and input sanitization to protect against XSS and injection attacks.</p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>We may update this Privacy Policy periodically. Material changes will be communicated via a notice on the Keyadi website. Continued use of Keyadi after changes constitutes acceptance of the updated policy.</p>
      </Section>
    </>
  )
}

/* ═══════════════════════ TERMS OF SERVICE ═══════════════════════ */
function TermsOfService() {
  return (
    <>
      <p className="text-sm leading-relaxed mb-8" style={{ color: inkMuted }}>
        <strong style={{ color: ink }}>Effective Date:</strong> September 2026 &nbsp;·&nbsp;
        <strong style={{ color: ink }}>Last Updated:</strong> September 2026
      </p>

      <Section title="1. Acceptance of Terms">
        <p>By accessing or using Keyadi ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, you must discontinue use immediately. The Service is operated by Hawaz Technologies.</p>
      </Section>

      <Section title="2. Description of Service">
        <p>Keyadi is a geospatial search and navigation platform that translates natural language queries into structured geographic searches, providing verified venue data, multimodal routing (driving, walking, cycling), and persistent location-based trackers.</p>
      </Section>

      <Section title="3. Account Registration">
        <p>To access certain features, you must create an account with a valid email address and password. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must notify us immediately of any unauthorized access.</p>
      </Section>

      <Section title="4. Acceptable Use">
        <p>You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to reverse-engineer, decompile, or disassemble any part of the Service; (c) submit false, misleading, or malicious data; (d) attempt to gain unauthorized access to other users' accounts or data; (e) use automated tools to scrape or overload the Service; (f) impersonate another person or entity.</p>
      </Section>

      <Section title="5. Intellectual Property">
        <p>The Keyadi name, logo, design, and source code are the intellectual property of Hawaz Technologies. Map data is sourced from OpenStreetMap (ODbL license) and Mapbox. You may not reproduce, distribute, or create derivative works from the Service without written permission.</p>
      </Section>

      <Section title="6. Pricing & Fees">
        <p>Keyadi is currently offered as a free service. No payment, subscription, or credit card is required. We reserve the right to introduce paid features in the future, which will be clearly communicated with no hidden fees or charges.</p>
      </Section>

      <Section title="7. Data Accuracy Disclaimer">
        <p>Venue information, distances, and routing data are provided on an "as-is" basis. Keyadi sources data from OpenStreetMap and Mapbox, and while we strive for accuracy, we cannot guarantee that all venue details (hours, availability, contact information) are current or correct. Always verify critical information independently.</p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>To the maximum extent permitted by law, Hawaz Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to: reliance on route calculations, venue data inaccuracies, service interruptions, or data loss.</p>
      </Section>

      <Section title="9. Termination">
        <p>We may suspend or terminate your access to the Service at our discretion if you violate these Terms. You may delete your account at any time through Settings. Upon termination, your data will be deleted in accordance with our Privacy Policy.</p>
      </Section>

      <Section title="10. Governing Law">
        <p>These Terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes shall be resolved through good-faith negotiation, and if necessary, through the courts of Addis Ababa, Ethiopia.</p>
      </Section>

      <Section title="11. Changes to Terms">
        <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated effective date. Continued use of Keyadi after changes constitutes acceptance.</p>
      </Section>
    </>
  )
}

/* ═══════════════════════ COOKIE POLICY ═══════════════════════ */
function CookiePolicy() {
  return (
    <>
      <p className="text-sm leading-relaxed mb-8" style={{ color: inkMuted }}>
        <strong style={{ color: ink }}>Effective Date:</strong> September 2026 &nbsp;·&nbsp;
        <strong style={{ color: ink }}>Last Updated:</strong> September 2026
      </p>

      <Section title="1. What Are Cookies">
        <p>Cookies are small text files stored on your device by your web browser. They help websites remember your preferences and improve your experience. Keyadi uses a minimal set of essential storage mechanisms to function properly.</p>
      </Section>

      <Section title="2. How Keyadi Uses Cookies & Local Storage">
        <p>Keyadi primarily uses <strong style={{ color: ink }}>browser localStorage</strong> rather than traditional HTTP cookies. Here is what we store:</p>
        <div className="rounded-2xl border overflow-hidden mt-3" style={{ borderColor: hairline }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <th className="text-left p-3 font-semibold" style={{ color: ink }}>Key</th>
                <th className="text-left p-3 font-semibold" style={{ color: ink }}>Purpose</th>
                <th className="text-left p-3 font-semibold" style={{ color: ink }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['keyadi_settings', 'User preferences (theme, units, map style, default location)', 'Essential'],
                ['keyadi_cookie_consent', 'Records your cookie/storage consent choice', 'Essential'],
                ['keyadi_gemini_key', 'Optional user-provided API key for enhanced AI search', 'Functional'],
                ['keyadi_contact_messages', 'Temporary cache of submitted contact form messages', 'Functional'],
                ['sb-*', 'Supabase authentication session tokens', 'Essential'],
              ].map(([key, purpose, type], i) => (
                <tr key={i} style={{ borderTop: `1px solid ${hairline}` }}>
                  <td className="p-3 font-mono text-amber-400">{key}</td>
                  <td className="p-3" style={{ color: inkMuted }}>{purpose}</td>
                  <td className="p-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: type === 'Essential' ? 'rgba(45,212,191,0.15)' : 'rgba(232,163,61,0.15)',
                        color: type === 'Essential' ? teal : amber,
                      }}
                    >
                      {type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Third-Party Cookies">
        <p>Keyadi does not set any third-party advertising or tracking cookies. However, third-party services we integrate may set their own cookies:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-2">
          <li><strong style={{ color: ink }}>Mapbox</strong> — May set performance cookies for map tile caching.</li>
          <li><strong style={{ color: ink }}>Google Fonts</strong> — May set cookies related to font delivery.</li>
          <li><strong style={{ color: ink }}>Supabase</strong> — Sets authentication session cookies.</li>
        </ul>
      </Section>

      <Section title="4. Managing Cookies">
        <p>You can manage or delete cookies and localStorage data through your browser settings. Note that disabling essential storage may prevent Keyadi from functioning properly (e.g., you may be logged out or lose saved preferences).</p>
        <p>To clear Keyadi-specific data: open your browser Developer Tools → Application → Local Storage → select the Keyadi domain → delete individual keys or clear all.</p>
      </Section>

      <Section title="5. Your Consent">
        <p>When you first visit Keyadi, a consent banner allows you to accept all storage or limit to essential-only. You can change your preference at any time by clearing your browser's localStorage for this site.</p>
      </Section>
    </>
  )
}

/* ═══════════════════════ REFUND POLICY ═══════════════════════ */
function RefundPolicy() {
  return (
    <>
      <p className="text-sm leading-relaxed mb-8" style={{ color: inkMuted }}>
        <strong style={{ color: ink }}>Effective Date:</strong> September 2026
      </p>

      <Section title="1. Free Service">
        <p>Keyadi is provided entirely free of charge. No payments, subscriptions, in-app purchases, or credit card information are collected. There are no hidden fees associated with using any feature of the platform.</p>
      </Section>

      <Section title="2. No Refunds Applicable">
        <p>Since Keyadi does not collect any payments, no refund policy is applicable. If a paid tier is introduced in the future, a comprehensive refund policy will be published before any charges are applied.</p>
      </Section>

      <Section title="3. Contact Us">
        <p>If you have any billing-related questions or concerns, please contact us at{' '}
          <a href="mailto:biruk5868@gmail.com" className="text-amber-400 underline decoration-amber-400/40">biruk5868@gmail.com</a>
          {' '}or call{' '}
          <a href="tel:+251909005450" className="text-emerald-400 underline decoration-emerald-400/40">+251 909 005 450</a>.
        </p>
      </Section>
    </>
  )
}

/* ═══════════════════════ PAGE CONFIG ═══════════════════════ */
const PAGES = {
  privacy: { title: 'Privacy Policy', subtitle: 'How we handle and protect your data', icon: '🔒', Component: PrivacyPolicy },
  terms: { title: 'Terms of Service', subtitle: 'Rules and responsibilities for using Keyadi', icon: '📜', Component: TermsOfService },
  cookies: { title: 'Cookie Policy', subtitle: 'What we store and why', icon: '🍪', Component: CookiePolicy },
  refund: { title: 'Refund Policy', subtitle: 'Our pricing transparency commitment', icon: '💳', Component: RefundPolicy },
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function LegalPages() {
  const location = useLocation()
  const pageKey = location.pathname.replace('/', '')
  const page = PAGES[pageKey]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pageKey])

  if (!page) {
    return (
      <PageBackground showToggle={false}>
        <div className="flex min-h-screen items-center justify-center px-4" style={{ color: ink }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
            <Link to="/" className="text-amber-400 underline">Return to Home</Link>
          </div>
        </div>
      </PageBackground>
    )
  }

  const { title, subtitle, icon, Component } = page

  return (
    <PageBackground showToggle={false}>
      <div
        className="min-h-screen px-4 py-8 sm:py-12 selection:bg-amber-500/20 selection:text-amber-400"
        style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: ink }}
      >
        {/* Top navigation bar */}
        <nav
          className="mx-auto max-w-3xl mb-8 flex items-center justify-between rounded-2xl px-5 py-3 backdrop-blur-2xl border"
          style={{ backgroundColor: cardBg, borderColor: hairline }}
        >
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Return to Keyadi home">
            <KeyadiLogo size={28} />
            <span className="font-bold text-sm" style={{ color: ink }}>Keyadi</span>
          </Link>
          <div className="flex items-center gap-3 text-xs" style={{ color: inkMuted }}>
            <Link to="/" className="hover:text-amber-400 transition" aria-label="Home page">Home</Link>
            <span style={{ color: hairline }}>·</span>
            <span style={{ color: inkFaint }}>{title}</span>
          </div>
        </nav>

        {/* Content card */}
        <article
          className="mx-auto max-w-3xl rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl border"
          style={{ backgroundColor: cardBg, borderColor: hairline }}
        >
          {/* Header */}
          <header className="mb-8 pb-6 border-b" style={{ borderColor: hairline }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: ink }}>{title}</h1>
            </div>
            <p className="text-sm" style={{ color: inkMuted }}>{subtitle}</p>
          </header>

          {/* Legal content */}
          <Component />

          {/* Footer nav */}
          <footer className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: hairline }}>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: inkFaint }}>
              {Object.entries(PAGES).map(([key, p]) => (
                <Link
                  key={key}
                  to={`/${key}`}
                  className={`transition hover:text-amber-400 ${key === pageKey ? 'text-amber-400 font-semibold' : ''}`}
                >
                  {p.title}
                </Link>
              ))}
            </div>
            <Link
              to="/"
              className="rounded-xl px-4 py-2 text-xs font-semibold transition hover:scale-105"
              style={{ backgroundColor: 'rgba(232,163,61,0.15)', color: amber, border: `1px solid rgba(232,163,61,0.3)` }}
            >
              ← Back to Keyadi
            </Link>
          </footer>
        </article>

        {/* Bottom attribution */}
        <div className="mx-auto max-w-3xl mt-6 text-center text-[11px] font-medium tracking-wide" style={{ color: inkFaint }}>
          <span style={{ color: amber }}>Built by HAWAZ TECHNOLOGIES</span>
        </div>
      </div>
    </PageBackground>
  )
}
