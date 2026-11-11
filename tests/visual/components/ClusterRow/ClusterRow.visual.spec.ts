import {expect, test} from '../../fixtures';

test('ClusterRow default', async ({page, openStory}) => {
    await openStory('components-clusterrow--default');
    await expect(page.getByText('Production', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('ClusterRow long-title', async ({page, openStory}) => {
    await openStory('components-clusterrow--long-title');
    await expect(
        page
            .getByText('Archive cluster with a deliberately long descriptive title', {exact: true})
            .first(),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('long-title.png');
});
