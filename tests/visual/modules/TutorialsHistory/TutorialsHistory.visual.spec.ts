import {expect, test} from '../../fixtures';

const cases = [
    {story: 'default', text: 'Getting started with YQL'},
    {story: 'empty', text: 'No tutorials'},
    {story: 'design-selected', text: 'Select specific columns'},
    {story: 'design-reference', text: 'All'},
    {story: 'design-engine-selected', text: 'YQL'},
    {story: 'design-empty', text: 'Nothing found'},
    {story: 'missing-engines', text: 'Select all columns'},
    {story: 'empty-engines', text: 'Select all columns'},
    {story: 'long-engine-name', text: 'Custom analytics query engine'},
];
for (const {story, text} of cases) {
    test(story, async ({page, openStory}) => {
        await openStory(`modules-tutorialshistory--${story}`);
        const root = page.locator('#storybook-root');
        await expect(root).toContainText(text);
        if (story === 'default' || story === 'design-reference') {
            const selectedText = page
                .getByRole('combobox', {name: 'Engine', exact: true})
                .getByText('All', {exact: true});
            await expect(selectedText).toBeVisible();
            expect(
                await selectedText.evaluate(
                    (element) => element.scrollWidth <= element.clientWidth,
                ),
            ).toBe(true);
        }
        if (story === 'missing-engines' || story === 'empty-engines') {
            await expect(page.getByRole('combobox', {name: 'Engine', exact: true})).toHaveCount(0);
        }
        await expect(root).toHaveScreenshot(`${story}.png`);
    });
}

for (const story of ['default', 'design-reference']) {
    test(`${story} engine options`, async ({page, openStory}) => {
        await openStory(`modules-tutorialshistory--${story}`);
        await page.getByRole('combobox', {name: 'Engine', exact: true}).click();
        await expect(page.getByRole('option', {name: 'All', exact: true})).toBeVisible();
        await expect(page.getByRole('option', {name: 'CHYT', exact: true})).toBeVisible();
        await expect(page).toHaveScreenshot(`${story}-engine-options.png`);
    });
}
