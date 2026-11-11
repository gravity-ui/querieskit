import {expect, test} from '../../fixtures';

test('RowActionsMenu default', async ({page, openStory}) => {
    await openStory('components-rowactionsmenu--default');
    await page.locator('#storybook-root').getByRole('button').click();
    await expect(page.getByRole('menuitem', {name: 'Rename query', exact: true})).toBeVisible();
    await expect(page.getByRole('menu')).toHaveScreenshot('default.png');
});

test('RowActionsMenu disabled-action', async ({page, openStory}) => {
    await openStory('components-rowactionsmenu--disabled-action');
    await page.locator('#storybook-root').getByRole('button').click();
    await expect(page.getByRole('menuitem', {name: 'Copy query', exact: true})).toBeVisible();
    await expect(page.getByRole('menu')).toHaveScreenshot('disabled-action.png');
});
