import {expect, test} from '../../fixtures';

test('FormField default', async ({page, openStory}) => {
    await openStory('components-formfield--default');
    await expect(page.getByText('Query name', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('FormField disabled', async ({page, openStory}) => {
    await openStory('components-formfield--disabled');
    await expect(page.getByText('Unavailable query name', {exact: true}).first()).toBeVisible();
    await expect(page.getByRole('textbox')).toBeDisabled();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled.png');
});
