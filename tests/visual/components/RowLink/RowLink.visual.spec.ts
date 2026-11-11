import {expect, test} from '../../fixtures';

test('RowLink default', async ({page, openStory}) => {
    await openStory('components-rowlink--default');
    await expect(page.getByRole('link', {name: 'Open saved query', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('RowLink disabled', async ({page, openStory}) => {
    await openStory('components-rowlink--disabled');
    await expect(page.getByText('Unavailable saved query', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled.png');
});
