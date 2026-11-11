import {expect, test} from '../../fixtures';

test('navigation clusters', async ({page, openStory}) => {
    await openStory('modules-queriesnavigation--clusters-to-items');
    await expect(page.getByText('Northstar', {exact: true})).toBeVisible();
    await expect(page.getByText('Cedar', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('navigation.png');
});
