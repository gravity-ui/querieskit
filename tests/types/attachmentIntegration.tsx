import React from 'react';
import {QueryEditor} from '../../src/widgets/QueryEditor';
import {QueryPage} from '../../src/pages/QueryPage';
import type {QueryEditorProps} from '../../src/types/queryEditor';
import type {QueryPageProps, QueryPageQueryTab} from '../../src/types/queryPage';
import type {AttachItem, AttachmentsProps} from '../../src/types/attachments';
import type {
    NavigationCluster,
    NavigationItem,
    NavigationMetaItem,
} from '../../src/types/navigation';
import type {QueryHistoryRow} from '../../src/types/history';
import type {SavedQuery} from '../../src/types/savedQueries';
import type {TutorialHistoryRow} from '../../src/types/tutorial';
import type {VcsItem} from '../../src/types/queriesVcs';

type DocumentAttachment = AttachItem & {content: string};
type Custom = {workspace: string};
type Row = {result: string};

declare const editor: QueryEditorProps<Custom, DocumentAttachment>;
declare const tab: QueryPageQueryTab<Custom, Row, NavigationMetaItem, DocumentAttachment>;
declare const page: QueryPageProps<
    QueryHistoryRow,
    SavedQuery,
    NavigationItem,
    NavigationCluster,
    TutorialHistoryRow,
    Custom,
    Row,
    NavigationMetaItem,
    VcsItem,
    DocumentAttachment
>;

const attachments: AttachmentsProps<DocumentAttachment> = {
    attachments: [{id: 'one', name: 'query.sql', content: 'select 1'}],
    createAttachment: (draft) => ({...draft, content: ''}),
    onSelectFile: async (file) => ({id: file.name, name: file.name, content: await file.text()}),
    onChange: ({attachments: items}) => {
        const content: string = items[0].content;
        return content;
    },
    onItemClick: (item) => {
        const content: string = item.content;
        return content;
    },
};

const typedEditor: QueryEditorProps<Custom, DocumentAttachment> = {
    ...editor,
    attachments: undefined,
    attachmentsProps: attachments,
};
const typedTab: typeof tab = {...tab, editorProps: typedEditor};
const typedPage: typeof page = {...page, tabsProps: {...page.tabsProps, items: [typedTab]}};

export const extendedEditor = <QueryEditor {...typedEditor} />;
export const extendedPage = <QueryPage {...typedPage} />;

// Existing generic positions and omitted attachment generics remain valid.
declare const legacyEditor: QueryEditorProps<Custom>;
declare const legacyTab: QueryPageQueryTab<Custom, Row, NavigationMetaItem>;
export const defaultEditor = <QueryEditor {...legacyEditor} />;
export const defaultTab = legacyTab;

// @ts-expect-error Extended models need a factory through the widget contract too.
export const missingFactory: NonNullable<
    QueryEditorProps<Custom, DocumentAttachment>['attachmentsProps']
> = {attachments: []};

// Existing structural extra data does not opt into typed extension callbacks.
const legacyStructuralAttachments = {
    attachments: [{id: 'legacy', name: 'legacy.sql', content: 'select 1'}],
    onChange: (_next: {attachments: AttachItem[]; deletedAttachments: AttachItem[]}) => {},
};
export const structuralEditor = (
    <QueryEditor
        {...legacyEditor}
        attachments={undefined}
        attachmentsProps={legacyStructuralAttachments}
    />
);
export const structuralPage = (
    <QueryPage
        {...page}
        tabsProps={{
            ...page.tabsProps,
            items: [
                {
                    ...tab,
                    editorProps: {
                        ...legacyEditor,
                        attachments: undefined,
                        attachmentsProps: legacyStructuralAttachments,
                    },
                },
            ],
        }}
    />
);
