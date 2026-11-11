import {expect, test} from '../../fixtures';

test('mixed navigation items', async ({page, openStory}) => {
    await openStory('modules-navigationitemslist--default');
    await expect(page.getByText('Private dataset', {exact: true})).toBeVisible();
    await expect(page.getByText('Reports', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('mixed-items.png');
});

test('item descriptions', async ({page, openStory}) => {
    await openStory('modules-navigationitemslist--descriptions');
    await expect(page.getByText('Location: /analytics/events', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('item-descriptions.png');
});

test('empty directory with parent row', async ({page, openStory}) => {
    await openStory('modules-navigationitemslist--empty');
    await expect(page.getByText('This directory is empty', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-directory.png');
});

test('empty search without parent row', async ({page, openStory}) => {
    await openStory('modules-navigationitemslist--empty-search');
    await expect(page.getByText('No matching files', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-search.png');
});
