import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
    await page.goto('/standard-panels.html');
    await expect(page.getByRole('button', {name: 'Configure visible fields'})).toBeVisible();
});

test('explicit selection works with real popup, search, keyboard and outside dismissal', async ({
    page,
}) => {
    const trigger = page.getByRole('button', {name: 'Configure visible fields'});
    await trigger.click();
    await page.getByRole('textbox', {name: 'Search fields'}).fill('Column 499');
    await page.getByRole('checkbox', {name: 'Column 499', exact: true}).press('Space');
    await expect(page.getByTestId('selection')).toHaveText('column-0 / 0');
    await page.getByRole('button', {name: 'Apply', exact: true}).click();
    await expect(page.getByTestId('selection')).toHaveText('column-0,column-499 / 1');
    await trigger.click();
    await page.getByRole('checkbox', {name: 'Column 0', exact: true}).press('Space');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('textbox', {name: 'Search fields'})).toBeHidden();
    await trigger.click();
    await expect(page.getByRole('checkbox', {name: 'Column 0', exact: true})).toBeChecked();
    await page.getByRole('button', {name: 'Toggle theme'}).click();
    await expect(page.getByRole('textbox', {name: 'Search fields'})).toBeHidden();
    await expect(page.getByTestId('selection')).toHaveText('column-0,column-499 / 1');
});

test('navigation keyboard actions and portal menu do not navigate; virtual heights update', async ({
    page,
}) => {
    const list = page.getByTestId('navigation-list');
    const first = list.locator('.qp-navigation-item-row').first();
    const before = await first.boundingBox();
    await list.getByRole('button', {name: 'Favorite 0', exact: true}).press('Enter');
    await expect(page.getByTestId('navigation')).toHaveText('0 / 1');
    await list.getByRole('button', {name: 'Favorite 0', exact: true}).press('Space');
    await expect(page.getByTestId('navigation')).toHaveText('0 / 2');
    await list.getByRole('button', {name: 'More actions'}).first().press('Enter');
    await expect(page.getByText('Copy', {exact: true})).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('navigation')).toHaveText('0 / 3');
    await page.getByRole('button', {name: 'Toggle descriptions'}).click();
    await expect(first).toContainText('Long target');
    const after = await first.boundingBox();
    expect(after!.height).toBeGreaterThan(before!.height);
    const box = await list.boundingBox();
    const actions = await list.getByRole('button', {name: 'Favorite 0', exact: true}).boundingBox();
    expect(actions!.x + actions!.width).toBeLessThanOrEqual(box!.x + box!.width);
    await page.getByRole('button', {name: 'Toggle theme'}).click();
    await expect(first).toBeVisible();
    await page.getByRole('button', {name: 'Toggle descriptions'}).click();
    expect((await first.boundingBox())!.height).toBe(before!.height);
});

test('settings retain invalid drafts and attachment actions work without hover', async ({
    page,
}, testInfo) => {
    await page.getByRole('button', {name: 'Edit attribute 1', exact: true}).focus();
    await page.keyboard.press('Enter');
    const key = page.getByRole('textbox', {name: 'Attribute key 1', exact: true});
    await key.fill('priority');
    await page.getByRole('button', {name: 'Apply attribute 1', exact: true}).press('Enter');
    await expect(page.getByText('This key already exists')).toBeVisible();
    await expect(key).toHaveValue('priority');
    await key.press('Escape');
    await expect(key).toBeHidden();
    await page.getByRole('button', {name: 'Edit attribute 1', exact: true}).press('Enter');
    await expect(key).toHaveValue('pool');
    await key.press('Escape');

    const attachments = page.getByTestId('attachments');
    const edit = attachments.getByRole('button', {name: 'Edit', exact: true});
    await edit.focus();
    await expect(edit).toBeFocused();
    await edit.press('Enter');
    await attachments.getByRole('textbox').fill('renamed.sql');
    await attachments.getByRole('button', {name: 'Save', exact: true}).press('Enter');
    await expect(attachments.getByText('renamed.sql', {exact: true})).toBeVisible();
    await attachments.getByRole('button', {name: 'Delete', exact: true}).press('Enter');
    await attachments.getByRole('tab', {name: /Deleted/}).click();
    await attachments.getByRole('button', {name: 'Restore', exact: true}).press('Enter');
    await attachments.getByRole('tab', {name: /Current/}).click();
    await expect(attachments.getByText('renamed.sql', {exact: true})).toBeVisible();
    await page.getByRole('button', {name: 'Toggle theme'}).click();
    await page.screenshot({
        path: testInfo.outputPath('panels-dark.png'),
        fullPage: true,
        animations: 'disabled',
    });
    await page.getByRole('button', {name: 'Toggle theme'}).click();
    await page.screenshot({
        path: testInfo.outputPath('panels-light.png'),
        fullPage: true,
        animations: 'disabled',
    });
});

test('local file errors retain the selection for keyboard retry', async ({page}) => {
    const attachments = page.getByTestId('attachments');
    await attachments.locator('input[type=file]').setInputFiles({
        name: 'local.sql',
        mimeType: 'text/plain',
        buffer: Buffer.from('select 1'),
    });
    await expect(attachments.getByRole('alert')).toHaveText('Please retry this file');
    await attachments.getByRole('button', {name: 'Retry', exact: true}).press('Enter');
    await expect(attachments.getByText('local.sql', {exact: true})).toBeVisible();
    await expect(attachments.getByRole('status')).toHaveText('File added');
    await expect(attachments.getByRole('button', {name: 'Retry', exact: true})).toBeHidden();
});
