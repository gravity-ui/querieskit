import {expect, test} from '../../fixtures';

test('ListSpinner default', async ({page, openStory}) => {
    await openStory('components-listspinner--default');
    await expect(page.locator('.qp-list-spinner .g-spin').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});
