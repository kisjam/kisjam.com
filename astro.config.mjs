import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'

// SCSS の "@assets/..." を src/assets/ に解決する Sass importer。
// (Astro 6 / 新Vite は tsconfig paths を Sass の @forward 解決に使わないため明示)
const assetsUrl = new URL('./src/assets/', import.meta.url)

export default defineConfig({
  site: 'https://kisjam.com',
  // Markdown内の画像をレスポンシブ化(srcset複数幅を自動生成)
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
