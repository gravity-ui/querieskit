import {expect, test} from '../../fixtures';

test('QueryResultsTable default', async ({page, openStory}) => {
    await openStory('components-queryresultstable--default');
    await expect(page.getByRole('cell', {name: '"Alpha" Copy', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('QueryResultsTable empty', async ({page, openStory}) => {
    await openStory('components-queryresultstable--empty');
    await expect(page.getByText('No data', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty.png');
});

test('QueryResultsTable error', async ({page, openStory}) => {
    await openStory('components-queryresultstable--error');
    await expect(page.getByText('Result is unavailable', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('error.png');
});
