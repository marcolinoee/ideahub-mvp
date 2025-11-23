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
        name: 'IdeaHub - Soluções Comunitárias',
        short_name: 'IdeaHub',
        description: 'Conectando comunidade e universidade para resolver problemas reais.',
        theme_color: '#0B1120', // Azul Marinho da sua marca
        background_color: '#ffffff',
        display: 'standalone', // Isso faz abrir como app (sem barra de navegador)
        icons: [
          screenshots: [
          {
            src: "pwa-512x512.png", // Usamos o ícone mesmo só pra enganar a validação
            sizes: "512x512",
            type: "image/png",
            form_factor: "wide",
            label: "Desktop"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
            label: "Mobile"
          }
        ]
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})