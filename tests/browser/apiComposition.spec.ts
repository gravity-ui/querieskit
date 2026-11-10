import {expect, test} from '@playwright/test';

test('custom filter keeps a draft across popup close and applies, resets and accepts external values', async ({
    page,
}) => {
    await page.goto('/api-composition.html');
    const trigger = page.locator('.qp-history-filter__button');
    await trigger.click();
    const owner = page.getByRole('textbox', {name: 'Filter owner'});
    await owner.fill('alice');
    await page.getByRole('button', {name: 'Apply', exact: true}).click();
    await expect(page.getByTestId('applied')).toHaveText('alice');
    await expect(owner).toBeVisible();
    await owner.fill('draft');
    await trigger.click();
    await trigger.click();
    await expect(owner).toHaveValue('draft');
    await page.getByRole('button', {name: 'Reset', exact: true}).click();
    await expect(owner).toHaveValue('');
    await expect(page.getByTestId('applied')).toBeEmpty();
    await trigger.click();
    await page.getByRole('button', {name: 'Load external filter'}).click();
    await trigger.click();
    await expect(owner).toHaveValue('external');
    await page.screenshot({
        animations: 'disabled',
        path: test.info().outputPath('custom-filter.png'),
    });
});

test('builtin section composes one SPYT editor with application content and switches engines', async ({
    page,
}) => {
    await page.goto('/api-composition.html?scenario=settings');
    await expect(page.locator('.monaco-editor')).toHaveCount(1);
    await expect(page.getByRole('button', {name: 'SPYT', exact: true})).toHaveCount(1);
    await expect(page.getByRole('textbox', {name: 'Application owner'})).toBeVisible();
    await page.getByRole('button', {name: 'Use YQL'}).click();
    await expect(page.locator('.monaco-editor')).toHaveCount(0);
    await expect(page.getByRole('textbox', {name: 'Application owner'})).toBeVisible();
    await page.getByRole('button', {name: 'Use SPYT'}).click();
    await expect(page.locator('.monaco-editor')).toHaveCount(1);
    await expect(page.getByTestId('saved-config')).toHaveText('{}');
    await page.screenshot({
        animations: 'disabled',
        path: test.info().outputPath('section-settings.png'),
    });
});

test('table preset preserves metadata and renders ordered replacement and custom tabs', async ({
    page,
}) => {
    await page.goto('/api-composition.html?scenario=table');
    const tabs = page.getByRole('radio');
    await expect(tabs).toHaveCount(4);
    await expect(page.getByText('analytics', {exact: true})).toBeVisible();
    await tabs.nth(1).click();
    await expect(page.getByText('Application schema', {exact: true})).toBeVisible();
    await tabs.nth(2).click();
    await expect(page.getByText('Application preview', {exact: true})).toBeVisible();
    await tabs.nth(3).click();
    await expect(page.getByText('Application activity', {exact: true})).toBeVisible();
    await page.screenshot({
        animations: 'disabled',
        path: test.info().outputPath('partial-table.png'),
    });
});
