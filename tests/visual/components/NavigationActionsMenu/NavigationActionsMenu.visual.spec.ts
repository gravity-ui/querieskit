import {expect, test} from '../../fixtures';

test('NavigationActionsMenu default', async ({page, openStory}) => {
    await openStory('components-navigationactionsmenu--default');
    await page.getByRole('button', {name: 'More actions'}).click();
    await expect(page.getByRole('menuitem', {name: 'Copy path', exact: true})).toBeVisible();
    await expect(page.getByRole('menu')).toHaveScreenshot('default.png');
});

test('NavigationActionsMenu grouped', async ({page, openStory}) => {
    await openStory('components-navigationactionsmenu--grouped');
    await page.getByRole('button', {name: 'More actions'}).click();
    await expect(
        page.getByRole('menuitem', {name: 'Copy to clipboard', exact: true}),
    ).toBeVisible();
    await expect(
        page.getByRole('menuitem', {name: 'SELECT expression', exact: true}),
    ).toBeVisible();
    await expect(page.getByRole('menu')).toHaveScreenshot('grouped.png');
});
