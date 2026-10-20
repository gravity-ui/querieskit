// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {Attachments} from '../../src/modules/Attachments';
import type {AttachItem, AttachmentsProps} from '../../src/types/attachments';
import {setLang} from '../../src/i18n';

const capture = vi.hoisted(() => ({current: {} as any, deleted: {} as any, editor: {} as any}));
vi.mock('@gravity-ui/uikit', () => {
    const Container = ({children}: any) => <div>{children}</div>;
    return {
        Box: Container,
        Flex: Container,
        Text: Container,
        TabProvider: Container,
        TabList: Container,
        Tab: Container,
        TabPanel: Container,
        Icon: () => null,
        Button: ({children, onClick, disabled}: any) => (
            <button onClick={onClick} disabled={disabled}>
                {children}
            </button>
        ),
        useFileInput: ({onUpdate}: any) => ({
            controlProps: {
                type: 'file',
                onChange: (event: any) => onUpdate(Array.from(event.target.files)),
            },
            triggerProps: {},
        }),
    };
});
vi.mock('../../src/components/AttachmentList', () => ({
    AttachmentList: (props: any) => {
        capture[props.isDeleted ? 'deleted' : 'current'] = props;
        return props.attachments.map((item: AttachItem) => (
            <React.Fragment key={item.id}>
                {props.editingIds?.includes(item.id) ? props.renderEditForm(item) : item.name}
            </React.Fragment>
        ));
    },
    EditAttachmentItem: (props: any) => {
        capture.editor = props;
        return null;
    },
}));
vi.mock('../../src/components/AttachmentListPlaceholder', () => ({
    AttachmentListPlaceholder: ({onAddFile}: any) => (
        <button onClick={onAddFile}>Empty file</button>
    ),
}));
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    setLang('en');
    container = document.createElement('div');
    root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));
const render = (props: AttachmentsProps, key?: string) =>
    act(() => root.render(<Attachments key={key} {...props} />));
const choose = (file = new File(['contents'], 'local.sql')) => {
    const input = container.querySelector('input')!;
    Object.defineProperty(input, 'files', {value: [file], configurable: true});
    act(() => input.dispatchEvent(new Event('change', {bubbles: true})));
    return file;
};
function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return {promise, resolve, reject};
}
it('preserves metadata and id through rename, deletion and restoration', () => {
    const item = {id: 'a', name: 'old.sql', content: 'select 1', metadata: {owner: 'app'}};
    let value: AttachmentsProps = {attachments: [item], deletedAttachments: []};
    const change = vi.fn((next) => {
        value = {...value, ...next, onChange: change};
        render(value);
    });
    value.onChange = change;
    render(value);
    act(() => capture.current.onEdit(item));
    act(() => capture.editor.onAccept('renamed.sql'));
    expect(value.attachments).toEqual([{...item, name: 'renamed.sql'}]);
    act(() => capture.current.onDelete(value.attachments![0]));
    expect(value.deletedAttachments).toEqual([{...item, name: 'renamed.sql'}]);
    act(() => capture.deleted.onRevert(value.deletedAttachments![0]));
    expect(value.attachments).toEqual([{...item, name: 'renamed.sql'}]);
});
it('forwards validators and independent token requirement', () => {
    const item = {id: 'a', name: 'old.sql', link: 'https://example.com'};
    const validator = vi.fn(() => ({link: 'custom error'}));
    render({
        attachments: [item, {id: 'b', name: 'existing'}],
        tokens: [{value: 't', title: 'Token'}],
        tokenRequired: false,
        validateDuplicates: true,
        linkValidator: validator,
    });
    act(() => capture.current.onEdit(item));
    expect(capture.editor.tokenRequired).toBe(false);
    expect(capture.editor.validator({name: 'existing', link: 'bad'}, false)).toMatchObject({
        link: 'custom error',
        name: expect.any(String),
    });
    expect(validator).toHaveBeenCalledWith({name: 'existing', link: 'bad'}, false);
});
it('keeps duplicate checking opt-in and excludes the edited row', () => {
    const item = {id: 'a', name: 'old.sql'};
    const props = {attachments: [item, {id: 'b', name: 'existing'}]};
    render(props);
    act(() => capture.current.onEdit(item));
    expect(capture.editor.validator('existing')).toBeNull();
    render({...props, validateDuplicates: true});
    expect(capture.editor.validator('existing')).toBeTruthy();
    expect(capture.editor.validator('old.sql')).toBeNull();
    expect(capture.editor.validator('')).toBeTruthy();
});
it('passes the same File once while pending and merges into latest controlled lists', async () => {
    const request = deferred<AttachItem>();
    const onSelectFile = vi.fn(() => request.promise);
    const onChange = vi.fn();
    render({attachments: [], onSelectFile, onChange});
    const file = choose();
    choose(file);
    expect(onSelectFile).toHaveBeenCalledExactlyOnceWith(file);
    const existing = {id: 'other', name: 'other.sql'};
    const deleted = {id: 'deleted', name: 'deleted.sql'};
    render({attachments: [existing], deletedAttachments: [deleted], onSelectFile, onChange});
    const result = {id: 'local', name: 'local.sql'};
    await act(async () => request.resolve(result));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
        attachments: [existing, result],
        deletedAttachments: [deleted],
    });
    // The parent has not accepted the proposed list.
    expect(capture.current.attachments).toEqual([existing]);
});
it('shows errors and retries the same File explicitly', async () => {
    const onSelectFile = vi
        .fn()
        .mockRejectedValueOnce(new Error('Upload failed'))
        .mockResolvedValueOnce({id: 'local', name: 'local.sql'});
    const onChange = vi.fn();
    render({onSelectFile, onChange});
    const file = choose();
    await act(async () => {});
    expect(container.textContent).toContain('Upload failed');
    expect(onChange).not.toHaveBeenCalled();
    await act(async () =>
        [...container.querySelectorAll('button')]
            .find((button) => button.textContent === 'Retry')!
            .click(),
    );
    expect(onSelectFile.mock.calls).toEqual([[file], [file]]);
    expect(onChange).toHaveBeenCalledOnce();
});
it('ignores completed requests after document remount', async () => {
    const request = deferred<AttachItem>();
    const onChange = vi.fn();
    render({onSelectFile: () => request.promise, onChange}, 'document-a');
    choose();
    render({attachments: [{id: 'b', name: 'document-b'}], onChange}, 'document-b');
    await act(async () => request.resolve({id: 'a', name: 'document-a'}));
    expect(onChange).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('document-a');
});
it('rejects returned duplicate IDs without overwriting a controlled attachment', async () => {
    const onChange = vi.fn();
    render({
        attachments: [{id: 'a', name: 'old'}],
        onSelectFile: async () => ({id: 'a', name: 'new'}),
        onChange,
    });
    choose();
    await act(async () => {});
    expect(onChange).not.toHaveBeenCalled();
    expect(container.textContent).toContain('ID');
});
it('creates complete extension models through the application factory', () => {
    const onChange = vi.fn();
    act(() =>
        root.render(
            <Attachments<{id: string; name: string; content: string}>
                createAttachment={(draft) => ({...draft, content: 'initial'})}
                onChange={onChange}
            />,
        ),
    );
    act(() => container.querySelector('button')!.click());
    expect(onChange.mock.calls[0][0].attachments[0]).toMatchObject({
        name: '',
        content: 'initial',
        isNew: true,
    });
});
