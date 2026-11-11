import {expect, test} from '../../fixtures';

test('Breadcrumbs default', async ({page, openStory}) => {
    await openStory('components-breadcrumbs--default');
    await expect(page.locator('.qp-breadcrumbs').first()).toBeVisible();
    await expect(page.getByText('events', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('Breadcrumbs long-path', async ({page, openStory}) => {
    await openStory('components-breadcrumbs--long-path');
    await expect(page.locator('.qp-breadcrumbs').first()).toBeVisible();
    await expect(page.getByText('events', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('long-path.png');
});
