import {expect, test} from '../../fixtures';

test('DataTypePopup nested', async ({page, openStory}) => {
    await openStory('components-datatypepopup--nested');
    await page.getByRole('button').click();
    await expect(page.locator('.qp-data-type-popup__content').first()).toBeVisible();
    await expect(page.locator('.qp-data-type-popup__content')).toHaveScreenshot('nested.png');
});

test('DataTypePopup optional-and-tagged', async ({page, openStory}) => {
    await openStory('components-datatypepopup--optional-and-tagged');
    await page.getByRole('button').click();
    await expect(page.locator('.qp-data-type-popup__content').first()).toBeVisible();
    await expect(page.locator('.qp-data-type-popup__content')).toHaveScreenshot(
        'optional-and-tagged.png',
    );
});
