import {expect, test} from '../../fixtures';

const cases = [
    {story: 'default', text: 'No attachments'},
    {story: 'with-attachments', text: 'README.md'},
    {story: 'with-long-list', text: 'schema.json'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-attachments--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}
