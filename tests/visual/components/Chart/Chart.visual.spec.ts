import {expect, test} from '../../fixtures';

test('Chart default', async ({page, openStory}) => {
    await openStory('components-chart--default');
    await expect(page.getByText('Query duration', {exact: true}).first()).toBeVisible();
    const line = page.locator('.qp-chart .gcharts-line > path').first();
    await expect(line).toBeVisible();
    await expect(line).toHaveAttribute('d', /.+/);
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('Chart without-optional-actions', async ({page, openStory}) => {
    await openStory('components-chart--without-optional-actions');
    await expect(page.getByText('Query duration', {exact: true}).first()).toBeVisible();
    const line = page.locator('.qp-chart .gcharts-line > path').first();
    await expect(line).toBeVisible();
    await expect(line).toHaveAttribute('d', /.+/);
    await expect(page.locator('#storybook-root')).toHaveScreenshot('without-optional-actions.png');
});
