// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {ThemeProvider} from '@gravity-ui/uikit';
import {FileEdit} from '../../src/components/AttachmentList/internal/EditAttachmentItem/FileEdit';
import {EditLinkItem} from '../../src/components/AttachmentList/internal/EditAttachmentItem/EditLinkItem';
import {AttachmentItem} from '../../src/components/AttachmentList/internal/AttachmentItem/AttachmentItem';
import {setLang} from '../../src/i18n';
vi.mock('@gravity-ui/uikit', async (original) => {
    const actual = await original<typeof import('@gravity-ui/uikit')>();
    return {...actual, Select: Object.assign(() => <div />, {Option: () => null})};
});
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal(
        'ResizeObserver',
        class {
            public observe() {}
            public unobserve() {}
            public disconnect() {}
        },
    );
    setLang('en');
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
});
afterEach(() => {
    act(() => root.unmount());
    container.remove();
});
const render = (node: React.ReactNode) =>
    act(() => root.render(<ThemeProvider>{node}</ThemeProvider>));
function button(name: string) {
    return [...container.querySelectorAll('button')].find(
        (item) => item.getAttribute('aria-label') === name || item.textContent === name,
    )!;
}
it('keeps invalid file input open on Enter and supports Escape', () => {
    const accept = vi.fn();
    const cancel = vi.fn();
    render(
        <FileEdit
            defaultFileName="duplicate.sql"
            validator={() => 'Duplicate name'}
            onAccept={accept}
            onCancel={cancel}
        />,
    );
    const input = container.querySelector('input')!;
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})));
    expect(accept).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Duplicate name');
    expect(input.value).toBe('duplicate.sql');
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})));
    expect(cancel).toHaveBeenCalledOnce();
});
it('saves a link without token when optional despite available tokens', () => {
    const accept = vi.fn();
    render(
        <EditLinkItem
            tokens={[{value: 'token', title: 'Token'}]}
            tokenRequired={false}
            defaultValues={{name: 'Docs', link: 'https://example.com', token: ''}}
            onAccept={accept}
        />,
    );
    act(() => button('Save').click());
    expect(accept).toHaveBeenCalledExactlyOnceWith({
        name: 'Docs',
        link: 'https://example.com',
        token: '',
    });
});
it('preserves the legacy token requirement with a nonempty tokens list', () => {
    const accept = vi.fn();
    render(
        <EditLinkItem
            tokens={[{value: 'token', title: 'Token'}]}
            defaultValues={{name: 'Docs', link: 'https://example.com', token: ''}}
            onAccept={accept}
        />,
    );
    act(() => button('Save').click());
    expect(accept).not.toHaveBeenCalled();
});
it('provides focusable named row actions without hover and stops opening the row', () => {
    const edit = vi.fn();
    const open = vi.fn();
    const item = {id: 'a', name: 'file.sql'};
    render(
        <div onClick={open}>
            <AttachmentItem attachment={item} onEdit={edit} />
        </div>,
    );
    const action = button('Edit');
    expect(action.tabIndex).toBe(0);
    act(() => action.focus());
    expect(document.activeElement).toBe(action);
    act(() => action.click());
    expect(edit).toHaveBeenCalledExactlyOnceWith(item);
    expect(open).not.toHaveBeenCalled();
});
