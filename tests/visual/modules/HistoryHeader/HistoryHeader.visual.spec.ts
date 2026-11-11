import {expect, test} from '../../fixtures';
for (const story of ['default', 'full-search-active']) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-historyheader--${story}`);
        await expect(page.getByRole('textbox')).toHaveValue(story === 'default' ? '' : 'users');
        await expect(page.getByRole('button', {name: 'Search in query text'})).toHaveClass(
            story === 'default' ? /g-button_view_normal/ : /g-button_view_action/,
        );
        await expect(page.locator('#storybook-root')).toHaveScreenshot(`${story}.png`);
    });
}
