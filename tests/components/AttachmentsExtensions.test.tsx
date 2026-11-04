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
        Text: ({children, role}: any) => <span role={role}>{children}</span>,
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
it('rejects a conflicting restore and allows retry after the current attachment is renamed', () => {
    const deleted = {id: 'deleted', name: 'query.sql', content: 'select 1'};
    const current = {id: 'current', name: 'query.sql'};
    const onChange = vi.fn();
    const props = {
        attachments: [current],
        deletedAttachments: [deleted],
        validateDuplicates: true,
        onChange,
    };
    render(props);
    act(() => capture.deleted.onRevert(deleted));
    expect(onChange).not.toHaveBeenCalled();
    expect(capture.current.attachments).toEqual([current]);
    expect(capture.deleted.attachments).toEqual([deleted]);
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
        'An attachment with this name already exists',
    );

    const renamed = {...current, name: 'renamed.sql'};
    render({...props, attachments: [renamed]});
    expect(container.querySelector('[role="alert"]')).toBeNull();
    act(() => capture.deleted.onRevert(deleted));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(
        {
            attachments: [renamed, deleted],
            deletedAttachments: [],
        },
        {type: 'restore', item: deleted},
    );
    // Controlled arrays remain unchanged until the parent accepts the proposal.
    expect(capture.deleted.attachments).toEqual([deleted]);
});
it.each([
    {validateDuplicates: false, current: {id: 'current', name: 'query.sql'}},
    {validateDuplicates: true, current: {id: 'current', name: 'QUERY.sql'}},
])('allows restore with duplicate rules %j', ({validateDuplicates, current}) => {
    const deleted = {id: 'deleted', name: 'query.sql'};
    const onChange = vi.fn();
    render({
        attachments: [current],
        deletedAttachments: [deleted],
        validateDuplicates,
        onChange,
    });
    act(() => capture.deleted.onRevert(deleted));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(
        {
            attachments: [current, deleted],
            deletedAttachments: [],
        },
        {type: 'restore', item: deleted},
    );
    expect(container.querySelector('[role="alert"]')).toBeNull();
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
    expect(onChange).toHaveBeenCalledExactlyOnceWith(
        {
            attachments: [existing, result],
            deletedAttachments: [deleted],
        },
        {type: 'create', item: result},
    );
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
    expect(onChange).not.toHaveBeenCalled();
    act(() => capture.editor.onAccept('complete.sql'));
    expect(onChange.mock.calls[0][0].attachments[0]).toMatchObject({
        name: 'complete.sql',
        content: 'initial',
    });
});

it('reports every draft edit separately and restores controlled unfinished text', () => {
    const item = {id: 'a', name: 'saved.sql'};
    const onChange = vi.fn();
    const onDraftsChange = vi.fn();
    const props = {attachments: [item], onChange, onDraftsChange};
    render(props);
    act(() => capture.current.onEdit(item));
    act(() => capture.editor.onChangeFileName('unfinished'));
    const drafts = onDraftsChange.mock.calls.at(-1)![0];
    expect(drafts).toEqual([{mode: 'update', value: {id: 'a', name: 'unfinished'}}]);
    expect(onChange).not.toHaveBeenCalled();
    render({...props, drafts}, 'restored');
    expect(capture.editor.fileName).toBe('unfinished');
    act(() => capture.editor.onChangeFileName('ignored proposal'));
    expect(capture.editor.fileName).toBe('unfinished');
    act(() => capture.editor.onCancel());
    expect(onDraftsChange).toHaveBeenLastCalledWith([]);
    expect(onChange).not.toHaveBeenCalled();
});
it('does not create domain objects for canceled drafts', () => {
    const createAttachment = vi.fn((value) => value);
    const onChange = vi.fn();
    render({createAttachment, onChange});
    act(() => container.querySelector('button')!.click());
    act(() => capture.editor.onChangeFileName('unfinished'));
    act(() => capture.editor.onCancel());
    expect(createAttachment).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
});
it('merges a committed draft with the latest controlled collection', () => {
    const onChange = vi.fn();
    const createAttachment = vi.fn((value) => ({...value, content: 'body'}));
    render({attachments: [], onChange, createAttachment});
    act(() => container.querySelector('button')!.click());
    const draftId = capture.current.attachments[0].id;
    const external = {id: 'external', name: 'external.sql'};
    render({attachments: [external], onChange, createAttachment});
    act(() => capture.editor.onAccept('created.sql'));
    const created = {id: draftId, name: 'created.sql', content: 'body'};
    expect(createAttachment).toHaveBeenCalledExactlyOnceWith({id: draftId, name: 'created.sql'});
    expect(onChange).toHaveBeenCalledExactlyOnceWith(
        {attachments: [external, created], deletedAttachments: []},
        {type: 'create', item: created},
    );
    expect(capture.current.attachments).toEqual([external]);
});
it('clears local drafts and emits one delete-all operation for committed items', () => {
    const item = {id: 'a', name: 'saved.sql'};
    const onChange = vi.fn();
    render({defaultAttachments: [item], onChange});
    act(() =>
        [...container.querySelectorAll('button')]
            .find((button) => button.textContent === 'File')!
            .click(),
    );
    act(() =>
        [...container.querySelectorAll('button')]
            .find((button) => button.textContent === 'Remove all')!
            .click(),
    );
    expect(onChange).toHaveBeenCalledExactlyOnceWith(
        {attachments: [], deletedAttachments: [item]},
        {type: 'delete-all', items: [item]},
    );
    expect(container.textContent).toContain('Empty file');
    expect(capture.deleted.attachments).toEqual([item]);
});

it('keeps a failed factory draft editable and retries Apply', () => {
    const createAttachment = vi
        .fn()
        .mockImplementationOnce(() => {
            throw new Error('Creation failed');
        })
        .mockImplementation((value) => ({...value, content: 'body'}));
    const onChange = vi.fn();
    render({createAttachment, onChange});
    act(() => container.querySelector('button')!.click());
    act(() => capture.editor.onChangeFileName('retry.sql'));
    act(() => capture.editor.onAccept('retry.sql'));
    expect(onChange).not.toHaveBeenCalled();
    expect(capture.editor.fileName).toBe('retry.sql');
    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Creation failed');
    act(() => capture.editor.onAccept('retry.sql'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(container.querySelector('[role="alert"]')).toBeNull();
});
it('does not turn a restored colliding create draft into an editor for a committed item', () => {
    const item = {id: 'a', name: 'saved.sql'};
    const onChange = vi.fn();
    render({
        attachments: [item],
        drafts: [{mode: 'create', value: {id: 'a', name: 'draft.sql'}}],
        onChange,
    });
    expect(capture.current.attachments).toEqual([item]);
    expect(capture.current.editingIds).toEqual([]);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('ID');
    expect(onChange).not.toHaveBeenCalled();
});
it('rejects duplicate draft rows without rendering duplicate identities', () => {
    render({
        drafts: [
            {mode: 'create', value: {id: 'a', name: 'first'}},
            {mode: 'create', value: {id: 'a', name: 'second'}},
        ],
    });
    expect(capture.current.attachments).toEqual([{id: 'a', name: 'first'}]);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('ID');
});
it('preserves refreshed metadata while applying an existing edit', () => {
    const initial = {id: 'a', name: 'before.sql', content: 'old'};
    const onChange = vi.fn();
    render({attachments: [initial], onChange});
    act(() => capture.current.onEdit(initial));
    act(() => capture.editor.onChangeFileName('edited.sql'));
    const refreshed = {...initial, content: 'new server content'};
    render({attachments: [refreshed], onChange});
    expect(capture.editor.fileName).toBe('edited.sql');
    act(() => capture.editor.onAccept('edited.sql'));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(
        {attachments: [{...refreshed, name: 'edited.sql'}], deletedAttachments: []},
        {type: 'update', previous: refreshed, item: {...refreshed, name: 'edited.sql'}},
    );
});
it('does not expose a new draft to the item-click callback', () => {
    const onItemClick = vi.fn();
    render({onItemClick});
    act(() => container.querySelector('button')!.click());
    act(() => capture.current.onItemClick(capture.current.attachments[0], 0, false));
    expect(onItemClick).not.toHaveBeenCalled();
});
it('reports unfinished link fields through controlled drafts', () => {
    const value = {id: 'a', name: 'name', link: 'https://example.com', token: 'old'};
    const onDraftsChange = vi.fn();
    const onChange = vi.fn();
    render({drafts: [{mode: 'create', value}], onDraftsChange, onChange});
    const edited = {name: '', link: 'unfinished', token: 'new'};
    act(() => capture.editor.onChange(edited));
    expect(onDraftsChange).toHaveBeenCalledExactlyOnceWith([
        {mode: 'create', value: {...value, ...edited}},
    ]);
    expect(capture.editor.values).toEqual({name: value.name, link: value.link, token: value.token});
    expect(onChange).not.toHaveBeenCalled();
});
