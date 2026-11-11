import {expect, test} from '../../fixtures';

test('table preview', async ({page, openStory}) => {
    await openStory('modules-navigationpreview--default');
    await expect(page.getByRole('cell', {name: /First row/})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('table-preview.png');
});

test('typed values', async ({page, openStory}) => {
    await openStory('modules-navigationpreview--typed-values');
    await expect(page.getByRole('cell', {name: /42\.5/})).toBeVisible();
    await expect(page.locator('.qp-navigation-preview table tbody tr')).not.toHaveCount(0);
    await expect(page.locator('#storybook-root')).toHaveScreenshot('typed-values.png');
});

test('preview error', async ({page, openStory}) => {
    await openStory('modules-navigationpreview--error');
    await expect(page.getByText('Failed to load table preview', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('preview-error.png');
});
