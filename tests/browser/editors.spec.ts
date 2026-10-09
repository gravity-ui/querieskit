import {type Locator, expect, test} from '@playwright/test';
import type {} from './fixture/main';

async function expectSuggestion(editor: Locator, label: string) {
    await expect(
        editor.locator('.suggest-widget .monaco-list-row').filter({hasText: label}),
    ).toBeVisible();
}

test.beforeEach(async ({page}) => {
    page.on('pageerror', (error) => {
        throw error;
    });
    await page.goto('/');
    await expect
        .poll(() => page.evaluate(() => Boolean(window.editorTest?.snapshot().second.ready)))
        .toBe(true);
});

test('completion, formatting and inline providers stay local to each editor', async ({page}) => {
    const first = page.getByTestId('first');
    const second = page.getByTestId('second');
    await page.evaluate(() => window.editorTest.suggest('first'));
    await expectSuggestion(first, 'first_alpha_completion');
    await expect(first.locator('.suggest-widget')).not.toContainText('second_beta_completion');
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.editorTest.suggest('second'));
    await expectSuggestion(second, 'second_beta_completion');
    await expect(second.locator('.suggest-widget')).not.toContainText('first_alpha_completion');
    await page.keyboard.press('Escape');

    const before = await page.evaluate(() => window.editorTest.snapshot());
    await page.evaluate(() => window.editorTest.replaceCompletion('first'));
    await page.evaluate(() => window.editorTest.suggest('first'));
    await expectSuggestion(first, 'first_replacement');
    await expect(first.locator('.suggest-widget')).not.toContainText('first_alpha_completion');
    expect((await page.evaluate(() => window.editorTest.snapshot())).first.created).toBe(
        before.first.created,
    );
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.editorTest.suggest('second'));
    await expectSuggestion(second, 'second_beta_completion');
    await page.keyboard.press('Escape');

    await page.evaluate(() => window.editorTest.inline('first'));
    await expect(first.locator('.ghost-text-decoration')).toContainText('first_alpha_inline');
    await expect(first.locator('.ghost-text-decoration')).not.toContainText('second_beta_inline');
    await expect(page.getByRole('alert').filter({hasText: 'first_alpha_inline'})).toBeAttached();
    await page.evaluate(() => window.editorTest.inline('second'));
    await expect(second.locator('.ghost-text-decoration')).toContainText('second_beta_inline');
    await expect(page.getByRole('alert').filter({hasText: 'second_beta_inline'})).toBeAttached();
    await page.keyboard.press('Escape');

    await page.evaluate(() => window.editorTest.format('first'));
    await page.evaluate(() => window.editorTest.format('second'));
    const after = await page.evaluate(() => window.editorTest.snapshot());
    expect(after.first.value).toBe('first_alpha_formatted');
    expect(after.second.value).toBe('second_beta_formatted');
    expect(after.first.uri).toBe(before.first.uri);
    expect(after.second.uri).toBe(before.second.uri);
    expect(after.first.uri).not.toBe(after.second.uri);
});

test('replacing hover keeps the preset and pending completion alive', async ({page}) => {
    await page.evaluate(() => {
        window.editorTest.hold('first');
        window.editorTest.suggest('first');
    });
    await expect
        .poll(() => page.evaluate(() => window.editorTest.snapshot().first.pending))
        .toBe(1);
    const before = await page.evaluate(() => window.editorTest.snapshot());
    await page.evaluate(() => window.editorTest.replaceHover('first'));
    await page.evaluate(() => window.editorTest.release('first'));
    await expectSuggestion(page.getByTestId('first'), 'first_alpha_completion');
    const after = await page.evaluate(() => window.editorTest.snapshot());
    expect(after.first.created).toBe(before.first.created);
    expect(after.first.disposed).toBe(before.first.disposed);
    expect(after.first.cancelled).toBe(before.first.cancelled);
    expect(after.second.created).toBe(before.second.created);
});

test('context and language changes cancel stale results; unmount releases owned models', async ({
    page,
}) => {
    const before = await page.evaluate(() => window.editorTest.snapshot());
    await page.evaluate(() => {
        window.editorTest.hold('first');
        window.editorTest.suggest('first');
    });
    await expect
        .poll(() => page.evaluate(() => window.editorTest.snapshot().first.pending))
        .toBe(1);
    await page.evaluate(() =>
        window.editorTest.update('first', {clusterId: 'gamma', language: 'clickhouse'}),
    );
    await expect
        .poll(() => page.evaluate(() => window.editorTest.snapshot().first.language))
        .toBe('clickhouse');
    await expect
        .poll(() => page.evaluate(() => window.editorTest.snapshot().first.cancelled))
        .toBeGreaterThan(before.first.cancelled);
    await page.evaluate(() => window.editorTest.release('first'));
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.editorTest.suggest('first'));
    await expectSuggestion(page.getByTestId('first'), 'first_gamma_completion');
    await expect(page.getByTestId('first').locator('.suggest-widget')).not.toContainText(
        'first_alpha_completion',
    );
    const changed = await page.evaluate(() => window.editorTest.snapshot());
    expect(changed.first.uri).toBe(before.first.uri);
    expect(changed.first.created).toBe(before.first.created + 1);
    expect(changed.second.created).toBe(before.second.created);
    await page.keyboard.press('Escape');

    await page.evaluate(() => {
        window.editorTest.hold('first');
        window.editorTest.suggest('first');
    });
    await expect
        .poll(() => page.evaluate(() => window.editorTest.snapshot().first.pending))
        .toBe(1);
    await page.evaluate(() => window.editorTest.update('first', {mounted: false}));
    await expect
        .poll(() => page.evaluate(() => window.editorTest.snapshot().first.ready))
        .toBe(false);
    await page.evaluate(() => window.editorTest.release('first'));
    await expect.poll(() => page.evaluate(() => window.editorTest.modelCount())).toBe(1);
    await page.evaluate(() => window.editorTest.suggest('second'));
    await expectSuggestion(page.getByTestId('second'), 'second_beta_completion');
    await page.evaluate(() => window.editorTest.update('second', {mounted: false}));
    await expect.poll(() => page.evaluate(() => window.editorTest.modelCount())).toBe(0);
    const after = await page.evaluate(() => window.editorTest.snapshot());
    expect(after.first.created).toBe(after.first.disposed);
    expect(after.second.created).toBe(after.second.disposed);
});
