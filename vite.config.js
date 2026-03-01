import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), ViteImageOptimizer({})],
  server: {
    allowedHosts: ["5173-madsykle-netflyer-cs1fk0456er.ws-us121.gitpod.io"],
  },

})
