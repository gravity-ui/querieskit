import {expect, test} from '../../fixtures';

const cases = [
    {story: 'completed', text: 'YQL'},
    {story: 'with-mode-and-private', text: 'batch'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-historysearchrow--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(page.locator('.monaco-editor .view-lines').first()).toContainText('SELECT');
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
