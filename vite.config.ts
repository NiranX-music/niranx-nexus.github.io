import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        id: '/niranx/',
        name: 'NiranX StudyVerse',
        short_name: 'NiranX',
        description: 'Your Ultimate Study Companion - AI-powered learning, focus tools, and productivity features',
        theme_color: '#7c3aed',
        background_color: '#0a0a0a',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'window-controls-overlay'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['education', 'productivity', 'utilities'],
        prefer_related_applications: false,
        iarc_rating_id: '045e3ded-fbb4-4ae8-afac-6d2c9821e0e5',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon'
          }
        ],
        screenshots: [
          {
            src: 'logo.jpg',
            sizes: '1280x720',
            type: 'image/jpeg',
            form_factor: 'wide',
            label: 'NiranX Dashboard'
          },
          {
            src: 'logo.jpg',
            sizes: '750x1334',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'NiranX Mobile View'
          }
        ],
        shortcuts: [
          {
            name: 'Focus Engine',
            url: '/niranx/focus-engine',
            description: 'Start a focus session',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Tasks',
            url: '/niranx/tasks',
            description: 'View your tasks',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'AI Solver',
            url: '/niranx/ai-solver',
            description: 'Get AI help with problems',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(pdf|mp4|mp3)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'study-materials',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
