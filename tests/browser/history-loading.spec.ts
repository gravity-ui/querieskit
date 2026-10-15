import {expect, test} from '@playwright/test';
import type {} from './fixture/history-loading';

test('history loads Monaco only for full search and preserves the row while loading', async ({
    page,
}) => {
    const editorRequests: string[] = [];
    page.on('request', (request) => {
        if (/MonacoEditor\/MonacoEditor\.tsx|monaco-editor.*editor\.api/.test(request.url())) {
            editorRequests.push(request.url());
        }
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    // Delay the lazy module so the fallback and its link are observable deterministically.
    let releaseEditor!: () => void;
    const editorGate = new Promise<void>((resolve) => {
        releaseEditor = resolve;
    });
    await page.route('**/MonacoEditor/MonacoEditor.tsx*', async (route) => {
        await editorGate;
        await route.continue();
    });

    await page.goto('/history-loading.html');
    await expect(page.getByText('History query', {exact: true})).toBeVisible();
    expect(editorRequests).toEqual([]);
    await expect(page.locator('.monaco-editor')).toHaveCount(0);

    try {
        await page.evaluate(() => window.historyLoadingTest.search());
        const row = page.locator('.qp-search-row-layout');
        const fallback = row.locator('pre');
        await expect(fallback).toHaveText('SELECT 42 AS answer;');
        await expect(row).toHaveAttribute('href', '#query');
        const before = await row.boundingBox();
        const previewBefore = await fallback.boundingBox();
        releaseEditor();
        await expect(row.locator('.monaco-editor')).toBeVisible();
        await expect(fallback).toHaveCount(0);
        await expect(row.locator('.view-lines')).toContainText('SELECT');
        // Token classes indicate the custom YQL tokenizer has loaded as well.
        await expect(row.locator('.view-lines [class*="mtk"]').first()).toBeVisible();
        const after = await row.boundingBox();
        const previewAfter = await row.locator('.qp-search-row-layout__monaco').boundingBox();
        expect(after?.height).toBe(before?.height);
        expect(previewAfter?.height).toBe(previewBefore?.height);
        expect(editorRequests.length).toBeGreaterThan(0);
        expect(errors).toEqual([]);
    } finally {
        releaseEditor();
    }
});
