import {access} from 'node:fs/promises';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {preview} from 'vite';

await access(new URL('../storybook-static/index.json', import.meta.url));
const server = await preview({
    configFile: false,
    root: fileURLToPath(new URL('../', import.meta.url)),
    build: {outDir: 'storybook-static'},
    preview: {host: '127.0.0.1', port: 6016, strictPort: true},
});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
        server.httpServer.close(() => process.exit(0));
        server.httpServer.closeAllConnections();
    });
}
