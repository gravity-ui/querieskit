import {expect, test} from '@playwright/test';

for (const insecure of [false, true]) {
    test(`creates and saves attachments in ${insecure ? 'insecure HTTP' : 'secure'} context`, async ({
        page,
        baseURL,
    }) => {
        if (!baseURL) throw new Error('The browser fixture requires baseURL');
        const origin = insecure ? 'http://querieskit.test' : baseURL;
        if (insecure) {
            // Serve the fixture under a non-loopback origin without changing DNS or mocking crypto.
            await page.route(`${origin}/**`, async (route) => {
                const response = await route.fetch({
                    url: route.request().url().replace(origin, baseURL),
                });
                await route.fulfill({response});
            });
        }
        await page.goto(`${origin}/standard-panels.html`);
        expect(await page.evaluate(() => window.isSecureContext)).toBe(!insecure);
        expect(await page.evaluate(() => typeof crypto.randomUUID)).toBe(
            insecure ? 'undefined' : 'function',
        );

        const attachments = page.getByTestId('attachments');
        await attachments.getByRole('button', {name: 'Create empty file', exact: true}).click();
        await attachments.getByRole('textbox').fill('created.sql');
        await attachments.getByRole('button', {name: 'Save', exact: true}).click();
        await expect(attachments.getByText('created.sql', {exact: true})).toBeVisible();
        await expect(attachments.getByRole('textbox')).toHaveCount(0);

        await attachments.getByRole('button', {name: 'Link', exact: true}).click();
        await attachments.locator('textarea').fill('https://example.com/docs');
        await attachments
            .getByRole('textbox')
            .and(attachments.locator('input'))
            .fill('Documentation');
        await attachments.getByRole('button', {name: 'Save', exact: true}).click();
        await expect(attachments.getByText('Documentation', {exact: true})).toBeVisible();
        await expect(attachments.getByRole('textbox')).toHaveCount(0);
        await expect(attachments.getByText('created.sql', {exact: true})).toBeVisible();
    });
}
