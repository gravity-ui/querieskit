import {expect, test} from '../../fixtures';

const cases = [
    {story: 'default', text: 'Getting started with YQL'},
    {story: 'empty', text: 'No tutorials'},
    {story: 'design-selected', text: 'Select specific columns'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-tutorialshistory--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
