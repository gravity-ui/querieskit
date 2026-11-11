import {expect, test} from '../../fixtures';

const cases = [
    {story: 'selected', text: 'Completed query'},
    {story: 'empty', text: 'No query rows'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-rowslist--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
