import { defineConfig } from 'vite'

export default defineConfig({
  base: '/dhbw-lernportal/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
})
