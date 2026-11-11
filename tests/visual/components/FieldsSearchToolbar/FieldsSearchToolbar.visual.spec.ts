import {expect, test} from '../../fixtures';

test('FieldsSearchToolbar default', async ({page, openStory}) => {
    await openStory('components-fieldssearchtoolbar--default');
    await expect(page.getByRole('textbox').first()).toHaveValue('');
    await expect(
        page.getByRole('button', {name: 'Configure visible fields', exact: true}),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('FieldsSearchToolbar search-only', async ({page, openStory}) => {
    await openStory('components-fieldssearchtoolbar--search-only');
    await expect(page.getByRole('textbox').first()).toHaveValue('customer');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('search-only.png');
});
