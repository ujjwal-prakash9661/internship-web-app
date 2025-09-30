import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'InternRadar - Find Your Perfect Internship',
        short_name: 'InternRadar',
        description: 'A modern platform to discover and apply for internship opportunities',
        theme_color: '#1e40af',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon.ico',
            sizes: '32x32',
            type: 'image/x-icon'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Don't cache authentication related requests
        navigateFallbackDenylist: [/^\/api\/auth/, /github\.com/, /login/, /callback/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/internship-web-app-42i2\.onrender\.com\/api\/internships/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-internships',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/internship-web-app-42i2\.onrender\.com\/api\/applications/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-applications',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 12 // 12 hours
              }
            }
          },
          // Never cache auth endpoints - always go to network
          {
            urlPattern: /^https:\/\/internship-web-app-42i2\.onrender\.com\/api\/auth/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /github\.com/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\/login|\/callback|\/oauth/,
            handler: 'NetworkOnly'
          },
          // Static assets
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|woff|woff2|ttf|eot)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources'
            }
          }
        ]
      }
    })
  ],
})

