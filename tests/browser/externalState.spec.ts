import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
    await page.goto('/external-state.html');
    await expect(page.locator('.qp-external-state-example__query .monaco-editor')).toBeVisible();
});

test('retains the editor and undo history across file layout and callback changes', async ({
    page,
}) => {
    const editor = page.locator('.qp-external-state-example__query .monaco-editor');
    await editor.evaluate((element) => element.setAttribute('data-retained', 'yes'));
    await editor.locator('.view-lines').click({position: {x: 100, y: 10}});
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.insertText(' -- retained');
    await page.getByRole('combobox', {name: 'Engine', exact: true}).click();
    await page.getByRole('option', {name: 'Analytics', exact: true}).click();
    await expect(page.getByRole('button', {name: 'Format', exact: true})).toHaveCount(0);
    await page.getByRole('combobox', {name: 'Cluster', exact: true}).click();
    await page.getByRole('option', {name: 'Production', exact: true}).click();
    await page.getByRole('button', {name: 'Open file', exact: true}).click();
    const fileEditor = page.locator('.qp-external-state-example__file .monaco-editor');
    await fileEditor.locator('.view-lines').click({position: {x: 100, y: 10}});
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.insertText(' -- file draft');
    await page.getByRole('button', {name: 'Change file width', exact: true}).click();
    await page.getByRole('button', {name: 'Expand file', exact: true}).click();
    await expect(editor).toBeHidden();
    await page.getByRole('button', {name: 'Restore file', exact: true}).click();
    await expect(editor).toHaveAttribute('data-retained', 'yes');
    await page.getByRole('button', {name: 'Close file', exact: true}).click();
    await page.getByRole('button', {name: 'Open file', exact: true}).click();
    await expect(fileEditor.locator('.view-lines')).toContainText('-- file draft');
    await page.getByRole('button', {name: 'Close file', exact: true}).click();
    await editor.locator('.view-lines').click({position: {x: 100, y: 10}});
    await page.keyboard.press('ControlOrMeta+z');
    await expect(editor.locator('.view-lines')).not.toContainText('-- retained');
    await page.keyboard.press('ControlOrMeta+Shift+z');
    await expect(editor.locator('.view-lines')).toContainText('-- retained');
    await page.getByRole('button', {name: 'Go to line 2', exact: true}).click();
    await expect(page.getByText('Cursor line: 2', {exact: true})).toBeVisible();
});

test('keeps execution controls available when collapsed and at minimum height', async ({page}) => {
    await page.setViewportSize({width: 480, height: 720});
    await page.getByRole('button', {name: 'Minimum results height', exact: true}).click();
    await page.getByRole('button', {name: 'Run', exact: true}).click();
    const stop = page.getByRole('button', {name: 'Stop', exact: true});
    await expect(stop).toBeEnabled();
    await page.getByRole('button', {name: 'Collapse content', exact: true}).click();
    await expect(stop).toBeVisible();
    await expect(page.getByText(/^Running ·/)).toBeVisible();
    await stop.click();
    await expect(stop).toBeDisabled();
    await page.getByRole('button', {name: 'Expand content', exact: true}).click();
    await expect(page.getByRole('separator', {name: 'Resize results'})).toHaveAttribute(
        'aria-valuenow',
        '120',
    );
    const header = page.locator('.qp-query-execution-panel__header');
    const status = page.locator('.qp-external-state-example__status');
    const headerBox = (await header.boundingBox())!;
    const statusBox = (await status.boundingBox())!;
    expect(statusBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
    const content = page.locator('.qp-query-execution-panel__content');
    const contentBox = (await content.boundingBox())!;
    expect(contentBox.y).toBeGreaterThanOrEqual(statusBox.y + statusBox.height);
    expect(contentBox.height).toBeGreaterThan(0);
    await page.getByRole('button', {name: 'Run', exact: true}).click();
    const expand = page.getByRole('button', {name: 'Expand panel', exact: true});
    await expand.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.qp-external-state-example__query .monaco-editor')).toBeHidden();
    await expect(stop).toBeEnabled();
    await stop.click();
    await expect(stop).toBeDisabled();
});

test('hides the chart editor with an inactive workspace and restores its draft', async ({page}) => {
    await page.getByRole('button', {name: 'Open file', exact: true}).click();
    await page.getByRole('tab', {name: 'Charts', exact: true}).click();
    await page.getByRole('button', {name: 'Add chart', exact: true}).click();
    await page.getByRole('menuitem', {name: 'Line', exact: true}).click();
    const title = page.getByRole('textbox', {name: 'Chart title', exact: true});
    await title.fill('Retained chart draft');
    // Simulate an external application update while the modal captures pointer input.
    await page
        .getByRole('button', {name: 'Expand file', exact: true})
        .evaluate((button: HTMLButtonElement) => button.click());
    await expect(title).toBeHidden();
    await page.getByRole('button', {name: 'Restore file', exact: true}).click();
    await expect(title).toHaveValue('Retained chart draft');
    await page.getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(page.getByRole('tab', {name: 'Charts', exact: true})).toHaveAttribute(
        'aria-selected',
        'true',
    );
});
