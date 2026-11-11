import {expect, test} from '../../fixtures';

test('SimpleForm default', async ({page, openStory}) => {
    await openStory('components-simpleform--default');
    await expect(page.getByText('Dialect', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('SimpleForm with-initial-values', async ({page, openStory}) => {
    await openStory('components-simpleform--with-initial-values');
    await expect(page.getByText('Dialect', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('with-initial-values.png');
});
