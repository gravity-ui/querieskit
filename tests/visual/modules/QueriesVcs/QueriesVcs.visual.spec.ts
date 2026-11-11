import {expect, test} from '../../fixtures';

test('file list', async ({page, openStory}) => {
    await openStory('modules-queriesvcs--default');
    await expect(page.getByText('README.md', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('file-list.png');
});

test('repository selector', async ({page, openStory}) => {
    await openStory('modules-queriesvcs--multiple-repositories');
    await expect(page.getByText('Analytics', {exact: true})).toBeVisible();
    await expect(page.getByText('README.md', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('repository-selector.png');
});

test('empty repositories', async ({page, openStory}) => {
    await openStory('modules-queriesvcs--repository-states');
    await expect(page.getByText('No repositories', {exact: true})).toBeVisible();
    await expect(page.getByText('README.md', {exact: true})).toHaveCount(0);
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-repositories.png');
});
