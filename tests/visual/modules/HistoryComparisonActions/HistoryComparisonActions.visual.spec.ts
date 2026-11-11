import {expect, test} from '../../fixtures';
for (const [story, enabled] of [
    ['one-selected', false],
    ['two-selected', true],
] as const) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-historycomparisonactions--${story}`);
        const actions = page.locator('.qp-history-comparison-actions');
        await expect(actions.getByRole('button')).toHaveCount(2);
        if (enabled) await expect(actions.getByRole('button').last()).toBeEnabled();
        else await expect(actions.getByRole('button').last()).toBeDisabled();
        await expect(page.locator('#storybook-root')).toHaveScreenshot(`${story}.png`);
    });
}
