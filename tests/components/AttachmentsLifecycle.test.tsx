// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {Attachments} from '../../src/modules/Attachments';

const captures = vi.hoisted(() => ({edit: {} as any, list: {} as any}));
vi.mock('@gravity-ui/uikit', () => {
    const Container = ({children}: any) => <div>{children}</div>;
    return {
        Box: Container,
        Flex: Container,
        Text: Container,
        TabProvider: Container,
        TabList: Container,
        Tab: Container,
        TabPanel: ({children, value}: any) => (value === 'Current' ? children : null),
        Icon: () => null,
        Button: ({children, onClick}: any) => <button onClick={onClick}>{children}</button>,
    };
});
vi.mock('../../src/components/AttachmentList', () => ({
    AttachmentList: (props: any) => {
        captures.list = props;
        return props.attachments.map((attachment: any) =>
            props.editingIds.includes(attachment.id) ? (
                <React.Fragment key={attachment.id}>
                    {props.renderEditForm(attachment)}
                </React.Fragment>
            ) : (
                <div key={attachment.id}>{attachment.name}</div>
            ),
        );
    },
    EditAttachmentItem: (props: any) => {
        captures.edit = props;
        return null;
    },
}));
vi.mock('../../src/components/AttachmentListPlaceholder', () => ({
    AttachmentListPlaceholder: ({onAddFile, onAddLink}: any) => (
        <>
            <button onClick={onAddFile}>File</button>
            <button onClick={onAddLink}>Link</button>
        </>
    ),
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));

it.each(['file', 'link'] as const)('adds and accepts a %s with one callback per action', (kind) => {
    const onChange = vi.fn();
    act(() => root.render(<Attachments onChange={onChange} />));
    act(() => container.querySelectorAll('button')[kind === 'file' ? 0 : 1].click());
    expect(onChange).toHaveBeenCalledOnce();
    const draft = onChange.mock.calls[0][0].attachments[0];
    expect(draft).toMatchObject({name: '', isNew: true});
    expect(captures.edit.type).toBe(kind);
    const accepted =
        kind === 'file'
            ? {name: 'query.sql'}
            : {name: 'Docs', link: 'https://example.com', token: 'token'};
    act(() => captures.edit.onAccept(kind === 'file' ? accepted.name : accepted));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange.mock.calls[1][0]).toEqual({
        attachments: [{id: draft.id, ...accepted}],
        deletedAttachments: [],
    });
    expect(captures.list.editingIds).toEqual([]);
    expect(captures.list.wasAddedIds).toEqual([draft.id]);
    expect(container.textContent).toContain(accepted.name);
});

it('accepts an existing attachment edit and preserves the deleted list', () => {
    const onChange = vi.fn();
    const item = {id: 'a', name: 'before.sql'};
    const deleted = [{id: 'old', name: 'old.sql'}];
    act(() =>
        root.render(
            <Attachments deletedAttachments={deleted} attachments={[item]} onChange={onChange} />,
        ),
    );
    act(() => captures.list.onEdit(item));
    act(() => captures.edit.onAccept('after.sql'));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
        attachments: [{id: 'a', name: 'after.sql'}],
        deletedAttachments: deleted,
    });
    expect(captures.list.wasEditedIds).toEqual(['a']);
});
