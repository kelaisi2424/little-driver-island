import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // 把 Three.js 拆成独立 chunk，让首屏不强制下载 1MB
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'three';
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('react')) return 'react';
          }
          // 关卡 3D 渲染相关 → 进游戏时再下载
          if (id.includes('/src/three/') || id.includes('/src/components/game3d/')) {
            return 'game3d';
          }
        },
      },
    },
  },
});
