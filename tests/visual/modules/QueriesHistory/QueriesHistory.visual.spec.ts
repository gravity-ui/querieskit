import {expect, test} from '../../fixtures';

test('history durations', async ({page, openStory}) => {
    await openStory('modules-querieshistory--narrow-duration');
    await expect(page.getByText('Five-minute query', {exact: true})).toBeVisible();
    await expect(page.getByText('Twenty-seven-hour query', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('history.png');
});
