import {expect, test} from '../../fixtures';

test('Dashboard default', async ({page, openStory}) => {
    await openStory('components-dashboard--default');
    await expect(page.getByText('98.7%', {exact: true}).first()).toBeVisible();
    const line = page.locator('.qp-dashboard .gcharts-line > path').first();
    const area = page.locator('.qp-dashboard .gcharts-area__region').first();
    await expect(line).toBeVisible();
    await expect(line).toHaveAttribute('d', /.+/);
    await expect(area).toBeVisible();
    await expect(area).toHaveAttribute('d', /.+/);
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('Dashboard custom-grid', async ({page, openStory}) => {
    await openStory('components-dashboard--custom-grid');
    await expect(page.getByText('98.7%', {exact: true}).first()).toBeVisible();
    const line = page.locator('.qp-dashboard .gcharts-line > path').first();
    const area = page.locator('.qp-dashboard .gcharts-area__region').first();
    await expect(line).toBeVisible();
    await expect(line).toHaveAttribute('d', /.+/);
    await expect(area).toBeVisible();
    await expect(area).toHaveAttribute('d', /.+/);
    await expect(page.locator('#storybook-root')).toHaveScreenshot('custom-grid.png');
});
