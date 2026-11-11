import {expect, test} from '../../fixtures';

test('SearchWithButtons default', async ({page, openStory}) => {
    await openStory('components-searchwithbuttons--default');
    await expect(page.locator('.qp-search-with-buttons').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('SearchWithButtons with-both-slots', async ({page, openStory}) => {
    await openStory('components-searchwithbuttons--with-both-slots');
    await expect(page.locator('.qp-search-with-buttons').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('with-both-slots.png');
});
