import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import sitemap from '@astrojs/sitemap'

const assetsUrl = new URL('./src/assets/', import.meta.url)

export default defineConfig({
  site: 'https://kisjam.com',
  integrations: [sitemap()],
  image: {
    layout: 'constrained',
  },
  vite: {
    resolve: {
      alias: {
        '@assets': fileURLToPath(assetsUrl),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          importers: [
            {
              findFileUrl(url) {
                if (!url.startsWith('@assets/')) return null
                return new URL(url.slice('@assets/'.length), assetsUrl)
              },
            },
          ],
        },
      },
    },
  },
})
