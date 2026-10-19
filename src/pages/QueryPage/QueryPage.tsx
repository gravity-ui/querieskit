import type {VcsItem} from '../../types/queriesVcs';
import React, {useId} from 'react';
import {LayoutColumns} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
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
import {ResizeHandle} from './internal/ResizeHandle';
import {useElementSize, useLayoutState} from './internal/useLayoutState';
import i18n from './i18n';
import './QueryPage.scss';

const block = cn('qp-query-page');
const MIN_SIDEBAR = 240;
const MIN_WORKSPACE = 320;
const DIVIDER = 6;

function constrain(value: number, min: number, max?: number) {
    return Math.max(min, Math.min(max ?? Infinity, Number.isFinite(value) ? value : 300));
}

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
    TVcs
>) {
    const {tabs: sidebarTabs, deleteConfirmation} = useHistoryActions(
        sidebarProps.tabs,
        historyActions,
    );
    const sidebarId = useId();
    const panelPrefix = useId();
    const [rootRef, rootSize] = useElementSize();
    const [preferredWidth, changeWidth] = useLayoutState(
        sidebarWidth,
        defaultSidebarWidth,
        onSidebarWidthChange,
    );
    const [sidebarHidden, changeSidebarHidden] = useLayoutState(
        sidebarCollapsed,
        defaultSidebarCollapsed,
        onSidebarCollapsedChange,
    );
    const maxWidth = rootSize.width
        ? Math.max(MIN_SIDEBAR, rootSize.width - MIN_WORKSPACE - DIVIDER)
        : undefined;
    const width = constrain(preferredWidth, MIN_SIDEBAR, maxWidth);
    const sidebarLabel = i18n(sidebarHidden ? 'action_show-sidebar' : 'action_hide-sidebar');
    // Match QueryTabs' controlled selection fallback without emitting a change.
    const selected =
        tabsProps.items.find((tab) => tab.id === tabsProps.activeTab)?.id ?? tabsProps.items[0]?.id;
    const panelId = (id: string) => `${panelPrefix}-${encodeURIComponent(id)}`;

    return (
        <div ref={rootRef} className={block(null, className)}>
            <DeleteQueryDialog {...deleteConfirmation} />
            <div
                className={block('layout')}
                style={{
                    gridTemplateColumns: `${sidebarHidden ? 0 : width}px ${sidebarHidden ? 0 : DIVIDER}px minmax(${MIN_WORKSPACE}px, 1fr)`,
                }}
            >
                <div id={sidebarId} hidden={sidebarHidden} className={block('sidebar')}>
                    <QueriesSidebar {...sidebarProps} tabs={sidebarTabs} />
                </div>
                <div className={block('sidebar-divider')} hidden={sidebarHidden}>
                    <ResizeHandle
                        orientation="vertical"
                        value={width}
                        min={MIN_SIDEBAR}
                        max={maxWidth}
                        label={i18n('action_resize-sidebar')}
                        controls={sidebarId}
                        onChange={changeWidth}
                    />
                </div>
                <div className={block('workspace')}>
                    <QueryTabs
                        {...tabsProps}
                        items={tabsProps.items.map((tab) => ({...tab, panelId: panelId(tab.id)}))}
                        className={block('tabs', tabsProps.className)}
                        actions={
                            <>
                                <Button
                                    view="flat-secondary"
                                    size="s"
                                    aria-label={sidebarLabel}
                                    title={sidebarLabel}
                                    aria-expanded={!sidebarHidden}
                                    aria-controls={sidebarId}
                                    onClick={() => changeSidebarHidden(!sidebarHidden)}
                                >
                                    <Icon data={LayoutColumns} size={16} />
                                </Button>
                                {tabsProps.actions}
                            </>
                        }
                    />
                    <div className={block('panels')}>
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
                    </div>
                </div>
            </div>
        </div>
    );
}
