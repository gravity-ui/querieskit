import {expect, test} from '../../fixtures';

test('EmptyContent no-data', async ({page, openStory}) => {
    await openStory('components-emptycontent--no-data');
    await expect(page.getByText('No data', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('no-data.png');
});

test('EmptyContent nothing-found', async ({page, openStory}) => {
    await openStory('components-emptycontent--nothing-found');
    await expect(page.getByText('Nothing found', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('nothing-found.png');
});

test('EmptyContent custom-message', async ({page, openStory}) => {
    await openStory('components-emptycontent--custom-message');
    await expect(page.getByText('No reports yet', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('custom-message.png');
});
