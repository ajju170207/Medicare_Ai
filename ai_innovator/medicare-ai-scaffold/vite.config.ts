import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Medicare AI',
        short_name: 'Medicare AI',
        description: 'AI-powered health companion for India',
        theme_color: '#0057D9',
        background_color: '#F7F9FC',
        display: 'standalone',
        start_url: '/dashboard',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Cache disease library + emergency data for offline access
        runtimeCaching: [
          {
            urlPattern: /\/api\/diseases/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'disease-library', expiration: { maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: /\/api\/emergency\/national/,
            handler: 'CacheFirst',
            options: { cacheName: 'emergency-national', expiration: { maxAgeSeconds: 604800 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:    ['react', 'react-dom', 'react-router-dom'],
          antd:      ['antd', '@ant-design/icons'],
          radix:     ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-accordion'],
          query:     ['@tanstack/react-query'],
          i18n:      ['i18next', 'react-i18next'],
        },
      },
    },
  },
})
