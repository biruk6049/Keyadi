import { Link } from 'react-router-dom'
import { MapIcon, SearchIcon, BookmarkIcon, UserIcon, PinIcon } from './Icons'

export default function MobileBottomNav({
  activeTab = 'map',
  onTabChange,
  trackerCount = 0,
  isDark = true,
}) {
  const amber = '#e8a33d'
  const ink = isDark ? '#f3f1ec' : '#100e0b'
  const inkMuted = isDark ? 'rgba(243,241,236,0.55)' : 'rgba(16,14,11,0.5)'
  const hairline = isDark ? 'rgba(243,241,236,0.12)' : 'rgba(16,14,11,0.10)'

  const tabs = [
    {
      id: 'map',
      label: 'Map',
      icon: <MapIcon size={19} color={activeTab === 'map' ? amber : inkMuted} />,
    },
    {
      id: 'places',
      label: 'Places',
      icon: <PinIcon size={19} color={activeTab === 'places' ? amber : inkMuted} />,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: <BookmarkIcon size={19} color={activeTab === 'saved' ? amber : inkMuted} />,
      badge: trackerCount > 0 ? trackerCount : null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <UserIcon size={19} color={activeTab === 'settings' ? amber : inkMuted} />,
      isLink: true,
      to: '/settings',
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around px-3 py-2 shadow-2xl backdrop-blur-2xl border-t pointer-events-auto"
      style={{
        backgroundColor: isDark ? 'rgba(12, 11, 9, 0.94)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: hairline,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        if (tab.isLink) {
          return (
            <Link
              key={tab.id}
              to={tab.to}
              className="relative flex flex-1 flex-col items-center justify-center py-1 transition-all"
              style={{ color: isActive ? amber : inkMuted }}
            >
              <div
                className="flex h-8 w-12 items-center justify-center rounded-full transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(232, 163, 61, 0.16)' : 'transparent',
                }}
              >
                {tab.icon}
              </div>
              <span
                className="text-[10px] font-medium tracking-tight mt-0.5"
                style={{ color: isActive ? amber : inkMuted, fontFamily: "'Outfit', sans-serif" }}
              >
                {tab.label}
              </span>
            </Link>
          )
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange && onTabChange(tab.id)}
            className="relative flex flex-1 flex-col items-center justify-center py-1 transition-all"
            style={{ color: isActive ? amber : inkMuted }}
          >
            <div
              className="relative flex h-8 w-12 items-center justify-center rounded-full transition-all"
              style={{
                backgroundColor: isActive ? 'rgba(232, 163, 61, 0.16)' : 'transparent',
              }}
            >
              {tab.icon}
              {tab.badge && (
                <span
                  className="absolute -top-0.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold"
                  style={{ backgroundColor: amber, color: '#100e0b' }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-medium tracking-tight mt-0.5"
              style={{ color: isActive ? amber : inkMuted, fontFamily: "'Outfit', sans-serif" }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
