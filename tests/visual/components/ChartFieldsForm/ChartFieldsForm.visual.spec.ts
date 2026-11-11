import {expect, test} from '../../fixtures';

test('ChartFieldsForm default', async ({page, openStory}) => {
    await openStory('components-chartfieldsform--default');
    await expect(page.locator('.qp-chart-fields-form').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('ChartFieldsForm with-filled-values', async ({page, openStory}) => {
    await openStory('components-chartfieldsform--with-filled-values');
    await expect(page.locator('.qp-chart-fields-form').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('with-filled-values.png');
});

test('ChartFieldsForm pie', async ({page, openStory}) => {
    await openStory('components-chartfieldsform--pie');
    await expect(page.locator('.qp-chart-fields-form').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('pie.png');
});

test('ChartFieldsForm sankey', async ({page, openStory}) => {
    await openStory('components-chartfieldsform--sankey');
    await expect(page.locator('.qp-chart-fields-form').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('sankey.png');
});

test('ChartFieldsForm disabled', async ({page, openStory}) => {
    await openStory('components-chartfieldsform--disabled');
    await expect(page.locator('.qp-chart-fields-form').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled.png');
});
