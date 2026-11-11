import {expect, test} from '../../fixtures';

test('permanent sharing dialog', async ({page, openStory}) => {
    await openStory('modules-queryshare--permanent');
    const dialog = page.getByRole('dialog', {name: 'Public link'});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox', {name: 'Public link'})).toHaveValue(
        'https://yql.example.com/public/63cb3e94',
    );
    await expect(dialog.getByText('No expiration', {exact: true})).toBeVisible();
    // The dialog lives in a portal outside #storybook-root.
    await expect(dialog).toHaveScreenshot('sharing.png');
});
