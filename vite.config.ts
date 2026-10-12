import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  void loadEnv(mode, '.', 'VITE_');
  return {
    base: './',
    server: {
      port: parseInt(process.env.PORT || '3000'),
      host: '127.0.0.1',
    },
    plugins: [react()],
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@supabase') || id.includes('dexie')) {
                return 'vendor-db';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              return 'vendor-libs';
            }
          }
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
    define: {
      // NOTE: 서버 비밀(GEMINI_API_KEY 등)은 클라이언트 번들에 굽지 않음.
      // AI 호출은 /api 프록시経由. 필요시 VITE_ 공개키만 사용.
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
