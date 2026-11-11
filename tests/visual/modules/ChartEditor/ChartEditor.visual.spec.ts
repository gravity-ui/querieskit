import {expect, test} from '../../fixtures';

test('line preview', async ({page, openStory}) => {
    await openStory('modules-charteditor--line');
    await expect(page.locator('.qp-chart-editor__preview svg path:visible').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('line-preview.png');
});

test('donut preview', async ({page, openStory}) => {
    await openStory('modules-charteditor--donut');
    await expect(
        page.locator('.qp-chart-editor__preview .gcharts-pie__segment').first(),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('donut-preview.png');
});

test('empty chart', async ({page, openStory}) => {
    await openStory('modules-charteditor--empty-state');
    await expect(page.locator('.qp-chart-editor__empty')).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-chart.png');
});
