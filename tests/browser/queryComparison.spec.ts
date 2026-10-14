import {expect, test} from '@playwright/test';
import type {} from './fixture/query-comparison';

test.beforeEach(async ({page}) => {
    page.on('pageerror', (error) => {
        throw error;
    });
    await page.goto('/query-comparison.html');
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest?.snapshot().modelCount))
        .toBe(4);
});

test('shows per-block statistics and switches both editors to unified mode', async ({page}) => {
    const query = page.getByRole('region', {name: 'Query', exact: true});
    const config = page.getByRole('region', {name: 'Configuration', exact: true});
    await expect(query.locator('.qp-comparison-block__added')).toHaveText('+1');
    await expect(query.locator('.qp-comparison-block__removed')).toHaveText('−1');
    await expect(config.locator('.qp-comparison-block__added')).toHaveText('+1');
    await expect(config.locator('.qp-comparison-block__removed')).toHaveText('−0');
    await page.screenshot({path: '/tmp/querieskit-comparison.png', fullPage: true});
    await page.evaluate(() => window.comparisonTest.setTheme('dark'));
    await expect(page.locator('.g-root')).toHaveClass(/theme_dark/);
    await page.screenshot({path: '/tmp/querieskit-comparison-dark.png', fullPage: true});
    await page.getByRole('radio', {name: 'Unified', exact: true}).check();
    await expect(page.locator('.monaco-diff-editor:not(.side-by-side)')).toHaveCount(2);
    await page.getByRole('radio', {name: 'Split', exact: true}).check();
    await expect(page.locator('.monaco-diff-editor.side-by-side')).toHaveCount(2);
});

test('original is immutable; controlled edits and undo survive collapse', async ({page}) => {
    await page.evaluate(() => window.comparisonTest.focus('query', 'original'));
    await page.keyboard.type('forbidden');
    expect(await page.evaluate(() => window.comparisonTest.snapshot().changes)).toEqual([]);
    await page.evaluate(() => window.comparisonTest.focus('query', 'modified'));
    await page.evaluate(() => window.comparisonTest.edit('query', 'SELECT 42;'));
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().items[0].modified))
        .toBe('SELECT 42;');
    const before = await page.evaluate(() => window.comparisonTest.snapshot().uris);
    await page.getByRole('button', {name: 'Collapse Query', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Expand Query', exact: true})).toHaveAttribute(
        'aria-expanded',
        'false',
    );
    await page.getByRole('button', {name: 'Expand Query', exact: true}).click();
    expect(await page.evaluate(() => window.comparisonTest.snapshot().uris)).toEqual(before);
    await page.evaluate(() => window.comparisonTest.undo('query'));
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().items[0].modified))
        .toBe('SELECT 2;');
});

test('external values do not echo changes and removed blocks dispose their models', async ({
    page,
}) => {
    await page.evaluate(() =>
        window.comparisonTest.replace([
            {id: 'query', title: 'Query', original: 'SELECT 10;', modified: 'SELECT 20;'},
        ]),
    );
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().modelCount))
        .toBe(2);
    expect(await page.evaluate(() => window.comparisonTest.snapshot().changes)).toEqual([]);
    await page.evaluate(() => window.comparisonTest.setMounted(false));
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().modelCount))
        .toBe(0);
    await page.evaluate(() => window.comparisonTest.setMounted(true));
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().modelCount))
        .toBe(2);
    expect(await page.evaluate(() => window.comparisonTest.snapshot().changes)).toEqual([]);
});

test('restores and removes absent files while retaining empty files', async ({page}) => {
    await page.evaluate(() =>
        window.comparisonTest.replace([
            {id: 'removed', title: 'Removed', original: 'restore me', modified: null},
            {id: 'added', title: 'Added', original: null, modified: 'remove me'},
            {id: 'empty', title: 'Empty', original: '', modified: ''},
        ]),
    );
    const removed = page.getByRole('region', {name: 'Removed', exact: true});
    const added = page.getByRole('region', {name: 'Added', exact: true});
    const empty = page.getByRole('region', {name: 'Empty', exact: true});
    await expect(removed.getByText('The file has been removed in this version')).toBeVisible();
    await expect(added.getByText('The file did not exist in this version')).toBeVisible();
    await expect(empty.getByText(/The file/)).toHaveCount(0);
    await expect(empty.getByRole('button', {name: /Restore file|Remove file/})).toHaveCount(0);
    await expect(removed.locator('.qp-comparison-block__added')).toHaveText('+0');
    await expect(added.locator('.qp-comparison-block__removed')).toHaveText('−0');
    await expect(empty.locator('.qp-comparison-block__added')).toHaveText('+0');
    await expect(empty.locator('.qp-comparison-block__removed')).toHaveText('−0');
    await removed.getByRole('button', {name: 'Restore file'}).click();
    await added.getByRole('button', {name: 'Remove file'}).click();
    expect(await page.evaluate(() => window.comparisonTest.snapshot().changes)).toEqual([
        {id: 'removed', value: 'restore me'},
        {id: 'added', value: null},
    ]);
    await expect(removed.getByText('The file has been removed in this version')).toHaveCount(0);
    await expect(added.getByText('The file has been removed in this version')).toBeVisible();
});

test('read-only mode prevents modified edits and file actions', async ({page}) => {
    await page.evaluate(() => window.comparisonTest.setReadOnly(true));
    await page.evaluate(() => window.comparisonTest.focus('query', 'modified'));
    await page.keyboard.type('forbidden');
    expect(await page.evaluate(() => window.comparisonTest.snapshot().changes)).toEqual([]);
    await page.evaluate(() =>
        window.comparisonTest.replace([
            {id: 'query', title: 'Query', original: 'SELECT 1;', modified: null},
        ]),
    );
    await expect(page.getByRole('button', {name: 'Restore file'})).toHaveCount(0);
});

test('native revert transfers a changed fragment to the modified model', async ({page}) => {
    const query = page.getByRole('region', {name: 'Query', exact: true});
    await query.getByTitle('Revert Change', {exact: true}).click();
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().items[0].modified))
        .toBe('SELECT 1;');
    await expect(query.locator('.qp-comparison-block__added')).toHaveText('+0');
    expect(await page.evaluate(() => window.comparisonTest.snapshot().changes)).toEqual([
        {id: 'query', value: 'SELECT 1;'},
    ]);
});

test('selects versions and swaps both sides in one controlled update', async ({page}) => {
    await page.evaluate(() => window.comparisonTest.enableHeader());
    await page.getByRole('combobox', {name: 'Baseline', exact: true}).click();
    await page.getByRole('option', {name: 'Query · version 3', exact: true}).click();
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().items[0].original))
        .toBe('SELECT 3;');
    await page.getByRole('combobox', {name: 'Competitor', exact: true}).click();
    const competitorPopup = await page
        .getByRole('combobox', {name: 'Competitor', exact: true})
        .getAttribute('aria-controls');
    await page
        .locator(`[id="${competitorPopup}"]`)
        .getByRole('option', {name: 'Query · version 1', exact: true})
        .click();
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().items[0].modified))
        .toBe('SELECT 1;');
    await page.getByRole('button', {name: 'Swap versions', exact: true}).click();
    const snapshot = await page.evaluate(() => window.comparisonTest.snapshot());
    expect(snapshot.selections).toEqual([
        {originalId: 'v3', modifiedId: 'v2'},
        {originalId: 'v3', modifiedId: 'v1'},
        {originalId: 'v1', modifiedId: 'v3'},
    ]);
    expect(snapshot.items[0]).toMatchObject({original: 'SELECT 1;', modified: 'SELECT 3;'});
    expect(snapshot.changes).toEqual([]);
    await expect(page.getByRole('option')).toHaveCount(0);
    await expect(
        page
            .getByRole('region', {name: 'Query', exact: true})
            .locator('.qp-comparison-block__added'),
    ).toHaveText('+1');
    await page.screenshot({
        path: '/tmp/querieskit-comparison-header.png',
        fullPage: true,
        animations: 'disabled',
    });
    await page.evaluate(() => window.comparisonTest.setTheme('dark'));
    await expect(page.locator('.g-root')).toHaveClass(/theme_dark/);
    await page.screenshot({
        path: '/tmp/querieskit-comparison-header-dark.png',
        fullPage: true,
        animations: 'disabled',
    });
});

test('reset restores selected version and actions guard clean and pending states', async ({
    page,
}) => {
    const reset = page.getByRole('button', {name: 'Reset changes', exact: true});
    const save = page.getByRole('button', {name: 'Save changes', exact: true});
    const create = page.getByRole('button', {name: 'Create Query', exact: true});
    await expect(reset).toBeDisabled();
    await expect(save).toBeDisabled();
    await expect(create).toBeDisabled();
    await page.evaluate(() => window.comparisonTest.enableHeader());
    await expect(reset).toBeDisabled();
    await expect(save).toBeDisabled();
    await expect(create).toBeEnabled();
    await page.evaluate(() => window.comparisonTest.edit('query', 'SELECT 42;'));
    await expect(reset).toBeEnabled();
    await expect(save).toBeEnabled();
    await reset.click();
    await expect
        .poll(() => page.evaluate(() => window.comparisonTest.snapshot().items[0].modified))
        .toBe('SELECT 2;');
    await expect(reset).toBeDisabled();
    await page.evaluate(() => window.comparisonTest.edit('query', 'SELECT 99;'));
    await save.click();
    await expect(reset).toBeDisabled();
    await expect(save).toBeDisabled();
    await expect(create).toBeDisabled();
    await expect(page.getByRole('combobox', {name: 'Baseline', exact: true})).toBeDisabled();
    await expect(page.getByRole('combobox', {name: 'Competitor', exact: true})).toBeDisabled();
    await expect(page.getByRole('button', {name: 'Swap versions', exact: true})).toBeDisabled();
    await expect(page.getByRole('radio', {name: 'Unified', exact: true})).toBeEnabled();
    await page.evaluate(() => window.comparisonTest.finishAction());
    await create.click();
    await expect(save).toBeDisabled();
    await expect(create).toBeDisabled();
    expect(await page.evaluate(() => window.comparisonTest.snapshot().actionCalls)).toEqual([
        'reset',
        'save',
        'create',
    ]);
});
