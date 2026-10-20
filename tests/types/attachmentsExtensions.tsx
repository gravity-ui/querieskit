import React from 'react';
import {Attachments} from '../../src/modules/Attachments';
import {AttachmentList} from '../../src/components/AttachmentList';
import type {AttachItem, AttachmentsProps} from '../../src/types/attachments';

type DocumentAttachment = AttachItem & {content: string};
const items: DocumentAttachment[] = [{id: 'a', name: 'query.sql', content: 'select 1'}];
export const generic = (
    <Attachments<DocumentAttachment>
        attachments={items}
        createAttachment={(draft) => ({...draft, content: ''})}
        onChange={({attachments}) => {
            const content: string = attachments[0].content;
            content.toUpperCase();
        }}
        onSelectFile={async (file) => ({
            id: file.name,
            name: file.name,
            content: await file.text(),
        })}
    />
);
export const legacy = <Attachments attachments={[{id: 'a', name: 'query.sql'}]} />;
// Existing callers may pass richer objects without requesting generic callback types.
export const legacyStructuralData = (
    <Attachments
        attachments={items}
        onChange={({attachments}: {attachments: AttachItem[]; deletedAttachments: AttachItem[]}) =>
            attachments.map((item) => item.name)
        }
    />
);
// @ts-expect-error An extended model needs a complete creation factory.
export const missingFactory = <Attachments<DocumentAttachment> attachments={items} />;
export const incompleteFactory = (
    // @ts-expect-error A factory must supply the required extension data.
    <Attachments<DocumentAttachment> createAttachment={(draft) => draft} />
);
export const list = (
    <AttachmentList
        attachments={items}
        onEdit={(item) => {
            const content: string = item.content;
            content.toUpperCase();
        }}
        renderEditForm={(item) => item.content}
    />
);
export const props: AttachmentsProps<DocumentAttachment> = {
    attachments: items,
    createAttachment: (draft) => ({...draft, content: ''}),
};
