import {expect, test} from '../../fixtures';

test('QueryStatusIcon completed', async ({page, openStory}) => {
    await openStory('components-querystatusicon--completed');
    await expect(page.locator('.qp-query-status-icon_completed').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('completed.png');
});

test('QueryStatusIcon all-statuses', async ({page, openStory}) => {
    await openStory('components-querystatusicon--all-statuses');
    await expect(page.locator('.qp-query-status-icon')).toHaveCount(4);
    await expect(page.locator('.g-spin').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('all-statuses.png');
});
