import {expect, test} from '../../fixtures';

test('EditableRowTitle default', async ({page, openStory}) => {
    await openStory('components-editablerowtitle--default');
    await expect(page.getByText('Revenue by region', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('EditableRowTitle editing', async ({page, openStory}) => {
    await openStory('components-editablerowtitle--editing');
    await expect(page.getByRole('textbox').first()).toHaveValue('Revenue by region');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('editing.png');
});

test('EditableRowTitle empty-title', async ({page, openStory}) => {
    await openStory('components-editablerowtitle--empty-title');
    await expect(page.getByRole('textbox').first()).toHaveValue('');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty-title.png');
});
