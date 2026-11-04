import React from 'react';
import {QueriesSidebar, type QueriesSidebarTab} from '../../src/widgets/QueriesSidebar';
import type {QueriesHistoryProps} from '../../src/types/queriesHistory';
import type {QueryHistoryRow} from '../../src/types/history';

type History = QueryHistoryRow & {ownerId: string};
declare const historyProps: QueriesHistoryProps<History>;

export const propsTab: QueriesSidebarTab<History> = {
    id: 'history',
    type: 'history',
    props: historyProps,
};

export const connectedTabs: QueriesSidebarTab<History>[] = [
    {id: 'history', type: 'history', renderContent: ({active}) => <div hidden={!active} />},
    {id: 'saved', type: 'saved', renderContent: ({active}) => <div hidden={!active} />},
    {id: 'navigation', type: 'navigation', renderContent: ({active}) => <div hidden={!active} />},
    {id: 'tutorials', type: 'tutorials', renderContent: ({active}) => <div hidden={!active} />},
    {id: 'vcs', type: 'vcs', renderContent: ({active}) => <div hidden={!active} />},
];

export const sidebar = <QueriesSidebar tabs={[propsTab, ...connectedTabs]} />;

// @ts-expect-error A standard tab takes props or application content, never both.
export const invalidMixed: QueriesSidebarTab<History> = {
    id: 'mixed',
    type: 'history',
    props: historyProps,
    renderContent: () => null,
};
// @ts-expect-error Standard tabs still need one content source.
export const invalidMissing: QueriesSidebarTab = {id: 'empty', type: 'vcs'};
// @ts-expect-error Custom tabs still need their own title and icon.
export const invalidCustom: QueriesSidebarTab = {
    id: 'custom',
    type: 'custom',
    renderContent: () => null,
};
