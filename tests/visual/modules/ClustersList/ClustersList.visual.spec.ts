import {expect, test} from '../../fixtures';

test('cluster descriptions', async ({page, openStory}) => {
    await openStory('modules-clusterslist--default');
    await expect(page.getByText('Primary analytics cluster', {exact: true})).toBeVisible();
    await expect(page.getByText('Archive', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('cluster-descriptions.png');
});

test('no clusters', async ({page, openStory}) => {
    await openStory('modules-clusterslist--empty');
    await expect(page.getByText('No clusters available', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('no-clusters.png');
});

test('cluster error', async ({page, openStory}) => {
    await openStory('modules-clusterslist--error');
    await expect(page.getByText('Unable to load clusters', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('cluster-error.png');
});
