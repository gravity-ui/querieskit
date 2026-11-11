import {expect, test} from '../../fixtures';

const cases = [
    {story: 'default', text: 'Daily report'},
    {story: 'long-title', text: 'Daily report with a long title'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-savedqueryrow--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
