import {expect, test} from '../../fixtures';

test('query diff', async ({page, openStory}) => {
    await openStory('modules-querycomparison--query-only');
    await expect(page.locator('.qp-comparison-block__added')).toHaveCount(1);
    await expect(page.locator('.monaco-diff-editor .view-line').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('query-diff.png');
});

test('unified file comparisons', async ({page, openStory}) => {
    await openStory('modules-querycomparison--unified');
    await expect(page.locator('.qp-comparison-block__added')).toHaveText(['+2', '+3', '+1', '+0']);
    await expect(page.locator('.qp-comparison-block__removed')).toHaveText([
        '−2',
        '−2',
        '−0',
        '−1',
    ]);
    await expect(page.locator('#storybook-root')).toHaveAttribute('data-monaco-ready', 'true');
    // Recreate inline view zones after both original and modified tokenizers are ready.
    await page.getByRole('radio', {name: 'Split', exact: true}).check();
    await page.getByRole('radio', {name: 'Unified', exact: true}).check();
    await page.mouse.move(0, 0);

    const query = page.getByRole('region', {name: 'query.sql', exact: true});
    const modified = query.locator('.monaco-editor.modified-in-monaco-diff-editor');
    // Diff statistics can arrive before Monaco applies inline view zones and
    // resizes the editor. Wait for the last SQL line to be rendered without clipping.
    await expect(modified.locator('.view-line').filter({hasText: /LIMIT\s*500;/})).toBeInViewport({
        ratio: 1,
    });
    // Both original (deleted) and modified tokenization are asynchronous. A
    // colored SELECT in the modified model does not imply deleted lines are ready.
    const limits = query
        .locator('.monaco-editor.modified-in-monaco-diff-editor .view-line [class*="mtk"]')
        .filter({hasText: /^LIMIT$/});
    await expect(limits).toHaveCount(2);
    const tokens = [
        query
            .locator('.monaco-editor.modified-in-monaco-diff-editor .view-line [class*="mtk"]')
            .filter({hasText: /^SELECT$/}),
        limits,
        page
            .getByRole('region', {name: 'Configuration', exact: true})
            .locator('.monaco-editor.modified-in-monaco-diff-editor .view-line [class*="mtk"]')
            .filter({hasText: /^production$/}),
        page
            .getByRole('region', {name: 'new.sql', exact: true})
            .locator('.monaco-editor.modified-in-monaco-diff-editor .view-line [class*="mtk"]')
            .filter({hasText: /^SELECT$/}),
        page
            .getByRole('region', {name: 'old.sql', exact: true})
            .locator('.monaco-editor.modified-in-monaco-diff-editor .view-line [class*="mtk"]')
            .filter({hasText: /^SELECT$/}),
    ];
    for (const token of tokens) {
        await expect(token.first()).toBeVisible();
        await expect
            .poll(() =>
                token.evaluateAll((elements) =>
                    elements.every((element) => {
                        const lines = element.closest('.view-lines');
                        return (
                            lines !== null &&
                            getComputedStyle(element).color !== getComputedStyle(lines).color
                        );
                    }),
                ),
            )
            .toBe(true);
    }
    // Monaco draws its own caret; Playwright's caret option only handles native ones.
    await page.addStyleTag({
        content: '.monaco-editor .cursors-layer > .cursor { visibility: hidden !important; }',
    });
    await expect(page.locator('#storybook-root')).toHaveScreenshot('unified-file-comparisons.png');
});

test('no files', async ({page, openStory}) => {
    await openStory('modules-querycomparison--empty');
    await expect(page.getByText('No files to compare', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('no-files.png');
});
