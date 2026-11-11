import {expect, test} from '../../fixtures';

test('query results', async ({page, openStory}) => {
    await openStory('modules-queryresults--default');
    await expect(page.getByRole('cell', {name: '"95.106.17.32" Copy', exact: true})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Download', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('results.png');
});
