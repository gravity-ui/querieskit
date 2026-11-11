import {expect, test} from '../../fixtures';
for (const story of ['default', 'empty', 'disabled']) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-queryattributeseditor--${story}`);
        const add = page.getByRole('button', {name: 'Add attribute', exact: true});
        await expect(add).toBeVisible();
        if (story === 'disabled') await expect(add).toBeDisabled();
        if (story !== 'empty')
            await expect(page.locator('#storybook-root')).toContainText('analytics');
        await expect(page.locator('#storybook-root')).toHaveScreenshot(`${story}.png`);
    });
}
test('editing attribute', async ({page, openStory}) => {
    await openStory('modules-queryattributeseditor--default');
    await page.getByRole('button', {name: 'Edit attribute 1', exact: true}).click();
    await expect(page.getByRole('textbox', {name: 'Attribute key 1', exact: true})).toHaveValue(
        'pool',
    );
    await expect(page.getByRole('button', {name: 'Apply attribute 1', exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('editing.png');
});
