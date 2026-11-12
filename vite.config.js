import { defineConfig, loadEnv } from 'vite'
import { readPublicConfig } from './src/lib/publicConfig.js'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode, command }) => {
  if (command === 'build') readPublicConfig(loadEnv(mode, process.cwd(), 'VITE_'));
  return { plugins: [react(), tailwindcss()] };
})
