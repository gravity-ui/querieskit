import {expect, test} from '../../fixtures';

test('line field bindings', async ({page, openStory}) => {
    await openStory('modules-chartfieldseditor--default');
    await expect(
        page.locator('.qp-chart-fields-editor__preview svg path:visible').first(),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('line-field-bindings.png');
});

test('pie field bindings', async ({page, openStory}) => {
    await openStory('modules-chartfieldseditor--pie');
    await expect(
        page.locator('.qp-chart-fields-editor__preview .gcharts-pie__segment').first(),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('pie-field-bindings.png');
});

test('incomplete bindings', async ({page, openStory}) => {
    await openStory('modules-chartfieldseditor--incomplete');
    await expect(page.getByText('Select available chart fields', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('incomplete-bindings.png');
});

test('empty chart data', async ({page, openStory}) => {
    await openStory('modules-chartfieldseditor--empty-data');
    await expect(page.getByText('No chart data', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-chart-data.png');
});
