import {expect, test} from '../../fixtures';

const cases = [
    {story: 'default', text: 'Getting started with YQL'},
    {story: 'long-number', text: '1234'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-tutorialrow--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
