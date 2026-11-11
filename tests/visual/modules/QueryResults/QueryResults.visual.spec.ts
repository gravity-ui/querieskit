import {expect, test} from '../../fixtures';

test('query results', async ({page, openStory}) => {
    await openStory('modules-queryresults--default');
    await expect(page.getByRole('cell', {name: '"95.106.17.32" Copy', exact: true})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Download', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('results.png');
});

test('results error', async ({page, openStory}) => {
    await openStory('modules-queryresults--error');
    await expect(page.getByText('Failed to load query results', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('results-error.png');
});

test('results schema', async ({page, openStory}) => {
    await openStory('modules-queryresults--controlled-view');
    await expect(page.getByText('last_visit_time', {exact: true})).toBeVisible();
    await expect(page.locator('.qp-query-results-schema')).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('results-schema.png');
});
