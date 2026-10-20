import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [svgr({include: /@gravity-ui\/icons\/.*\.svg(?:\?.*)?$/})],
    optimizeDeps: {include: ['react/jsx-runtime', 'react/jsx-dev-runtime']},
    root: fileURLToPath(new URL('./fixture', import.meta.url)),
    server: {
        host: '127.0.0.1',
        port: 4179,
        strictPort: true,
        fs: {allow: [fileURLToPath(new URL('../..', import.meta.url))]},
    },
});
