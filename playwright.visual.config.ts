import {defineConfig} from '@playwright/test';

const inContainer = process.env.VISUAL_CONTAINER === '1';
if (inContainer && (process.platform !== 'linux' || process.arch !== 'x64')) {
    throw new Error('Canonical visual snapshots require the linux/amd64 container.');
}

// Native runs are useful for debugging, but must never overwrite CI's Linux baselines.
const snapshotPathTemplate = inContainer
    ? '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-chromium-linux{ext}'
    : `{testDir}/__screenshots__/local-${process.platform}-${process.arch}/{projectName}/{testFilePath}/{arg}{ext}`;
const baseURL = process.env.VISUAL_BASE_URL || 'http://127.0.0.1:6016';

export default defineConfig({
    testDir: './tests/visual',
    testMatch: '**/*.spec.ts',
    outputDir: './test-results/visual',
    snapshotPathTemplate,
    updateSnapshots: 'none',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    workers: 2,
    retries: process.env.CI ? 1 : 0,
    timeout: 30_000,
    expect: {
        timeout: 10_000,
        toHaveScreenshot: {animations: 'disabled', caret: 'hide', scale: 'css'},
    },
    reporter: [['list'], ['html', {outputFolder: 'playwright-report/visual', open: 'never'}]],
    use: {
        baseURL,
        browserName: 'chromium',
        viewport: {width: 1280, height: 900},
        deviceScaleFactor: 1,
        locale: 'en-US',
        timezoneId: 'UTC',
        reducedMotion: 'reduce',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {name: 'light', use: {colorScheme: 'light'}},
        {name: 'dark', use: {colorScheme: 'dark'}},
    ],
    // An explicitly selected existing Storybook is owned by its caller. Otherwise
    // Playwright owns the static preview process and shuts it down after the run.
    webServer: process.env.VISUAL_BASE_URL
        ? undefined
        : {
              command: 'node scripts/serve-visual-storybook.mjs',
              url: `${baseURL}/index.json`,
              reuseExistingServer: false,
              gracefulShutdown: {signal: 'SIGTERM', timeout: 5_000},
          },
});
