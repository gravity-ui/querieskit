import React, {useEffect, useMemo} from 'react';
import {ChevronsCollapseUpRight, ChevronsExpandUpRight, Xmark} from '@gravity-ui/icons';
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
    onClose,
    loading = false,
    error = false,
    onRetry,
    emptyContent,
    className,
}: QueryExecutionPanelProps<TRow, TMetaItem>) {
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
    const showState = loading || error;

    const getTitle = (tab: QueryExecutionTab<TRow, TMetaItem>) => {
        if (tab.type === 'info') return i18n(`title_${getMessagesSeverity(tab.props?.root)}`);
        if (tab.type === 'custom') return tab.title;
        return tab.title ?? i18n(`title_${tab.type}`);
    };

    return (
        <Flex direction="column" className={block(null, className)}>
            <TabProvider value={selected ?? ''} onUpdate={select}>
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
                                        select(tab.id);
                                    }
                                }}
                            >
                                {getTitle(tab)}
                            </Tab>
                        ))}
                    </TabList>
                    <Flex wrap alignItems="center" gap={2} className={block('details')}>
                        {execution?.startedAt !== undefined && execution.startedAt !== null && (
                            <Text>{execution.startedAt}</Text>
                        )}
                        {execution?.author !== undefined && execution.author !== null && (
                            <Text color="secondary">
                                {i18n('context_by')} {execution.author}
                            </Text>
                        )}
                        <Flex gap={2} className={block('actions')}>
                            {onExpandedChange && (
                                <Button
                                    view="flat"
                                    aria-label={expandLabel}
                                    title={expandLabel}
                                    aria-pressed={expanded}
                                    onClick={() => onExpandedChange(!expanded)}
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
                            {onClose && (
                                <Button
                                    view="flat"
                                    aria-label={i18n('action_close')}
                                    title={i18n('action_close')}
                                    onClick={onClose}
                                >
                                    <Icon data={Xmark} />
                                </Button>
                            )}
                        </Flex>
                    </Flex>
                </Flex>
                <div className={block('content')} aria-busy={loading}>
                    {showState && <QueryExecutionState loading={loading} onRetry={onRetry} />}
                    {tabs.map((tab) => (
                        <TabPanel
                            key={tab.id}
                            value={tab.id}
                            hidden={tab.id !== selected || showState}
                            className={block('panel', {
                                padded: ['info', 'meta', 'charts', 'custom'].includes(tab.type),
                            })}
                        >
                            <QueryExecutionTabContent
                                key={tab.type}
                                tab={tab}
                                active={tab.id === selected && !showState}
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
