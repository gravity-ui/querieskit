import {expect, test} from '@playwright/test';

test('execution header uses available width before wrapping short tabs', async ({page}) => {
    // 920 px of content, as in a 1280 px query page with its sidebar open.
    await page.setViewportSize({width: 936, height: 400});
    await page.goto('/execution-header.html');
    await expect(page.getByText('Query execution failed', {exact: true})).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const tabs = page.getByRole('tablist', {name: 'Query execution'});
    const share = page.getByRole('button', {name: 'Share', exact: true});
    await expect(async () => {
        const tabRect = await tabs.boundingBox();
        const actionRect = await share.boundingBox();
        if (!tabRect || !actionRect) throw new Error('Header is not visible');
        expect(actionRect.y).toBeLessThan(tabRect.y + tabRect.height);
        expect(actionRect.y + actionRect.height).toBeGreaterThan(tabRect.y);
    }).toPass({timeout: 3000});

    await page.setViewportSize({width: 400, height: 500});
    await expect(share).toBeVisible();
    await expect(async () => {
        const tabRect = await tabs.boundingBox();
        const actionRect = await share.boundingBox();
        if (!tabRect || !actionRect) throw new Error('Header is not visible');
        expect(actionRect.y).toBeGreaterThanOrEqual(tabRect.y + tabRect.height);
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow).toBe(false);
    }).toPass({timeout: 3000});
});
