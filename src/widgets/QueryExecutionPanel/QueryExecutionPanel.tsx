import React, {useEffect, useId, useMemo, useState} from 'react';
import {ChevronsCollapseUpRight, ChevronsExpandUpRight, ChevronsUp, Xmark} from '@gravity-ui/icons';
import {Button, Flex, Icon, Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {NavigationMetaItem} from '../../types/navigation';
import type {QueryExecutionPanelProps, QueryExecutionTab} from '../../types/queryExecutionPanel';
import {getMessagesSeverity} from './helpers/getMessagesSeverity';
import {useActiveTab} from './helpers/useActiveTab';
import {QueryExecutionTabContent} from './internal/QueryExecutionTabContent';
import {QueryExecutionState} from './internal/QueryExecutionState';
import i18n from './i18n';
import './QueryExecutionPanel.scss';

const block = cn('qp-query-execution-panel');

function ExecutionMetadata({execution}: Pick<QueryExecutionPanelProps, 'execution'>) {
    return (
        <>
            {execution?.startedAt !== undefined && execution.startedAt !== null && (
                <Text>{execution.startedAt}</Text>
            )}
            {execution?.author !== undefined && execution.author !== null && (
                <Text color="secondary">
                    {i18n('context_by')} {execution.author}
                </Text>
            )}
        </>
    );
}

export function QueryExecutionPanel<
    TRow extends Record<string, unknown> = Record<string, unknown>,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
>({
    tabs: inputTabs,
    activeTab,
    defaultActiveTab,
    preferredActiveTab,
    onActiveTabChange,
    execution,
    expanded = false,
    onExpandedChange,
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    onClose,
    loading = false,
    error = false,
    onRetry,
    emptyContent,
    className,
}: QueryExecutionPanelProps<TRow, TMetaItem>) {
    const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
    const collapsed = controlledCollapsed ?? uncontrolledCollapsed;
    const contentId = useId();

    const changeCollapsed = (next: boolean) => {
        if (next === collapsed) return;
        if (controlledCollapsed === undefined) setUncontrolledCollapsed(next);
        onCollapsedChange?.(next);
        if (next) {
            if (expanded) onExpandedChange?.(false);
            onClose?.();
        }
    };
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
            console.warn('QueryExecutionPanel: skipped empty or duplicate tab IDs', invalidIds);
        }
    }, [invalidIds]);

    const {selected, select} = useActiveTab({
        tabs,
        activeTab,
        defaultActiveTab,
        preferredActiveTab,
        onActiveTabChange,
    });
    const expandLabel = i18n(expanded ? 'action_collapse' : 'action_expand');
    const collapseLabel = i18n(collapsed ? 'action_show-content' : 'action_hide-content');
    const showState = loading || error;
    const selectAndReveal = (id: string) => {
        if (!tabs.some((tab) => tab.id === id && !tab.disabled)) return;
        changeCollapsed(false);
        select(id);
    };

    const getTitle = (tab: QueryExecutionTab<TRow, TMetaItem>) => {
        if (tab.type === 'info') return i18n(`title_${getMessagesSeverity(tab.props?.root)}`);
        if (tab.type === 'custom') return tab.title;
        return tab.title ?? i18n(`title_${tab.type}`);
    };

    return (
        <Flex direction="column" className={block({collapsed}, className)}>
            <TabProvider value={collapsed ? '' : (selected ?? '')} onUpdate={selectAndReveal}>
                <Flex wrap alignItems="center" gap={4} className={block('header')}>
                    <TabList className={block('tabs')} aria-label={i18n('title_tabs')}>
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.id}
                                value={tab.id}
                                disabled={tab.disabled}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        // Avoid a second selection from the button's native click.
                                        event.preventDefault();
                                        selectAndReveal(tab.id);
                                    }
                                }}
                            >
                                {getTitle(tab)}
                            </Tab>
                        ))}
                    </TabList>
                    <Flex wrap alignItems="center" gap={2} className={block('details')}>
                        <ExecutionMetadata execution={execution} />
                        <Flex gap={2} className={block('actions')}>
                            {onExpandedChange && (
                                <Button
                                    view="flat"
                                    aria-label={expandLabel}
                                    title={expandLabel}
                                    aria-pressed={expanded}
                                    onClick={() => {
                                        changeCollapsed(false);
                                        onExpandedChange(!expanded);
                                    }}
                                >
                                    <Icon
                                        data={
                                            expanded
                                                ? ChevronsCollapseUpRight
                                                : ChevronsExpandUpRight
                                        }
                                    />
                                </Button>
                            )}
                            <Button
                                view="flat"
                                aria-label={collapseLabel}
                                title={collapseLabel}
                                aria-expanded={!collapsed}
                                aria-controls={contentId}
                                onClick={() => changeCollapsed(!collapsed)}
                            >
                                <Icon data={collapsed ? ChevronsUp : Xmark} />
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>
                <div
                    id={contentId}
                    className={block('content')}
                    aria-busy={loading}
                    hidden={collapsed}
                >
                    {showState && <QueryExecutionState loading={loading} onRetry={onRetry} />}
                    {tabs.map((tab) => (
                        <TabPanel
                            key={tab.id}
                            value={tab.id}
                            hidden={collapsed || tab.id !== selected || showState}
                            className={block('panel', {
                                padded: ['info', 'meta', 'charts', 'custom'].includes(tab.type),
                            })}
                        >
                            <QueryExecutionTabContent
                                key={tab.type}
                                tab={tab}
                                active={!collapsed && tab.id === selected && !showState}
                            />
                        </TabPanel>
                    ))}
                    {!showState &&
                        selected === undefined &&
                        (emptyContent ?? <Text color="secondary">{i18n('context_no-tabs')}</Text>)}
                </div>
            </TabProvider>
        </Flex>
    );
}
