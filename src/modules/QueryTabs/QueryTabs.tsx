import React, {useEffect, useRef} from 'react';
import {Button, Flex, Icon, TabList, TabProvider} from '@gravity-ui/uikit';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import cn from 'bem-cn-lite';
import type {QueryTabsProps} from '../../types/queryTabs';
import {QueryTab} from './internal/QueryTab';
import i18n from './i18n';
import './QueryTabs.scss';

const block = cn('qp-query-tabs');

export function QueryTabs({
    items,
    activeTab,
    onActiveTabChange,
    onAddTab,
    onCloseTab,
    hideCloseOnLastTab = false,
    actions,
    className,
}: QueryTabsProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const addRef = useRef<HTMLButtonElement>(null);
    const focusedItem = useRef<{id: string; index: number; element: HTMLElement} | undefined>(
        undefined,
    );
    const selectedId = items.find((item) => item.id === activeTab)?.id ?? items[0]?.id;

    useEffect(() => {
        const focused = focusedItem.current;
        if (!focused || focused.element.isConnected) return;
        focusedItem.current = undefined;
        // Recover focus only when removal detached the focused control, never steal it
        // from a confirmation dialog or another part of the application.
        const doc = rootRef.current?.ownerDocument;
        if (!doc || (doc.activeElement !== doc.body && doc.activeElement !== null)) return;
        const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        const selected =
            listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
        (selected ?? tabs?.[Math.min(focused.index, items.length - 1)] ?? addRef.current)?.focus();
    }, [items, selectedId, hideCloseOnLastTab]);

    useEffect(() => {
        listRef.current
            ?.querySelector<HTMLElement>('[aria-selected="true"]')
            ?.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
    }, [selectedId]);

    const selectTab = (id: string) => {
        if (id !== selectedId) onActiveTabChange(id);
    };

    return (
        <Flex
            ref={rootRef}
            alignItems="center"
            className={block(null, className)}
            onFocusCapture={(event) => {
                const target = event.nativeEvent.target;
                if (!(target instanceof HTMLElement)) return;
                const tab = target.closest<HTMLElement>('[data-query-tab-id]');
                const id = tab?.dataset.queryTabId;
                focusedItem.current =
                    id === undefined
                        ? undefined
                        : {id, index: items.findIndex((item) => item.id === id), element: target};
                tab?.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
            }}
            onBlurCapture={(event) => {
                if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
                    focusedItem.current = undefined;
                }
            }}
        >
            <Flex alignItems="center" grow={1} basis={0} className={block('main')}>
                <TabProvider value={selectedId ?? ''} onUpdate={selectTab}>
                    <TabList
                        ref={listRef}
                        aria-label={i18n('title_queries')}
                        className={block('list')}
                    >
                        {items.map((item) => (
                            <QueryTab
                                key={item.id}
                                item={item}
                                active={item.id === selectedId}
                                closable={!hideCloseOnLastTab || items.length !== 1}
                                onSelect={selectTab}
                                onClose={onCloseTab}
                            />
                        ))}
                    </TabList>
                </TabProvider>
                <Button
                    ref={addRef}
                    view="flat-secondary"
                    size="s"
                    className={block('add')}
                    title={i18n('action_add-tab')}
                    aria-label={i18n('action_add-tab')}
                    onClick={onAddTab}
                >
                    <Icon data={PlusIcon} size={16} />
                </Button>
            </Flex>
            {actions !== undefined && actions !== null && (
                <Flex alignItems="center" gap={1} shrink={0} className={block('actions')}>
                    {actions}
                </Flex>
            )}
        </Flex>
    );
}
