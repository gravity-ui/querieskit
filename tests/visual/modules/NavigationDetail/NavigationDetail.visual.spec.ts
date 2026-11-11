import {expect, test} from '../../fixtures';

test('schema tab', async ({page, openStory}) => {
    await openStory('modules-navigationdetail--default');
    await expect(page.getByText('Schema content', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('schema-tab.png');
});

test('preview tab', async ({page, openStory}) => {
    await openStory('modules-navigationdetail--default');
    await page.getByRole('radio', {name: 'Preview', exact: true}).check();
    await expect(page.getByText('Preview content', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('preview-tab.png');
});

test('no available tabs', async ({page, openStory}) => {
    await openStory('modules-navigationdetail--dynamic-tabs');
    await expect(page.locator('.qp-navigation-detail')).toBeVisible();
    await expect(page.locator('.qp-navigation-detail')).toContainText('No available tabs');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('no-available-tabs.png');
});
