import {expect, test} from '../../fixtures';
import {prepareCanvas} from '../../canvas';

test('graph progress', async ({page, openStory}) => {
    await openStory('modules-queryprogress--default');
    await prepareCanvas(page, page.locator('.qp-query-graph'), 'Fit');
    await expect(page.getByText('Completed', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('graph-progress.png');
});

test('timeline progress', async ({page, openStory}) => {
    await openStory('modules-queryprogress--timeline');
    await expect(page.getByRole('link', {name: 'Fetch source', exact: true})).toBeVisible();
    await prepareCanvas(page, page.locator('.qp-query-timeline'), 'Fit all');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('timeline-progress.png');
});

test('empty timeline progress', async ({page, openStory}) => {
    await openStory('modules-queryprogress--without-timeline-data');
    await expect(page.getByText('No timeline data', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-timeline-progress.png');
});
