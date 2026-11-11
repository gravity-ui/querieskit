import {expect, test} from '../../fixtures';

test('MonacoEditor default', async ({page, openStory}) => {
    await openStory('components-monacoeditor--default');
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('SELECT');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('MonacoEditor read-only', async ({page, openStory}) => {
    await openStory('components-monacoeditor--read-only');
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('GROUP BY');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('read-only.png');
});
