import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'IdeaHub',
        short_name: 'IdeaHub',
        description: 'Conectando comunidade e universidade.',
        theme_color: '#0B1120',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png', // Adicionamos a barra / no inicio
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png', // Adicionamos a barra / no inicio
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
            label: "Desktop"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
            label: "Mobile"
          }
        ]
      }
    })
  ],
})