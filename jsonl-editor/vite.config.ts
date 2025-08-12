import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    host: process.env.HOST || 'localhost',
    port: parseInt(process.env.PORT || '5173')
  }
})
