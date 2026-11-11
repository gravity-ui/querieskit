import {expect, test} from '../../fixtures';

test('AttachmentListPlaceholder default', async ({page, openStory}) => {
    await openStory('components-attachmentlistplaceholder--default');
    await expect(page.getByText('No attachments', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('default.png');
});

test('AttachmentListPlaceholder custom-message', async ({page, openStory}) => {
    await openStory('components-attachmentlistplaceholder--custom-message');
    await expect(page.getByText('No source files', {exact: true}).first()).toBeVisible();
    await expect(page.locator('#storybook-root')).toHaveScreenshot('custom-message.png');
});
