import {expect, test} from '../../fixtures';

// QueryPageLayout's standalone layout story composes this module with application-owned
// editor/results content. Capture only the workspace so these baselines own its layout.
test('editor and results', async ({page, openStory}) => {
    await openStory('modules-querypagelayout--single-workspace');
    await expect(page.getByRole('textbox', {name: 'Query text', exact: true})).toBeVisible();
    await expect(
        page.getByText('Application-owned results appear here.', {exact: true}),
    ).toBeVisible();
    await expect(page.locator('.qp-query-workspace')).toHaveScreenshot('editor-and-results.png');
});

test('collapsed results', async ({page, openStory}) => {
    await openStory('modules-querypagelayout--single-workspace');
    await page.getByRole('button', {name: 'Collapse results', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Show results', exact: true})).toBeVisible();
    await expect(page.locator('.qp-query-workspace')).toHaveScreenshot('collapsed-results.png');
});

test('expanded results', async ({page, openStory}) => {
    await openStory('modules-querypagelayout--single-workspace');
    await page.getByRole('button', {name: 'Expand results', exact: true}).click();
    await expect(page.getByRole('textbox', {name: 'Query text', exact: true})).toBeHidden();
    await expect(page.getByRole('button', {name: 'Restore editor', exact: true})).toBeVisible();
    await expect(page.locator('.qp-query-workspace')).toHaveScreenshot('expanded-results.png');
});
