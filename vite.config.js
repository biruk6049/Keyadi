import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nominatim/, ''),
        headers: {
          'User-Agent': 'KeyadiPlaceTracker/2.0 (contact@keyadi.app)',
        },
      },
    },
    fs: {
      strict: true,
      deny: ['.env', '.env.*', '*.key'],
    },
  },
})
