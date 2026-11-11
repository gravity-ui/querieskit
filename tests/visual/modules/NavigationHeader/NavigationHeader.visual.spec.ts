import {expect, test} from '../../fixtures';

test('header actions', async ({page, openStory}) => {
    await openStory('modules-navigationheader--default');
    await expect(page.getByRole('button', {name: 'Paste path', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('header-actions.png');
});

test('truncated long path', async ({page, openStory}) => {
    await openStory('modules-navigationheader--long-path');
    await expect(page.getByText('structure', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('truncated-long-path.png');
});

test('disabled header action', async ({page, openStory}) => {
    await openStory('modules-navigationheader--disabled-action');
    await expect(page.getByRole('button', {name: 'Paste path', exact: true})).toBeDisabled();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('disabled-header-action.png');
});
