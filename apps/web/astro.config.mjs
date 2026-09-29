import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'
import path from 'path'

export default defineConfig({
  site: 'https://taas-s-ekpaye.vercel.app',
  output: 'static',
  prefetch: { defaultStrategy: 'hover' },
  adapter: vercel(),
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    ssr: {
      // Bundle (and tree-shake) the icon set into the server build instead of
      // loading its ~3,300-icon index at runtime, which slowed function cold starts.
      noExternal: ['@icons-pack/react-simple-icons'],
    },
    optimizeDeps: {
      // Force re-optimization when workspace deps change
      include: ['@portfolio/shared'],
    },
  },
})
