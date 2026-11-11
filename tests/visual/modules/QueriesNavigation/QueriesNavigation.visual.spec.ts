import {expect, test} from '../../fixtures';

test('navigation clusters', async ({page, openStory}) => {
    await openStory('modules-queriesnavigation--clusters-to-items');
    await expect(page.getByText('Northstar', {exact: true})).toBeVisible();
    await expect(page.getByText('Cedar', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('navigation.png');
});

test('navigation load error', async ({page, openStory}) => {
    await openStory('modules-queriesnavigation--error');
    await expect(page.getByText('Custom load error message', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('navigation-load-error.png');
});

test('extended navigation rows', async ({page, openStory}) => {
    await openStory('modules-queriesnavigation--extended-standard-rows');
    await expect(page.getByText('Readme', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('extended-navigation-rows.png');
});
