import {expect, test} from '../../fixtures';
import {prepareCanvas} from '../../canvas';

test('QueryGraph default', async ({page, openStory}) => {
    await openStory('components-querygraph--default');
    await expect(page.getByRole('button', {name: 'Fit', exact: true})).toBeVisible();
    await prepareCanvas(page, page.locator('.qp-query-graph'), 'Fit');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('QueryGraph statuses', async ({page, openStory}) => {
    await openStory('components-querygraph--statuses');
    await expect(page.getByRole('button', {name: 'Fit', exact: true})).toBeVisible();
    await prepareCanvas(page, page.locator('.qp-query-graph'), 'Fit');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('statuses.png');
});

test('QueryGraph large-graph-threshold', async ({page, openStory}) => {
    await openStory('components-querygraph--large-graph-threshold');
    await expect(page.getByRole('button', {name: 'Show graph', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('large-graph-threshold.png');
});
