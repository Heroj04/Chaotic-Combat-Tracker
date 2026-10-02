import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'apple-touch-icon.png',
        'pwa-icon-192.png',
        'pwa-icon-512.png',
        'pwa-icon.svg',
      ],
      manifest: {
        name: 'Chaotic Combat Tracker',
        short_name: 'Combat Tracker',
        description: 'Face-to-face creature stat tracking for Chaotic TCG.',
        theme_color: '#192724',
        background_color: '#dce9df',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,wasm,css,html,ico,png,svg,webmanifest,woff2}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
