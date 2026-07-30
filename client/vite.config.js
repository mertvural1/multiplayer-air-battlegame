import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: "https://multiplayer-air-battlegame-2.onrender.com/",
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          socket: ['socket.io-client'],
        },
      },
    },
  },
});
