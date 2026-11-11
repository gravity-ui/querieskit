import {expect, test} from '../../fixtures';

test('metadata groups', async ({page, openStory}) => {
    await openStory('modules-navigationmeta--default');
    await expect(page.getByText('robot-yt', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('metadata-groups.png');
});

test('empty metadata', async ({page, openStory}) => {
    await openStory('modules-navigationmeta--empty');
    await expect(page.getByText('No data', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-metadata.png');
});

test('metadata error', async ({page, openStory}) => {
    await openStory('modules-navigationmeta--error');
    await expect(page.getByText('Failed to load table metadata', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('metadata-error.png');
});
