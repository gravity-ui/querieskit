import {expect, test} from '../../fixtures';

test('ResizeHandle vertical', async ({page, openStory}) => {
    await openStory('components-resizehandle--vertical');
    await expect(page.getByRole('separator', {name: 'Resize sidebar', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('vertical.png');
});

test('ResizeHandle horizontal', async ({page, openStory}) => {
    await openStory('components-resizehandle--horizontal');
    await expect(page.getByRole('separator', {name: 'Resize results', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('horizontal.png');
});
