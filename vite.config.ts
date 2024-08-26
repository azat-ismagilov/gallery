import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import dataRawPlugin from "vite-raw-plugin"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    dataRawPlugin({
      fileRegex: /\.(?:team|event|people)$/,
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    target: "esnext",
    emptyOutDir: true,
    outDir: process.env.PUBLIC_URL,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("react")) {
            return "r";
          }
        },
      },
    },
  },
  assetsInclude: ['**/*.svg'],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  define: {
    'process.env.VITE_DATA_FOLDER': JSON.stringify(process.env.VITE_DATA_FOLDER || 'data')
  }
})
