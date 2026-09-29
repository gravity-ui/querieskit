import React, {useEffect, useId, useMemo} from 'react';
import {BranchesRight, ClockArrowRotateLeft, CloudCheck, GraduationCap} from '@gravity-ui/icons';
import {Flex, Icon, Tab, type TabComponentProps, TabList, TabProvider} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {QueryHistoryRow} from '../../types/history';
import type {NavigationCluster, NavigationItem} from '../../types/navigation';
import type {QueriesSidebarProps} from '../../types/queriesSidebar';
import type {SavedQuery} from '../../types/savedQueries';
import type {TutorialHistoryRow} from '../../types/tutorial';
import {useActiveTab} from './helpers/useActiveTab';
import {SidebarPanel} from './internal/SidebarPanel';
import {SidebarTabButton} from './internal/SidebarTabButton';
import {SidebarTabContent} from './internal/SidebarTabContent';
import i18n from './i18n';
import './QueriesSidebar.scss';

// UIKit 7.45 exposes TabComponentProps but its forwardRef declaration loses the generic.
const SidebarTab = Tab as unknown as React.ComponentType<
    TabComponentProps<typeof SidebarTabButton>
>;

const block = cn('qp-queries-sidebar');
const icons = {
    history: ClockArrowRotateLeft,
    saved: CloudCheck,
    navigation: BranchesRight,
    tutorials: GraduationCap,
};

export function QueriesSidebar<
    THistory extends QueryHistoryRow = QueryHistoryRow,
    TSaved extends SavedQuery = SavedQuery,
    TNavigation extends NavigationItem = NavigationItem,
    TCluster extends NavigationCluster = NavigationCluster,
    TTutorial extends TutorialHistoryRow = TutorialHistoryRow,
>({
    header,
    tabs: inputTabs,
    activeTab,
    defaultActiveTab,
    onActiveTabChange,
    hideTabs = false,
    className,
}: QueriesSidebarProps<THistory, TSaved, TNavigation, TCluster, TTutorial>) {
    const id = useId();
    const {tabs, invalidIds} = useMemo(() => {
        const seen = new Set<string>();
        const invalid: string[] = [];
        const valid = inputTabs.filter((tab) => {
            if (!tab.id.trim() || seen.has(tab.id)) {
                invalid.push(tab.id);
                return false;
            }
            seen.add(tab.id);
            return true;
        });
        return {tabs: valid, invalidIds: invalid};
    }, [inputTabs]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' && invalidIds.length) {
            console.warn('QueriesSidebar: skipped empty or duplicate tab IDs', invalidIds);
        }
    }, [invalidIds]);

    const {selected, select} = useActiveTab({tabs, activeTab, defaultActiveTab, onActiveTabChange});
    const title = (tab: (typeof tabs)[number]) =>
        tab.type === 'custom' ? tab.title : i18n(`title_${tab.type}`);

    return (
        <Flex direction="column" className={block(null, className)}>
            {header !== null && header !== undefined && (
                <div className={block('header')}>{header}</div>
            )}
            <TabProvider value={selected ?? ''} onUpdate={select}>
                {!hideTabs && (
                    <TabList
                        className={block('tabs')}
                        contentOverflow="scroll"
                        aria-label={i18n('title_tabs')}
                    >
                        {tabs.map((tab) => (
                            <SidebarTab
                                key={tab.id}
                                value={tab.id}
                                disabled={tab.disabled}
                                component={SidebarTabButton}
                                data-sidebar-tab-id={`${id}-tab-${tab.id}`}
                                data-sidebar-panel-id={`${id}-panel-${tab.id}`}
                                title={title(tab)}
                                aria-label={title(tab)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        // Avoid a second request from the button's native click.
                                        event.preventDefault();
                                        select(tab.id);
                                    }
                                }}
                            >
                                <span aria-hidden="true">
                                    {tab.type === 'custom' ? (
                                        tab.icon
                                    ) : (
                                        <Icon data={icons[tab.type]} size={16} />
                                    )}
                                </span>
                            </SidebarTab>
                        ))}
                    </TabList>
                )}
            </TabProvider>
            {tabs.map((tab) => (
                <SidebarPanel
                    key={tab.id}
                    id={`${id}-panel-${tab.id}`}
                    role={hideTabs ? 'region' : 'tabpanel'}
                    aria-label={hideTabs ? title(tab) : undefined}
                    aria-labelledby={hideTabs ? undefined : `${id}-tab-${tab.id}`}
                    active={tab.id === selected}
                    className={block('panel')}
                >
                    <SidebarTabContent tab={tab} active={tab.id === selected} />
                </SidebarPanel>
            ))}
        </Flex>
    );
}
