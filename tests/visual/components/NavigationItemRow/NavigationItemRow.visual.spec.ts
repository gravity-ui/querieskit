import {expect, test} from '../../fixtures';

test('NavigationItemRow default', async ({page, openStory}) => {
    await openStory('components-navigationitemrow--default');
    await expect(page.getByText('Events', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('NavigationItemRow disabled', async ({page, openStory}) => {
    await openStory('components-navigationitemrow--disabled');
    await expect(page.getByRole('button', {name: 'Open table', exact: true})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Open table'})).toBeDisabled();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled.png');
});

test('NavigationItemRow broken-link', async ({page, openStory}) => {
    await openStory('components-navigationitemrow--broken-link');
    await expect(page.getByText('Missing destination', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('broken-link.png');
});
