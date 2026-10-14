import {expect, test} from '@playwright/test';
import type {} from './fixture/query-page';

test.beforeEach(async ({page}) => {
    await page.goto('/query-page.html');
    await expect(page.locator('.monaco-editor')).toBeVisible();
});

test('resizes by pointer and keyboard and retains drafts through layout changes', async ({
    page,
}) => {
    const sidebar = page.getByRole('separator', {name: 'Resize sidebar'});
    const results = page.getByRole('separator', {name: 'Resize results'});
    await sidebar.press('ArrowRight');
    await expect(sidebar).toHaveAttribute('aria-valuenow', '316');
    const box = (await results.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 50);
    await page.mouse.up();
    await expect(results).toHaveAttribute('aria-valuenow', '350');

    await page.getByRole('textbox', {name: 'Sidebar draft', exact: true}).fill('sidebar retained');
    await page.getByRole('textbox', {name: 'Result draft', exact: true}).fill('result retained');
    await page.locator('.monaco-editor .view-lines').click({position: {x: 100, y: 10}});
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.insertText(' -- retained');
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('-- retained');
    // A DOM marker catches Monaco remounts in addition to checking draft state.
    await page
        .locator('.monaco-editor')
        .evaluate((element) => element.setAttribute('data-retained', 'yes'));
    await page.getByRole('button', {name: 'Hide sidebar', exact: true}).click();
    await expect(page.getByRole('textbox', {name: 'Sidebar draft', exact: true})).toBeHidden();
    await page.getByRole('button', {name: 'Show sidebar', exact: true}).click();
    await expect(page.getByRole('textbox', {name: 'Sidebar draft', exact: true})).toHaveValue(
        'sidebar retained',
    );
    await page.getByRole('button', {name: 'Expand panel', exact: true}).click();
    await expect(page.locator('.monaco-editor')).toBeHidden();
    await expect(page.locator('.qp-query-page__sidebar')).toBeVisible();
    await page.getByRole('button', {name: 'Collapse panel', exact: true}).click();
    await expect(page.locator('.monaco-editor')).toBeVisible();
    await expect(page.locator('.monaco-editor')).toHaveAttribute('data-retained', 'yes');
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('-- retained');
    await page.locator('.monaco-editor .view-lines').click({position: {x: 100, y: 10}});
    await page.keyboard.press('ControlOrMeta+z');
    await expect(page.locator('.monaco-editor .view-lines')).not.toContainText('-- retained');
    await page.getByRole('button', {name: 'Collapse content', exact: true}).click();
    await expect(page.getByRole('textbox', {name: 'Result draft', exact: true})).toBeHidden();
    await page.getByRole('button', {name: 'Expand content', exact: true}).click();
    await expect(page.getByRole('textbox', {name: 'Result draft', exact: true})).toHaveValue(
        'result retained',
    );
});

test('small containers scroll without overlapping editor and results', async ({page}) => {
    await page.setViewportSize({width: 480, height: 260});
    const editor = (await page.locator('.qp-query-workspace__editor').boundingBox())!;
    const results = (await page.locator('.qp-query-workspace__results').boundingBox())!;
    expect(editor.height).toBeGreaterThanOrEqual(160);
    expect(results.height).toBeGreaterThanOrEqual(120);
    expect(results.y).toBeGreaterThanOrEqual(editor.y + editor.height);
    expect(
        await page
            .locator('.qp-query-page')
            .evaluate(
                (element) =>
                    element.scrollWidth > element.clientWidth &&
                    element.scrollHeight > element.clientHeight,
            ),
    ).toBe(true);
});

for (const tallTabs of [false, true]) {
    test(`restores layout after repeated result collapse with tall tab strip=${tallTabs}`, async ({
        page,
    }) => {
        await page.goto(`/query-page.html?tallTabs=${tallTabs ? 1 : 0}`);
        const editor = page.locator('.qp-query-workspace__editor');
        const monaco = page.locator('.monaco-editor');
        await expect(monaco).toBeVisible();
        const initialHeight = await editor.evaluate((element) => element.clientHeight);
        for (let cycle = 0; cycle < 3; cycle++) {
            await page.getByRole('button', {name: 'Collapse content', exact: true}).click();
            await expect
                .poll(() => editor.evaluate((element) => element.clientHeight))
                .toBeGreaterThan(initialHeight);
            // Wait for Monaco's automatic layout to adopt the larger container.
            await expect
                .poll(() => monaco.evaluate((element) => element.clientHeight))
                .toBeGreaterThan(initialHeight);
            await page.getByRole('button', {name: 'Expand content', exact: true}).click();
            await expect
                .poll(() => editor.evaluate((element) => element.clientHeight))
                .toBe(initialHeight);
            const bounds = await page.locator('.qp-query-page').evaluate((element) => {
                const results = element.querySelector('.qp-query-workspace__results');
                if (!results) throw new Error('Missing results');
                return {
                    overflow: element.scrollHeight - element.clientHeight,
                    bottom:
                        results.getBoundingClientRect().bottom -
                        element.getBoundingClientRect().bottom,
                };
            });
            expect(bounds.overflow).toBe(0);
            expect(bounds.bottom).toBeLessThanOrEqual(1);
        }
    });
}

test('tabs own separate editors, undo history, result state and panel layout', async ({page}) => {
    const first = page.getByRole('tabpanel', {name: 'Query 1', exact: true, includeHidden: true});
    const second = page.getByRole('tabpanel', {name: 'Query 2', exact: true, includeHidden: true});
    await expect(page.locator('.monaco-editor')).toHaveCount(1);
    const editor = first.locator('.monaco-editor');
    await editor.locator('.view-lines').click({position: {x: 100, y: 10}});
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.insertText(' -- first draft');
    await expect(editor.locator('.view-lines')).toContainText('-- first draft');
    await editor.evaluate((element) => element.setAttribute('data-retained', 'first'));
    await first.getByRole('textbox', {name: 'Result draft', exact: true}).fill('first result');
    await first.getByRole('separator', {name: 'Resize results'}).press('ArrowUp');
    await first.getByRole('button', {name: 'Expand panel', exact: true}).click();
    await expect(editor).toBeHidden();
    await page.getByRole('tab', {name: 'Query 2', exact: true}).click();
    await expect(second.locator('.monaco-editor .view-lines')).toContainText('SELECT 2;');
    await expect(second.getByRole('textbox', {name: 'Result draft', exact: true})).toHaveValue('');
    await expect(second.getByRole('separator', {name: 'Resize results'})).toHaveAttribute(
        'aria-valuenow',
        '300',
    );
    await second.getByRole('textbox', {name: 'Result draft', exact: true}).fill('second result');
    await expect(page.locator('.monaco-editor')).toHaveCount(2);
    await expect(first.locator('[data-execution-active]')).toHaveAttribute(
        'data-execution-active',
        'false',
    );
    await page.getByRole('tab', {name: 'Query 1', exact: true}).click();
    await expect(editor).toBeHidden();
    await first.getByRole('button', {name: 'Collapse panel', exact: true}).click();
    await expect(first.getByRole('separator', {name: 'Resize results'})).toHaveAttribute(
        'aria-valuenow',
        '316',
    );
    await expect(first.getByRole('textbox', {name: 'Result draft', exact: true})).toHaveValue(
        'first result',
    );
    await expect(editor).toHaveAttribute('data-retained', 'first');
    await editor.locator('.view-lines').click({position: {x: 100, y: 10}});
    await page.keyboard.press('ControlOrMeta+z');
    await expect(editor.locator('.view-lines')).not.toContainText('-- first draft');
    await page.getByRole('tab', {name: 'Query 2', exact: true}).click();
    await expect(second.getByRole('textbox', {name: 'Result draft', exact: true})).toHaveValue(
        'second result',
    );
    await page.getByRole('button', {name: 'Close tab Query 2', exact: true}).click();
    await expect(page.locator('.monaco-editor')).toHaveCount(1);
    await expect(first).toBeVisible();
});

test('tab header toggle hides the entire sidebar and restores its width', async ({
    page,
}, testInfo) => {
    const tabs = page.locator('.qp-query-tabs');
    const sidebar = page.locator('.qp-query-page__sidebar');
    const divider = page.getByRole('separator', {name: 'Resize sidebar'});
    await divider.press('ArrowRight');
    const initialSidebar = await sidebar.boundingBox();
    expect(initialSidebar).not.toBeNull();
    await page.getByRole('textbox', {name: 'Sidebar draft', exact: true}).fill('retained');
    await tabs.getByRole('button', {name: 'Hide sidebar', exact: true}).click();
    await expect(sidebar).toBeHidden();
    await expect(divider).toBeHidden();
    await expect(tabs.getByRole('button', {name: 'Show sidebar', exact: true})).toBeVisible();
    const root = await page.locator('.qp-query-page').boundingBox();
    const workspace = await page.locator('.qp-query-page__workspace').boundingBox();
    if (!root || !workspace || !initialSidebar) throw new Error('Missing layout');
    expect(workspace.x).toBe(root.x);
    expect(workspace.width).toBe(root.width);
    await page.screenshot({path: testInfo.outputPath('sidebar-hidden.png')});
    await tabs.getByRole('button', {name: 'Show sidebar', exact: true}).click();
    await expect(sidebar).toBeVisible();
    expect((await sidebar.boundingBox())?.width).toBe(initialSidebar.width);
    await expect(page.getByRole('textbox', {name: 'Sidebar draft', exact: true})).toHaveValue(
        'retained',
    );
});

test('factory engines activate their presets in each QueryPage editor and release them on close', async ({
    page,
}) => {
    const first = page.getByRole('tabpanel', {name: 'Query 1', exact: true, includeHidden: true});
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const initial = await page.evaluate(() => window.queryPageTest.snapshot());
    await first.getByRole('combobox', {name: 'Cluster', exact: true}).click();
    await page.getByRole('option', {name: 'Secondary', exact: true}).click();
    for (const [engineId, title, language] of [
        ['yql', 'YQL', 'yql'],
        ['chyt', 'CHYT', 'clickhouse'],
        ['spyt', 'SPYT', 'spyt'],
        ['ql', 'YT QL', 'ytql'],
    ]) {
        if (engineId !== 'yql') {
            await first.getByRole('combobox', {name: 'Engine', exact: true}).click();
            await page.getByRole('option', {name: title, exact: true}).click();
        }
        await expect
            .poll(
                async () =>
                    (await page.evaluate(() => window.queryPageTest.snapshot())).editors['1']
                        .language,
            )
            .toBe(language);
        await page.evaluate(() => window.queryPageTest.suggest('1'));
        await expect(
            first
                .locator('.suggest-widget .monaco-list-row')
                .filter({hasText: `catalog_secondary_${engineId}`}),
        ).toBeVisible();
        await expect
            .poll(
                async () =>
                    (await page.evaluate(() => window.queryPageTest.snapshot())).requests.slice(
                        -1,
                    )[0],
            )
            .toEqual({engineId, language, clusterId: 'secondary'});
        await page.keyboard.press('Escape');
        const current = await page.evaluate(() => window.queryPageTest.snapshot());
        expect(current.editors['1'].uri).toBe(initial.editors['1'].uri);
        expect(current.models).toHaveLength(initial.models.length);
        expect(current.lifecycle.created - current.lifecycle.disposed).toBe(1);
    }
    await page.getByRole('tab', {name: 'Query 2', exact: true}).click();
    await expect
        .poll(
            async () =>
                (await page.evaluate(() => window.queryPageTest.snapshot())).editors['2'].language,
        )
        .toBe('yql');
    await page.evaluate(() => window.queryPageTest.suggest('2'));
    await expect(
        page
            .getByRole('tabpanel', {name: 'Query 2', exact: true})
            .locator('.suggest-widget .monaco-list-row')
            .filter({hasText: 'catalog_c_yql'}),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', {name: 'Close tab Query 1', exact: true}).click();
    await expect
        .poll(
            async () => (await page.evaluate(() => window.queryPageTest.snapshot())).models.length,
        )
        .toBe(initial.models.length);
    const closed = await page.evaluate(() => window.queryPageTest.snapshot());
    expect(closed.models.some(({uri}) => uri === initial.editors['1'].uri)).toBe(false);
    expect(closed.lifecycle.created - closed.lifecycle.disposed).toBe(1);
    expect(pageErrors).toEqual([]);
});
