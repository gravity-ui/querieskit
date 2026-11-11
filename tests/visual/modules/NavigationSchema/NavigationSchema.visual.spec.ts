import {expect, test} from '../../fixtures';

test('table schema', async ({page, openStory}) => {
    await openStory('modules-navigationschema--default');
    await expect(page.getByText('Unique record identifier', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('table-schema.png');
});

test('custom schema columns', async ({page, openStory}) => {
    await openStory('modules-navigationschema--custom-columns');
    await expect(page.getByRole('columnheader', {name: 'Lock', exact: true})).toBeVisible();
    await expect(page.getByText('shared', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('custom-schema-columns.png');
});

test('schema error', async ({page, openStory}) => {
    await openStory('modules-navigationschema--error');
    await expect(page.getByText('Failed to load table schema', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('schema-error.png');
});
