import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './tests/browser',
    testMatch: '**/*.spec.ts',
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    workers: 1,
    timeout: 30_000,
    use: {
        baseURL: 'http://127.0.0.1:4179',
        browserName: 'chromium',
        trace: 'retain-on-failure',
    },
    webServer: {
        command: 'npx vite --config tests/browser/vite.config.ts',
        url: 'http://127.0.0.1:4179',
        reuseExistingServer: false,
        gracefulShutdown: {signal: 'SIGTERM', timeout: 5_000},
    },
});
