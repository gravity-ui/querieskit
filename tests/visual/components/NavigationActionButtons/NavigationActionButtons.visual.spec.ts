import {expect, test} from '../../fixtures';

test('NavigationActionButtons default', async ({page, openStory}) => {
    await openStory('components-navigationactionbuttons--default');
    await expect(page.getByRole('button', {name: 'Open table', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('NavigationActionButtons disabled', async ({page, openStory}) => {
    await openStory('components-navigationactionbuttons--disabled');
    await expect(page.getByRole('button', {name: 'Open table'})).toBeDisabled();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled.png');
});
