import {expect, test} from '../../fixtures';
test('saved list', async ({page, openStory}) => {
    await openStory('modules-savedqueries--default');
    await expect(page.getByText('Daily conversion report', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('list.png');
});
test('empty saved list', async ({page, openStory}) => {
    await openStory('modules-savedqueries--empty');
    await expect(page.getByText('No saved queries', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty.png');
});
test('full text search', async ({page, openStory}) => {
    await openStory('modules-savedqueries--default');
    await page.getByRole('textbox').fill('session_id');
    await expect(page.getByText('Nothing found', {exact: true})).toBeVisible();
    await page.getByRole('button', {name: 'Search in query text'}).click();
    await expect(page.getByText('Daily conversion report', {exact: true})).toBeVisible();
    await expect(page.locator('.monaco-editor .view-lines').first()).toContainText('SELECT');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('fulltext.png');
});
