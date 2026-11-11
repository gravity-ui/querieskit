import {expect, test} from '../../fixtures';

const cases = [
    {story: 'panels', text: 'Lesson 1'},
    {story: 'empty-panels', text: 'No tutorials'},
    {story: 'no-results', text: 'Nothing found'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-querieslist--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
