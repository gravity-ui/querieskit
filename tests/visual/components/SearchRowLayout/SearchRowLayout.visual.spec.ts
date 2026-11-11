import {expect, test} from '../../fixtures';

test('SearchRowLayout default', async ({page, openStory}) => {
    await openStory('components-searchrowlayout--default');
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('SELECT');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('SearchRowLayout multiline', async ({page, openStory}) => {
    await openStory('components-searchrowlayout--multiline');
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('SELECT');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('multiline.png');
});
