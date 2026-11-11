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

// Geometry assertions catch sticky containment bugs that jsdom cannot model.
test('results header stays below the toolbar before and after scrolling', async ({
    page,
    openStory,
}) => {
    await openStory('modules-queryresults--results-resize-and-scroll');
    const toolbar = page.locator('.qp-query-results__toolbar');
    const header = page.locator('.data-table__sticky_head');
    const firstRow = page.locator('.data-table__box tbody tr').first();
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    const rowBox = await firstRow.boundingBox();
    if (!headerBox || !rowBox) throw new Error('Table geometry is unavailable');
    expect(headerBox.y + headerBox.height).toBeLessThanOrEqual(rowBox.y + 1);
    const scrollContainer = page.locator('#storybook-root > div');
    await scrollContainer.evaluate((element) => {
        element.scrollTo({top: 100});
    });
    await expect
        .poll(async () => {
            const toolbarBox = await toolbar.boundingBox();
            const stickyBox = await header.boundingBox();
            if (!toolbarBox || !stickyBox) return Infinity;
            return Math.abs(stickyBox.y - toolbarBox.y - toolbarBox.height);
        })
        .toBeLessThan(1);
});
