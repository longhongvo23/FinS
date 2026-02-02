import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 2302,
        strictPort: true,
        host: 'localhost',
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-query': ['@tanstack/react-query'],
                    'vendor-ui': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-select',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-tooltip',
                        '@radix-ui/react-switch',
                        '@radix-ui/react-radio-group',
                        '@radix-ui/react-slot',
                    ],
                    'vendor-charts': ['recharts', 'lightweight-charts'],
                    'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
                    'vendor-icons': ['lucide-react'],
                },
            },
        },
    },
});
