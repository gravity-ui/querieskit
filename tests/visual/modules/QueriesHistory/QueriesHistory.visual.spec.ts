import {expect, test} from '../../fixtures';

test('history durations', async ({page, openStory}) => {
    await openStory('modules-querieshistory--narrow-duration');
    await expect(page.getByText('Five-minute query', {exact: true})).toBeVisible();
    await expect(page.getByText('Twenty-seven-hour query', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('history.png');
});

test('completed failed and running queries', async ({page, openStory}) => {
    await openStory('modules-querieshistory--default');
    await expect(page.locator('.qp-history-row_completed')).toContainText('Query 1');
    await expect(page.locator('.qp-history-row_failed')).toContainText('Query 2');
    await expect(page.locator('.qp-history-row_running')).toContainText('Query 3');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('statuses.png');
});

test('ordinary title search', async ({page, openStory}) => {
    await openStory('modules-querieshistory--default');
    await page.getByRole('textbox').fill('Query 2');
    await expect(page.getByText('Query 2', {exact: true})).toBeVisible();
    await expect(page.getByText('Query 1', {exact: true})).toHaveCount(0);
    await expect(page.locator('.qp-search-row-layout')).toHaveCount(0);
    await expect(page.locator('#storybook-root')).toHaveScreenshot('title-search.png');
});

test('full text search finds query content', async ({page, openStory}) => {
    await openStory('modules-querieshistory--default');
    await page.getByRole('textbox').fill('test_session');
    await expect(page.getByText('Nothing found', {exact: true})).toBeVisible();
    await page.getByRole('button', {name: 'Search in query text'}).click();
    await expect(page.getByRole('button', {name: 'Search in query text'})).toHaveAttribute(
        'aria-pressed',
        'true',
    );
    await expect(page.locator('.qp-history-row')).toHaveCount(0);
    await expect(page.locator('a[href="/queries/1"]')).toBeVisible();
    await expect(page.locator('.qp-search-row-layout').first()).toBeVisible();
    await expect(page.locator('.monaco-editor .view-lines').first()).toContainText('SELECT');
    await expect(page.locator('.monaco-editor .view-lines').first()).toContainText('test_session');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('fulltext-search.png');
});

test('empty history', async ({page, openStory}) => {
    await openStory('modules-querieshistory--empty');
    await expect(page.getByText('No queries', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty.png');
});
