import {expect, test} from '../../fixtures';
test('parameters view', async ({page, openStory}) => {
    await openStory('modules-queryparameters--default');
    await expect(page.getByRole('button', {name: 'Edit', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toContainText('limit');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('view.png');
});
test('editing parameters', async ({page, openStory}) => {
    await openStory('modules-queryparameters--default');
    await page.getByRole('button', {name: 'Edit', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Save', exact: true})).toBeVisible();
    await expect(
        page.getByRole('button', {name: 'Parameter actions: $limit', exact: true}),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('editing.png');
});
test('empty parameters', async ({page, openStory}) => {
    await openStory('modules-queryparameters--empty');
    await expect(page.getByText('No parameters', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty.png');
});
