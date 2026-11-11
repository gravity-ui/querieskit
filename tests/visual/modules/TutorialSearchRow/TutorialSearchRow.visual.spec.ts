import {expect, test} from '../../fixtures';

const cases = [
    {story: 'default', text: 'Getting started with YQL'},
    {story: 'long-title', text: 'a detailed introduction'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-tutorialsearchrow--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(page.locator('.monaco-editor .view-lines').first()).toContainText('SELECT');
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
