import type {Locator, Page} from '@playwright/test';
import {expect} from '@playwright/test';

// Canvas keeps rasterized fallback glyphs after a webfont loads. Explicitly load
// the drawing fonts, then change/restore the viewport to force a fresh render.
export async function prepareCanvas(page: Page, root: Locator, fitLabel: 'Fit' | 'Fit all') {
    await expect(root.locator('canvas').first()).toBeVisible();
    await root.evaluate(async (element) => {
        const family = getComputedStyle(element).getPropertyValue('--g-font-family-sans').trim();
        if (!family) throw new Error('Missing canvas font family');

        for (const font of [`400 13px ${family}`, `500 13px ${family}`]) {
            const faces = await document.fonts.load(font, 'Map 2684677 00:00:42');
            if (!faces.length || faces.some((face) => face.status !== 'loaded')) {
                throw new Error(`Canvas webfont unavailable: ${font}`);
            }
        }
        await document.fonts.ready;
    });
    // Timeline's Fit all is a no-op if its range has not changed. Graph's Fit
    // always redraws, even at maximum zoom where Zoom in is disabled.
    if (fitLabel === 'Fit all') {
        await root.getByRole('button', {name: 'Zoom in', exact: true}).click();
    }
    await root.getByRole('button', {name: fitLabel, exact: true}).click();
    await page.mouse.move(0, 0);
    await page.evaluate(
        () =>
            new Promise<void>((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            }),
    );
}
