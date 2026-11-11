import {expect, test} from '../../fixtures';

test('AddChartButton default', async ({page, openStory}) => {
    await openStory('components-addchartbutton--default');
    await expect(page.getByRole('button', {name: 'Add chart', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('AddChartButton opened', async ({page, openStory}) => {
    await openStory('components-addchartbutton--opened');
    await expect(page.getByRole('menuitem', {name: 'Line', exact: true})).toBeVisible();
    await expect(page).toHaveScreenshot('opened.png');
});
