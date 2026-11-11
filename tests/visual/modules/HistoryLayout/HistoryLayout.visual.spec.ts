import {expect, test} from '../../fixtures';

const cases = [
    {story: 'default', text: 'Query results area'},
    {story: 'panel', text: 'Workspace'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-historylayout--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
