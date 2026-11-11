import {expect, test} from '../../fixtures';

test('PathEditor with-clear', async ({page, openStory}) => {
    await openStory('components-patheditor--with-clear');
    await expect(page.getByRole('textbox').first()).toHaveValue('/home/user/projects');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('with-clear.png');
});

test('PathEditor disabled', async ({page, openStory}) => {
    await openStory('components-patheditor--disabled');
    await expect(page.getByRole('textbox')).toBeDisabled();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled.png');
});
