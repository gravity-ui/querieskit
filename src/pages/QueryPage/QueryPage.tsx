import type {AttachItem} from '../../types/attachments';
import type {VcsItem} from '../../types/queriesVcs';
import React, {useId} from 'react';
import cn from 'bem-cn-lite';
import type {QueryHistoryRow} from '../../types/history';
import type {NavigationCluster, NavigationItem, NavigationMetaItem} from '../../types/navigation';
import type {SavedQuery} from '../../types/savedQueries';
import type {TutorialHistoryRow} from '../../types/tutorial';
import type {QueryPageProps} from '../../types/queryPage';
import {QueriesSidebar} from '../../widgets/QueriesSidebar';
import {QueryTabs} from '../../modules/QueryTabs';
import {QueryComparison} from '../../modules/QueryComparison';
import {DeleteQueryDialog} from './internal/DeleteQueryDialog';
import {useHistoryActions} from './internal/useHistoryActions';
import {QueryWorkspace} from './internal/QueryWorkspace';
import {QueryPagePanel} from './internal/QueryPagePanel';
import {QueryPageLayout} from '../../modules/QueryPageLayout';
import './QueryPage.scss';

const block = cn('qp-query-page');
export function QueryPage<
    THistory extends QueryHistoryRow = QueryHistoryRow,
    TSaved extends SavedQuery = SavedQuery,
    TNavigation extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
    TTutorial extends TutorialHistoryRow = TutorialHistoryRow,
    TCustom extends object = Record<string, unknown>,
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
    TVcs extends VcsItem = VcsItem,
    TAttachment extends AttachItem = AttachItem,
    TValue = string,
>(
    props: QueryPageProps<
        THistory,
        TSaved,
        TNavigation,
        TCluster,
        TTutorial,
        TCustom,
        TRow,
        TMetaItem,
        TVcs,
        TAttachment,
        TValue
    >,
): React.JSX.Element;
export function QueryPage<
    THistory extends QueryHistoryRow = QueryHistoryRow,
    TSaved extends SavedQuery = SavedQuery,
    TNavigation extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
    TTutorial extends TutorialHistoryRow = TutorialHistoryRow,
    TCustom extends object = Record<string, unknown>,
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
    TVcs extends VcsItem = VcsItem,
>(
    props: QueryPageProps<
        THistory,
        TSaved,
        TNavigation,
        TCluster,
        TTutorial,
        TCustom,
        TRow,
        TMetaItem,
        TVcs
    >,
): React.JSX.Element;
export function QueryPage<
    THistory extends QueryHistoryRow = QueryHistoryRow,
    TSaved extends SavedQuery = SavedQuery,
    TNavigation extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
    TTutorial extends TutorialHistoryRow = TutorialHistoryRow,
    TCustom extends object = Record<string, unknown>,
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
    TVcs extends VcsItem = VcsItem,
    TAttachment extends AttachItem = AttachItem,
    TValue = string,
>({
    sidebarProps,
    historyActions,
    tabsProps,
    className,
    sidebarWidth,
    defaultSidebarWidth = 300,
    onSidebarWidthChange,
    sidebarCollapsed,
    defaultSidebarCollapsed = false,
    onSidebarCollapsedChange,
}: QueryPageProps<
    THistory,
    TSaved,
    TNavigation,
    TCluster,
    TTutorial,
    TCustom,
    TRow,
    TMetaItem,
    TVcs,
    TAttachment,
    TValue
>) {
    const {tabs: sidebarTabs, deleteConfirmation} = useHistoryActions(
        sidebarProps.tabs,
        historyActions,
    );
    const panelPrefix = useId();
    // Match QueryTabs' controlled selection fallback without emitting a change.
    const selected =
        tabsProps.items.find((tab) => tab.id === tabsProps.activeTab)?.id ?? tabsProps.items[0]?.id;
    const panelId = (id: string) => `${panelPrefix}-${encodeURIComponent(id)}`;

    return (
        <>
            <DeleteQueryDialog {...deleteConfirmation} />
            <QueryPageLayout
                className={block(null, className)}
                classNames={{
                    layout: block('layout'),
                    sidebar: block('sidebar'),
                    sidebarDivider: block('sidebar-divider'),
                    workspace: block('workspace'),
                    content: block('panels'),
                }}
                sidebarWidth={sidebarWidth}
                defaultSidebarWidth={defaultSidebarWidth}
                onSidebarWidthChange={onSidebarWidthChange}
                sidebarCollapsed={sidebarCollapsed}
                defaultSidebarCollapsed={defaultSidebarCollapsed}
                onSidebarCollapsedChange={onSidebarCollapsedChange}
                sidebar={<QueriesSidebar {...sidebarProps} tabs={sidebarTabs} />}
                header={({sidebarToggle}) => (
                    <QueryTabs
                        {...tabsProps}
                        items={tabsProps.items.map((tab) => ({...tab, panelId: panelId(tab.id)}))}
                        className={block('tabs', tabsProps.className)}
                        actions={
                            <>
                                {sidebarToggle}
                                {tabsProps.actions}
                            </>
                        }
                    />
                )}
            >
                {tabsProps.items.map((tab) => (
                    <QueryPagePanel
                        key={tab.id}
                        id={panelId(tab.id)}
                        role="tabpanel"
                        aria-label={
                            tab.type === 'query'
                                ? tab.title
                                : `${tab.leftTitle} / ${tab.rightTitle}`
                        }
                        className={block('panel')}
                        active={tab.id === selected}
                    >
                        {tab.type === 'comparison' ? (
                            <QueryComparison {...tab.comparisonProps} />
                        ) : (
                            <QueryWorkspace tab={tab} active={tab.id === selected} />
                        )}
                    </QueryPagePanel>
                ))}
            </QueryPageLayout>
        </>
    );
}
