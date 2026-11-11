import {expect, test} from '../../fixtures';

test('query editor', async ({page, openStory}) => {
    await openStory('widgets-queryeditor--default');
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('SELECT');
    await expect(page.getByRole('button', {name: 'Run', exact: true})).toBeEnabled();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('editor.png');
});
