import {expect, test} from '../../fixtures';

test('FieldsSelector controlled', async ({page, openStory}) => {
    await openStory('components-fieldsselector--controlled');
    await page.getByRole('button', {name: 'Configure visible fields', exact: true}).click();
    await expect(page.getByRole('checkbox', {name: 'Id', exact: true})).toBeVisible();
    await expect(page.locator('.qp-fields-selector')).toHaveScreenshot('controlled.png');
});

test('FieldsSelector long-titles', async ({page, openStory}) => {
    await openStory('components-fieldsselector--long-titles');
    await page.getByRole('button', {name: 'Configure visible fields', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Apply', exact: true})).toBeVisible();
    await expect(page.locator('.qp-fields-selector')).toHaveScreenshot('long-titles.png');
});

test('FieldsSelector empty', async ({page, openStory}) => {
    await openStory('components-fieldsselector--empty');
    await page.getByRole('button', {name: 'Configure visible fields', exact: true}).click();
    await expect(page.getByText('No fields found', {exact: true}).first()).toBeVisible();
    await expect(page.locator('.qp-fields-selector')).toHaveScreenshot('empty.png');
});
