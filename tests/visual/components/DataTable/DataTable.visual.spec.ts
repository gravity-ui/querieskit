import {expect, test} from '../../fixtures';

test('DataTable default', async ({page, openStory}) => {
    await openStory('components-datatable--default');
    await expect(page.getByText('orders.csv', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('DataTable empty', async ({page, openStory}) => {
    await openStory('components-datatable--empty');
    await expect(page.getByText('No data', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty.png');
});

test('DataTable empty-nothing-found', async ({page, openStory}) => {
    await openStory('components-datatable--empty-nothing-found');
    await expect(page.getByText('Nothing found', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-nothing-found.png');
});
