import {expect, test} from '../../fixtures';

test('QueryDuration default', async ({page, openStory}) => {
    await openStory('components-queryduration--default');
    await expect(page.getByText('00:05', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('QueryDuration all-statuses', async ({page, openStory}) => {
    await openStory('components-queryduration--all-statuses');
    await expect(page.getByText('27:15', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('all-statuses.png');
});
