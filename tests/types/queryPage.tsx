import React from 'react';
import {QueryPage, type QueryPageProps, type QueryPageTab} from '../../src';
import {
    type QueryPageProps as EntrypointProps,
    QueryPage as QueryPageEntrypoint,
} from '../../src/pages/QueryPage';
import type {QueryHistoryRow} from '../../src/types/history';
import type {SavedQuery} from '../../src/types/savedQueries';
import type {TutorialHistoryRow} from '../../src/types/tutorial';
import type {
    NavigationCluster,
    NavigationItem,
    NavigationMetaItem,
} from '../../src/types/navigation';
import type {QueriesSidebarProps} from '../../src/types/queriesSidebar';
import type {QueryEditorProps} from '../../src/types/queryEditor';
import type {QueryExecutionPanelProps} from '../../src/types/queryExecutionPanel';
import type {QuerySettingsProps} from '../../src/types/querySettings';
import type {AttachmentsProps} from '../../src/types/attachments';
import type {QueryParametersProps} from '../../src/types/queryParameters';

type History = QueryHistoryRow & {historyOwner: string};
type Saved = SavedQuery & {revision: number};
type Item = NavigationItem & {tableId: string};
type Cluster = NavigationCluster & {region: string};
type Tutorial = TutorialHistoryRow & {lessonId: string};
type Settings = {memoryLimit: number};
type Row = {eventId: string; eventCount: number};
type Meta = NavigationMetaItem & {sourceId: string};

type Props = QueryPageProps<History, Saved, Item, Cluster, Tutorial, Settings, Row, Meta>;
type PageTab = Props['tabsProps']['items'][number];
type Tab = Extract<PageTab, {type: 'query'}>;
type Equal<A, B> =
    (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

// Exact equality protects the original widget contracts, including callbacks,
// extension points, controlled state and each of the eight custom data types.
export type ContractChecks = [
    Assert<Equal<PageTab, QueryPageTab<Settings, Row, Meta>>>,
    Assert<
        Equal<Props['sidebarProps'], QueriesSidebarProps<History, Saved, Item, Cluster, Tutorial>>
    >,
    Assert<Equal<Tab['editorProps'], QueryEditorProps<Settings>>>,
    Assert<Equal<Tab['executionPanelProps'], QueryExecutionPanelProps<Row, Meta>>>,
    Assert<
        Equal<Props, EntrypointProps<History, Saved, Item, Cluster, Tutorial, Settings, Row, Meta>>
    >,
];

declare const sidebar: QueriesSidebarProps<History, Saved, Item, Cluster, Tutorial>;
declare const editor: QueryEditorProps<Settings>;
declare const execution: QueryExecutionPanelProps<Row, Meta>;

const tabs = {
    items: [
        {
            id: 'query',
            type: 'query' as const,
            title: 'Query',
            status: 'draft' as const,
            editorProps: editor,
            executionPanelProps: execution,
            onExecutionPanelHeightChange: (value: number) => value.toFixed(),
        },
    ],
    onActiveTabChange: (id: string) => id.toUpperCase(),
    onAddTab: () => {},
    onCloseTab: (id: string) => id.toUpperCase(),
};

// No explicit JSX type arguments: custom types must infer from the nested props.
export const inferredFromRoot = <QueryPage sidebarProps={sidebar} tabsProps={tabs} />;
export const inferredFromEntrypoint = (
    <QueryPageEntrypoint
        sidebarProps={sidebar}
        tabsProps={tabs}
        onSidebarWidthChange={(value) => value.toFixed()}
        onSidebarCollapsedChange={(value) => value.valueOf()}
    />
);

declare const settings: QuerySettingsProps<Settings>;
declare const attachments: AttachmentsProps;
declare const parameters: QueryParametersProps;

// Each built-in form remains valid through the composed props contract.
export const builtInForms: Tab['editorProps'] = {
    ...editor,
    settings: undefined,
    settingsProps: settings,
    attachments: undefined,
    attachmentsProps: attachments,
    parameters: undefined,
    parametersProps: parameters,
};
export const customForms: Tab['editorProps'] = {
    ...editor,
    settings: <span>Settings</span>,
    settingsProps: undefined,
    attachments: <span>Attachments</span>,
    attachmentsProps: undefined,
    parameters: <span>Parameters</span>,
    parametersProps: undefined,
};

// @ts-expect-error Custom settings and the built-in form are mutually exclusive.
export const invalidSettings: Tab['editorProps'] = {...builtInForms, settings: <span />};
// @ts-expect-error Custom attachments and the built-in form are mutually exclusive.
export const invalidAttachments: Tab['editorProps'] = {...builtInForms, attachments: <span />};
// @ts-expect-error Custom parameters and the built-in form are mutually exclusive.
export const invalidParameters: Tab['editorProps'] = {...builtInForms, parameters: <span />};

declare const wrongSettings: QueryEditorProps<{memoryLimit: string}>;
// @ts-expect-error The settings generic must not be widened or erased by the page.
export const invalidSettingsType: Tab['editorProps'] = wrongSettings;
declare const wrongRows: QueryExecutionPanelProps<{eventId: number; eventCount: number}, Meta>;
// @ts-expect-error The result row generic must not be widened or erased by the page.
export const invalidRowType: Tab['executionPanelProps'] = wrongRows;

export const comparisonTab: QueryPageTab = {
    id: 'comparison',
    type: 'comparison',
    leftTitle: 'Baseline',
    rightTitle: 'Competitor',
    comparisonProps: {items: []},
};
// @ts-expect-error Comparison tabs require comparisonProps.
export const invalidComparison: QueryPageTab = {
    id: 'diff',
    type: 'comparison',
    leftTitle: 'A',
    rightTitle: 'B',
};
