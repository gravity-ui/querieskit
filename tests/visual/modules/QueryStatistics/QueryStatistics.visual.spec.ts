import {expect, test} from '../../fixtures';

test('statistics tree', async ({page, openStory}) => {
    await openStory('modules-querystatistics--default');
    await expect(page.getByText('Input', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('statistics-tree.png');
});

test('configured statistics columns', async ({page, openStory}) => {
    await openStory('modules-querystatistics--configured-columns');
    await expect(page.getByText('Latest value', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
        'configured-statistics-columns.png',
    );
});

test('virtual statistics table', async ({page, openStory}) => {
    await openStory('modules-querystatistics--virtual-and-fixed');
    await expect(
        page.getByText('Group 1 with a deliberately long name for horizontal scrolling', {
            exact: true,
        }),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('virtual-statistics-table.png');
});
