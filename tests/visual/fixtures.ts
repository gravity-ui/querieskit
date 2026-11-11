import {test as base, expect} from '@playwright/test';

export const test = base.extend<{openStory: (id: string) => Promise<void>}>({
    openStory: async ({page}, provide, testInfo) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));

        await provide(async (id) => {
            // Keep Date deterministic without freezing timers needed by Monaco/React.
            await page.clock.setFixedTime(new Date('2026-11-01T12:00:00Z'));
            const theme = testInfo.project.name;
            const params = new URLSearchParams({
                id,
                viewMode: 'story',
                globals: `theme:${theme};locale:en`,
            });
            await page.goto(`/iframe.html?${params}`);
            await expect(page.locator('#storybook-root')).not.toBeEmpty();
            await expect(page.locator('body')).toHaveClass(new RegExp(`g-root_theme_${theme}`));
            await page.evaluate(() => document.fonts.ready);
        });

        expect(errors, 'Story must render without uncaught JavaScript errors').toEqual([]);
    },
});

export {expect} from '@playwright/test';
