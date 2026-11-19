import {expect, test} from '@playwright/test';
import type {Page} from '@playwright/test';
import type {} from './fixture/lazy-list-pagination';

// Let browser IntersectionObserver notifications run before asserting no request.
async function settleObserver(page: Page) {
    await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 100))),
    );
}

for (const match of [true, false]) {
    test(`loads consecutive empty pages until ${match ? 'a match appears' : 'pages are exhausted'}`, async ({
        page,
    }) => {
        await page.goto('/lazy-list-pagination.html');
        const requests = page.getByTestId('requests');
        await expect(requests).toHaveText('1');
        for (let count = 1; count <= 3; count++) {
            await expect(page.getByTestId('loading')).toHaveText('true');
            await expect(page.getByText('No matching tutorials')).toHaveCount(0);
            await expect(page.locator('.qp-list-spinner')).toBeVisible();
            await settleObserver(page);
            await expect(requests).toHaveText(String(count));
            if (count < 3) {
                // Keep the exact same empty items array across request completion.
                await page.evaluate(() => window.lazyListPaginationTest.complete(false, true));
                await expect(requests).toHaveText(String(count + 1));
            }
        }
        await page.evaluate((found) => window.lazyListPaginationTest.complete(found, false), match);
        await expect(
            page.getByText(match ? 'Matching tutorial' : 'No matching tutorials', {exact: true}),
        ).toBeVisible();
        await expect(page.locator('.qp-list-spinner')).toHaveCount(0);
        await settleObserver(page);
        await expect(requests).toHaveText('3');
    });
}

for (const mode of ['hidden', 'inactive'] as const) {
    test(`pauses empty pagination while ${mode} and resumes after completion without new items`, async ({
        page,
    }) => {
        await page.goto(`/lazy-list-pagination.html?${mode}`);
        await expect(page.getByTestId('requests')).toHaveText('0');
        await settleObserver(page);
        await expect(page.getByTestId('requests')).toHaveText('0');
        await page.evaluate((state) => {
            if (state === 'hidden') window.lazyListPaginationTest.setHidden(false);
            else window.lazyListPaginationTest.setActive(true);
        }, mode);
        await expect(page.getByTestId('requests')).toHaveText('1');
        await page.evaluate((state) => {
            if (state === 'hidden') window.lazyListPaginationTest.setHidden(true);
            else window.lazyListPaginationTest.setActive(false);
        }, mode);
        await page.evaluate(() => window.lazyListPaginationTest.complete(false, true));
        await settleObserver(page);
        await expect(page.getByTestId('requests')).toHaveText('1');
        await page.evaluate((state) => {
            if (state === 'hidden') window.lazyListPaginationTest.setHidden(false);
            else window.lazyListPaginationTest.setActive(true);
        }, mode);
        await expect(page.getByTestId('requests')).toHaveText('2');
    });
}
