import {expect, test} from '../../fixtures';

test('sidebar and workspace', async ({page, openStory}) => {
    await openStory('modules-querypagelayout--single-workspace');
    await expect(page.getByRole('textbox', {name: 'Find a query', exact: true})).toBeVisible();
    await expect(page.getByRole('textbox', {name: 'Query text', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('sidebar-and-workspace.png');
});

test('custom header', async ({page, openStory}) => {
    await openStory('modules-querypagelayout--custom-header');
    await expect(page.getByText('Sidebar visible', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('custom-header.png');
});

test('collapsed sidebar', async ({page, openStory}) => {
    await openStory('modules-querypagelayout--controlled');
    await page.getByRole('button', {name: 'Toggle sidebar externally', exact: true}).click();
    await expect(page.getByRole('textbox', {name: 'Find a query', exact: true})).toBeHidden();
    await expect(page.getByRole('button', {name: 'Show sidebar', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('collapsed-sidebar.png');
});
