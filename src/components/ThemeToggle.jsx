export default function ThemeToggle({ isDark, onToggle }) {
    return (
        <button
            onClick={onToggle}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            style={{
                borderColor: isDark ? 'rgba(243,241,236,0.18)' : 'rgba(16,14,11,0.15)',
                color: isDark ? '#f3f1ec' : '#100e0b',
                backgroundColor: isDark ? 'rgba(243,241,236,0.04)' : 'rgba(16,14,11,0.03)',
            }}
        >
            {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="4.2" />
                    <path d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" strokeLinecap="round" />
                </svg>
            ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>
    )
}