import {expect, test} from '../../fixtures';

test('AttachmentList default', async ({page, openStory}) => {
    await openStory('components-attachmentlist--default');
    await expect(page.getByText('README', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('AttachmentList change-states', async ({page, openStory}) => {
    await openStory('components-attachmentlist--change-states');
    await expect(page.getByText('index.js', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('change-states.png');
});

test('AttachmentList empty', async ({page, openStory}) => {
    await openStory('components-attachmentlist--empty');
    await expect(page.getByText('No attachments yet', {exact: true})).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('empty.png');
});
