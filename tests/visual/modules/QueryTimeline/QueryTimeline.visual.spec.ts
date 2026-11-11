import {expect, test} from '../../fixtures';
import {prepareCanvas} from '../../canvas';

test('execution intervals', async ({page, openStory}) => {
    await openStory('modules-querytimeline--default');
    await expect(page.getByRole('link', {name: 'Fetch source', exact: true})).toBeVisible();
    await prepareCanvas(page, page.locator('.qp-query-timeline'), 'Fit all');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('execution-intervals.png');
});

test('empty timeline', async ({page, openStory}) => {
    await openStory('modules-querytimeline--empty');
    await expect(page.getByText('No timeline data', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-timeline.png');
});

test('timeline error', async ({page, openStory}) => {
    await openStory('modules-querytimeline--error');
    await expect(page.getByText('Could not load execution data', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('timeline-error.png');
});

test('pending task without intervals', async ({page, openStory}) => {
    await openStory('modules-querytimeline--no-intervals');
    await expect(page.getByText('No time intervals', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
        'pending-task-without-intervals.png',
    );
});
