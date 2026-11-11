import {expect, test} from '../../fixtures';

test('expanded section', async ({page, openStory}) => {
    await openStory('modules-navigationview--default');
    await expect(page.getByText('field_1', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('expanded-section.png');
});

test('filtered section', async ({page, openStory}) => {
    await openStory('modules-navigationview--search');
    await expect(page.getByText('field_2', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('filtered-section.png');
});

test('view error', async ({page, openStory}) => {
    await openStory('modules-navigationview--error');
    await expect(page.getByText('Failed to load view', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('view-error.png');
});
