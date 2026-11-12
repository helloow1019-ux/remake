import { defineConfig } from 'vite';
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'seed/*'],
      manifest: {
        name: 'ReMake — Waste to Value',
        short_name: 'ReMake',
        description: 'Turn what you throw into what you grow. AI-powered waste upcycling and craft maker.',
        theme_color: '#F4B63F',
        background_color: '#F3E9D2',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/ideas(\/.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-ideas-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400, // 1 day
              },
            },
          },
          {
            urlPattern: /^\/api\/waste-types$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-waste-types-cache',
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
