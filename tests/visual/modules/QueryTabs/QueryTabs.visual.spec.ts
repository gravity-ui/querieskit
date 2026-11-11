import {expect, test} from '../../fixtures';
for (const story of ['default', 'comparison', 'overflow']) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-querytabs--${story}`);
        await expect(page.getByRole('tab').first()).toBeVisible();
        await expect(page.getByRole('tablist')).toBeVisible();
        await expect(page.locator('#storybook-root')).toHaveScreenshot(`${story}.png`);
    });
}
