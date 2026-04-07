import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  server: {
    cors: { origin: '*' },
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  plugins: [
    react(),
    crx({ manifest }),
  ],
})
