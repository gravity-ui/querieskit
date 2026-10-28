import {expect, test, type Page} from '@playwright/test';
import type {} from './fixture/dashboard';

function item(page: Page, id: string) {
    return page.locator('.react-grid-item').filter({has: page.getByTestId(`dashboard-${id}`)});
}

async function dragDown(page: Page, id: string) {
    const handle = item(page, id).locator('.DRAG_HANDLE_CLASSNAME');
    await handle.hover();
    const box = await handle.boundingBox();
    expect(box).not.toBeNull();
    const x = box!.x + box!.width / 2;
    const y = box!.y + box!.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 216, {steps: 12});
    await page.mouse.up();
}

test('controlled dashboard rejects unaccepted movement and applies external layout without events', async ({
    page,
}) => {
    await page.goto('/dashboard.html');
    await expect(item(page, 'a')).toBeVisible();
    const start = (await item(page, 'a').boundingBox())!;
    expect(await page.evaluate(() => window.dashboardTest.snapshot().calls)).toHaveLength(0);
    await dragDown(page, 'a');
    await expect
        .poll(() => page.evaluate(() => window.dashboardTest.snapshot().calls.length))
        .toBe(1);
    expect(
        await page.evaluate(
            () => window.dashboardTest.snapshot().calls[0].find(({i}) => i === 'a')?.y,
        ),
    ).toBeGreaterThan(0);
    await expect
        .poll(async () => Math.round((await item(page, 'a').boundingBox())!.y))
        .toBe(Math.round(start.y));

    await page.evaluate(() => window.dashboardTest.external());
    await expect
        .poll(async () => Math.round((await item(page, 'a').boundingBox())!.y - start.y))
        .toBe(288);
    await page.evaluate(() => window.dashboardTest.rerender());
    expect(await page.evaluate(() => window.dashboardTest.snapshot().calls)).toHaveLength(1);
});

test('uncontrolled dashboard preserves a user move across rerenders and reordered items', async ({
    page,
}) => {
    await page.goto('/dashboard.html');
    await expect(item(page, 'a')).toBeVisible();
    await page.evaluate(() => window.dashboardTest.uncontrolled());
    const start = (await item(page, 'a').boundingBox())!;
    await dragDown(page, 'a');
    await expect
        .poll(() => page.evaluate(() => window.dashboardTest.snapshot().calls.length))
        .toBe(1);
    await expect
        .poll(async () => Math.round((await item(page, 'a').boundingBox())!.y - start.y))
        .toBe(216);
    await page.evaluate(() => window.dashboardTest.rerender());
    await page.evaluate(() => window.dashboardTest.reverse());
    await expect
        .poll(async () => Math.round((await item(page, 'a').boundingBox())!.y - start.y))
        .toBe(216);
    expect(await page.evaluate(() => window.dashboardTest.snapshot().calls)).toHaveLength(1);
});
