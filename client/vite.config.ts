import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// As variáveis __filename e __dirname não estão disponíveis em módulos ES
// como este arquivo de configuração. Precisamos defini-las manualmente.
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    fs: {
      strict: false,
      allow: ['/app/client', '/src']
    },
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias para /app/client/src
      '@shared': path.resolve(__dirname, '../shared'), // *** NOVO ALIAS AQUI *** para /app/shared
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
