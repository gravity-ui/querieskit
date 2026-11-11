import {expect, test} from '../../fixtures';

test('ErrorTree default', async ({page, openStory}) => {
    await openStory('components-errortree--default');
    await expect(
        page.getByText('Missing value for parameter: $h', {exact: true}).first(),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('ErrorTree narrow', async ({page, openStory}) => {
    await openStory('components-errortree--narrow');
    await expect(
        page.getByText('Missing value for parameter: $h', {exact: true}).first(),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('narrow.png');
});
