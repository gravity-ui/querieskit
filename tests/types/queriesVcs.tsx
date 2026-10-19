import React from 'react';
import {QueriesSidebar, QueriesVcs, type QueriesVcsProps, QueryPage, type VcsItem} from '../../src';
import {QueriesVcs as ModuleEntrypoint} from '../../src/modules/QueriesVcs';
import type {QueryPageProps} from '../../src/types/queryPage';
import type {QueriesSidebarProps} from '../../src/types/queriesSidebar';
import type {QueryHistoryRow} from '../../src/types/history';
import type {SavedQuery} from '../../src/types/savedQueries';
import type {
    NavigationCluster,
    NavigationItem,
    NavigationMetaItem,
} from '../../src/types/navigation';
import type {TutorialHistoryRow} from '../../src/types/tutorial';

type File = VcsItem & {revision: number};
type SidebarProps = QueriesSidebarProps<
    QueryHistoryRow,
    SavedQuery,
    NavigationItem,
    NavigationCluster,
    TutorialHistoryRow,
    File
>;
type PageProps = QueryPageProps<
    QueryHistoryRow,
    SavedQuery,
    NavigationItem,
    NavigationCluster,
    TutorialHistoryRow,
    Record<string, unknown>,
    Record<string, unknown>,
    NavigationMetaItem,
    File
>;
type Equal<A, B> =
    (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
export type VcsContractChecks = [
    Assert<Equal<PageProps['sidebarProps'], SidebarProps>>,
    Assert<
        Equal<Extract<SidebarProps['tabs'][number], {type: 'vcs'}>['props'], QueriesVcsProps<File>>
    >,
];

const props: QueriesVcsProps<File> = {
    location: {path: '/'},
    onUpdate: () => {},
    providers: {items: []},
    repositories: {items: [{id: 'demo', title: 'Demo', disabled: false}]},
    renderHeader: ({repositories, location, onUpdate}) => (
        <button onClick={() => onUpdate({...location, repositoryId: repositories?.items[0].id})}>
            {repositories?.items[0].title}
        </button>
    ),
    branches: {items: []},
    listState: {loaded: true},
    items: [{path: '/report.sql', title: 'report.sql', kind: 'file', revision: 2}],
    renderItemIcon: ({item}) => item.revision.toFixed(),
    renderRowItem: ({item}) => item.revision.toFixed(),
    onInsertFile: ({item}) => item.revision.toFixed(),
    getFileActions: ({item}) => [
        {
            id: 'revision',
            title: 'Revision',
            content: item.revision.toFixed(),
            onClick: ({item: selected}) => selected.revision.toFixed(),
        },
    ],
    detail: {
        onOpen: ({item}) => item.revision.toFixed(),
        renderContent: ({item}) => item.revision.toFixed(),
    },
};
const sidebar: SidebarProps = {tabs: [{id: 'vcs', type: 'vcs', props}]};
declare const tabs: PageProps['tabsProps'];
export const moduleFromRoot = <QueriesVcs {...props} />;
export const moduleFromEntrypoint = <ModuleEntrypoint {...props} />;
export const inferredSidebar = <QueriesSidebar {...sidebar} />;
export const inferredPage = <QueryPage sidebarProps={sidebar} tabsProps={tabs} />;
