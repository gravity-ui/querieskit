import {expect, test} from '../../fixtures';

test('MonacoDiffEditor split', async ({page, openStory}) => {
    await openStory('components-monacodiffeditor--split');
    await expect(page.locator('.monaco-diff-editor')).toBeVisible();
    await expect(page.locator('.monaco-editor .view-lines').last()).toContainText('region');
    await expect(page.locator('.char-insert').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('split.png');
});

test('MonacoDiffEditor unified', async ({page, openStory}) => {
    await openStory('components-monacodiffeditor--unified');
    await expect(page.locator('.monaco-diff-editor')).toBeVisible();
    await expect(page.locator('.monaco-editor .view-lines').last()).toContainText('region');
    await expect(page.locator('.char-insert').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('unified.png');
});
