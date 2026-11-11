import {expect, test} from '../../fixtures';

test('HistoryFilter default', async ({page, openStory}) => {
    await openStory('components-historyfilter--default');
    await page.locator('#storybook-root').getByRole('button').click();
    await expect(page.getByRole('button', {name: 'Apply', exact: true})).toBeVisible();
    await expect(page.locator('.qp-history-filter')).toHaveScreenshot('default.png');
});

test('HistoryFilter controlled', async ({page, openStory}) => {
    await openStory('components-historyfilter--controlled');
    await page.locator('#storybook-root').getByRole('button').click();
    await expect(page.getByRole('button', {name: 'Apply', exact: true})).toBeVisible();
    await expect(page.locator('.qp-history-filter')).toHaveScreenshot('controlled.png');
});

test('HistoryFilter changed', async ({page, openStory}) => {
    await openStory('components-historyfilter--changed');
    await expect(page.locator('#storybook-root').getByRole('button')).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('changed.png');
});
