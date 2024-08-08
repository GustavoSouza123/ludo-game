import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/ludo-game/',
    build: {
        outDir: './build',
        emptyOutDir: true,
    },
});
