import {expect, test} from '../../fixtures';

test('SkeletonRows default', async ({page, openStory}) => {
    await openStory('components-skeletonrows--default');
    await expect(page.locator('.g-skeleton')).toHaveCount(3);
    await expect(page.locator('.g-skeleton').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('SkeletonRows single-row', async ({page, openStory}) => {
    await openStory('components-skeletonrows--single-row');
    await expect(page.locator('.g-skeleton')).toHaveCount(1);
    await expect(page.locator('.g-skeleton').first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('single-row.png');
});
