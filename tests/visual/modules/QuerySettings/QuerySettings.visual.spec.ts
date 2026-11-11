import {expect, test} from '../../fixtures';

const cases = [
    {story: 'yql', text: 'YQL version'},
    {story: 'other-engine', text: 'Warehouse'},
    {story: 'external-errors', text: 'Enter a warehouse'},
    {story: 'disabled', text: 'YQL version'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-querysettings--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
