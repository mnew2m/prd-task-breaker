import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['node_modules', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/main.ts',
        'src/**/*.d.ts',
        'src/assets/**',
        'src/api/analysisApi.ts',      // 모든 테스트에서 mock 처리 — 직접 호출되지 않음
        'src/composables/usePdfExport.ts', // jsPDF DOM 의존 — jsdom에서 단위 테스트 불가
      ],
      thresholds: {
        lines: 70,
        functions: 65,
        branches: 85,
      },
    },
  }
})
