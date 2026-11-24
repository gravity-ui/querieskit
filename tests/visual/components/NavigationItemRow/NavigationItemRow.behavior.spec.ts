import {expect, test} from '../../fixtures';

for (const story of ['favorite', 'favorite-custom-icon']) {
    test(`NavigationItemRow ${story} displays a passive badge without hover`, async ({
        page,
        openStory,
    }) => {
        await openStory(`components-navigationitemrow--${story}`);
        await page.mouse.move(900, 700);
        const badge = page.getByRole('img', {name: 'Favorite', exact: true});
        await expect(badge).toBeVisible();
        await expect(badge).toHaveCSS('pointer-events', 'none');
        await expect(badge).toHaveCSS('opacity', '1');
        if (story === 'favorite-custom-icon') {
            await expect(page.getByText('DB', {exact: true})).toBeVisible();
        }
    });
}

for (const story of ['grouped-actions', 'custom-controlled-menu']) {
    test(`NavigationItemRow ${story} keeps actions visible while its menu is open`, async ({
        page,
        openStory,
    }) => {
        await openStory(`components-navigationitemrow--${story}`);
        const row = page.locator('.qp-navigation-item-row');
        const actions = row.locator('.qp-navigation-item-row__actions');
        const trigger = row.getByRole('button', {name: 'More actions'});

        await page.mouse.move(900, 700);
        await expect(actions).toHaveCSS('opacity', '0');
        await row.hover();
        await expect(actions).toHaveCSS('opacity', '1');
        await trigger.click();
        await page.mouse.move(900, 700);
        await expect(page.getByRole('menuitem', {name: 'Path', exact: true})).toBeVisible();
        await expect(actions).toHaveCSS('opacity', '1');
        await page.mouse.click(900, 700);
        await expect(actions).toHaveCSS('opacity', '0');

        await row.hover();
        await trigger.click();
        await page.getByRole('menuitem', {name: 'Path', exact: true}).click();
        await page.mouse.move(900, 700);
        await expect(actions).toHaveCSS('opacity', '0');
        if (story === 'custom-controlled-menu') {
            await expect(row).toContainText('/home/events');
        }
    });
}

test('NavigationItemRow reveals actions for keyboard focus', async ({page, openStory}) => {
    await openStory('components-navigationitemrow--grouped-actions');
    const actions = page.locator('.qp-navigation-item-row__actions');
    await page.mouse.click(900, 700);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', {name: 'Favorite'})).toBeFocused();
    await expect(actions).toHaveCSS('opacity', '1');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', {name: 'Path', exact: true})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', {name: 'More actions'})).toBeFocused();
    await expect(actions).toHaveCSS('opacity', '1');
});

test('NavigationItemRow can keep actions always visible', async ({page, openStory}) => {
    await openStory('components-navigationitemrow--always-visible-actions');
    await page.mouse.move(900, 700);
    await expect(page.locator('.qp-navigation-item-row__actions')).toHaveCSS('opacity', '1');
});

test.describe('touch input', () => {
    test.use({hasTouch: true, isMobile: true});

    test('NavigationItemRow exposes actions without hover', async ({page, openStory}) => {
        await openStory('components-navigationitemrow--grouped-actions');
        await expect(page.locator('.qp-navigation-item-row__actions')).toHaveCSS('opacity', '1');
        await page.getByRole('button', {name: 'More actions'}).tap();
        await expect(page.getByRole('menuitem', {name: 'Path', exact: true})).toBeVisible();
    });
});
