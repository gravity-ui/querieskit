import {expect, test} from '../../fixtures';

test('LazyList default', async ({page, openStory}) => {
    await openStory('components-lazylist--default');
    await expect(page.getByText('Second query', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('LazyList empty', async ({page, openStory}) => {
    await openStory('components-lazylist--empty');
    await expect(page.getByText('No saved queries', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty.png');
});

test('LazyList error', async ({page, openStory}) => {
    await openStory('components-lazylist--error');
    await expect(page.getByText('Could not load queries', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('error.png');
});
