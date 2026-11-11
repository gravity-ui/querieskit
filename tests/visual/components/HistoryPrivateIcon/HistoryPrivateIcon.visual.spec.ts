import {expect, test} from '../../fixtures';

test('HistoryPrivateIcon public', async ({page, openStory}) => {
    await openStory('components-historyprivateicon--public');
    await expect(page.locator('.qp-history-private-icon_open').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('public.png');
});

test('HistoryPrivateIcon private', async ({page, openStory}) => {
    await openStory('components-historyprivateicon--private');
    await expect(page.locator('.qp-history-private-icon').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('private.png');
});
