import {expect, test} from '../../fixtures';

test('ChartEditorForm default', async ({page, openStory}) => {
    await openStory('components-charteditorform--default');
    await expect(page.locator('.qp-chart-editor-form').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('ChartEditorForm with-filled-values', async ({page, openStory}) => {
    await openStory('components-charteditorform--with-filled-values');
    await expect(page.locator('.qp-chart-editor-form').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('with-filled-values.png');
});

test('ChartEditorForm disabled', async ({page, openStory}) => {
    await openStory('components-charteditorform--disabled');
    await expect(page.locator('.qp-chart-editor-form').first()).toBeVisible();
    await expect(page.getByRole('textbox').first()).toBeDisabled();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled.png');
});
