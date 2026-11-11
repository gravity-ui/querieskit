import {expect, test} from '../../fixtures';

const cases = [
    {story: 'default', text: 'Query 1'},
    {story: 'comparison-mode', text: 'Query 1'},
    {story: 'narrow', text: 'Query with a long title'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-historyrow--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
