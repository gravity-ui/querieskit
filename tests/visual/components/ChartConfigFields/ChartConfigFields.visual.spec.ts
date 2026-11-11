import {expect, test} from '../../fixtures';

test('ChartConfigFields default', async ({page, openStory}) => {
    await openStory('components-chartconfigfields--default');
    await expect(page.getByRole('textbox').first()).toHaveValue('Revenue');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('ChartConfigFields without-axes', async ({page, openStory}) => {
    await openStory('components-chartconfigfields--without-axes');
    await expect(page.getByRole('textbox').first()).toHaveValue('Revenue by region');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('without-axes.png');
});

test('ChartConfigFields disabled', async ({page, openStory}) => {
    await openStory('components-chartconfigfields--disabled');
    await expect(page.getByRole('textbox').first()).toBeDisabled();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled.png');
});
