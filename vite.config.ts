import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  build: {
    // three.js in the lazy-loaded Stage3D chunk is ~655 kB minified and
    // can't be split further; keep the warning useful for other chunks.
    chunkSizeWarningLimit: 700,
  },
})
