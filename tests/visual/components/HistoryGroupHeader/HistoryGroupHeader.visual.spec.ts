import {expect, test} from '../../fixtures';

test('HistoryGroupHeader default', async ({page, openStory}) => {
    await openStory('components-historygroupheader--default');
    await expect(page.getByText('Today', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('HistoryGroupHeader long-title', async ({page, openStory}) => {
    await openStory('components-historygroupheader--long-title');
    await expect(
        page.getByText('Queries from the previous reporting period', {exact: true}).first(),
    ).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('long-title.png');
});
