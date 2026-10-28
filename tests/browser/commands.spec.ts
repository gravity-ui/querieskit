import {expect, test} from '@playwright/test';
import type {} from './fixture/commands';

test('commands follow focus, state, current callbacks and editor lifetime', async ({page}) => {
    await page.goto('/commands.html');
    await expect.poll(() => page.evaluate(() => window.commandTest?.snapshot().ready)).toBe(true);
    const ids = await page.evaluate(() => window.commandTest.snapshot().ids);
    await page.evaluate(() => window.commandTest.focus(0));
    await page.keyboard.press('F8');
    await expect
        .poll(() => page.evaluate(() => window.commandTest.snapshot().calls))
        .toEqual([1, 0]);
    await page.evaluate(() => window.commandTest.focus(1));
    await page.keyboard.press('F8');
    await expect
        .poll(() => page.evaluate(() => window.commandTest.snapshot().calls))
        .toEqual([1, 1]);
    for (const key of ['disabled', 'loading', 'active', 'enabled'] as const) {
        const blocked = key === 'disabled' || key === 'loading';
        await page.evaluate(({key, blocked}) => window.commandTest.configure(key, blocked), {
            key,
            blocked,
        });
        await page.keyboard.press('F8');
        expect(await page.evaluate(() => window.commandTest.snapshot().calls)).toEqual([1, 1]);
        await page.evaluate(({key, blocked}) => window.commandTest.configure(key, !blocked), {
            key,
            blocked,
        });
    }
    await page.evaluate(() => window.commandTest.configure('increment', 10));
    await page.keyboard.press('F8');
    await expect
        .poll(() => page.evaluate(() => window.commandTest.snapshot().calls))
        .toEqual([1, 11]);
    expect(await page.evaluate(() => window.commandTest.snapshot().ids)).toEqual(ids);
    await page.getByRole('textbox', {name: 'outside', exact: true}).focus();
    await page.keyboard.press('F8');
    expect(await page.evaluate(() => window.commandTest.snapshot().calls)).toEqual([1, 11]);
    await page.evaluate(() => window.commandTest.configure('mounted', false));
    await page.keyboard.press('F8');
    expect(await page.evaluate(() => window.commandTest.snapshot().calls)).toEqual([1, 11]);
});
