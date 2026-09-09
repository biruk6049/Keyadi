import { useState, useEffect } from 'react'
import {
  SunIcon,
  CloudSunIcon,
  CloudIcon,
  RainIcon,
  SnowIcon,
  StormIcon,
  FogIcon,
  WindIcon,
  DropletIcon,
} from './Icons'

/**
 * Floating weather widget for the map area.
 * Uses the free Open-Meteo API (no key needed).
 * 100% vector SVG icons, no emojis.
 */

function getWeatherIcon(code, isDark) {
  const amber = '#e8a33d'
  const lightBlue = '#38bdf8'
  const muted = isDark ? 'rgba(243,241,236,0.7)' : 'rgba(16,14,11,0.6)'

  if (code === 0) return { icon: <SunIcon size={22} color={amber} />, label: 'Clear sky' }
  if (code === 1) return { icon: <CloudSunIcon size={22} color={amber} />, label: 'Mainly clear' }
  if (code === 2) return { icon: <CloudSunIcon size={22} color={amber} />, label: 'Partly cloudy' }
  if (code === 3) return { icon: <CloudIcon size={22} color={muted} />, label: 'Overcast' }
  if (code === 45 || code === 48) return { icon: <FogIcon size={22} color={muted} />, label: 'Foggy' }
  if (code >= 51 && code <= 67) return { icon: <RainIcon size={22} color={lightBlue} />, label: 'Rain' }
  if (code >= 71 && code <= 77) return { icon: <SnowIcon size={22} color={lightBlue} />, label: 'Snow' }
  if (code >= 80 && code <= 82) return { icon: <RainIcon size={22} color={lightBlue} />, label: 'Showers' }
  if (code >= 95) return { icon: <StormIcon size={22} color={amber} />, label: 'Thunderstorm' }

  return { icon: <CloudSunIcon size={22} color={amber} />, label: 'Fair' }
}

export default function WeatherWidget({ lat, lng, isDark = true }) {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (lat == null || lng == null) return

    let cancelled = false

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`
        )
        if (!res.ok) throw new Error(res.status)
        const data = await res.json()
        if (!cancelled && data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
            wind: Math.round(data.current.wind_speed_10m),
            humidity: data.current.relative_humidity_2m,
          })
          setError(false)
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 15 * 60 * 1000) // every 15 min
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [lat, lng])

  if (error || !weather) return null

  const { icon, label } = getWeatherIcon(weather.code, isDark)

  const bg = isDark ? 'rgba(16,14,11,0.65)' : 'rgba(255,255,255,0.7)'
  const border = isDark ? 'rgba(243,241,236,0.14)' : 'rgba(16,14,11,0.12)'
  const ink = isDark ? '#f3f1ec' : '#100e0b'
  const muted = isDark ? 'rgba(243,241,236,0.55)' : 'rgba(16,14,11,0.5)'

  return (
    <div
      className="absolute bottom-20 md:bottom-6 left-3 md:left-auto md:right-20 z-20 flex items-center gap-2 md:gap-3 rounded-2xl border px-2.5 py-1.5 md:px-3.5 md:py-2.5 shadow-lg backdrop-blur-xl pointer-events-auto transition-all"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      <div className="flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs md:text-sm font-semibold leading-tight" style={{ color: ink }}>
          {weather.temp}°C
        </p>
        <p className="text-[9px] md:text-[10px] font-medium leading-tight tracking-wide" style={{ color: muted }}>
          {label}
        </p>
      </div>
      <div
        className="hidden sm:block ml-1 border-l pl-2.5 space-y-0.5"
        style={{ borderColor: border }}
      >
        <div className="flex items-center gap-1.5 text-[10px] leading-tight" style={{ color: muted }}>
          <WindIcon size={11} color={muted} />
          <span>{weather.wind} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] leading-tight" style={{ color: muted }}>
          <DropletIcon size={11} color={muted} />
          <span>{weather.humidity}%</span>
        </div>
      </div>
    </div>
  )
}
