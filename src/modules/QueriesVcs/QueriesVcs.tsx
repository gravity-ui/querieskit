import React from 'react';
import {ArrowRightToSquare, ArrowUpRightFromSquare, Paperclip} from '@gravity-ui/icons';
import {Flex, Icon, Loader, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {EmptyContent} from '../../components/EmptyContent';
import {NavigationActionButtons} from '../../components/NavigationActionButtons';
import {NavigationItemRow} from '../../components/NavigationItemRow';
import {SearchWithButtons} from '../../components/SearchWithButtons';
import {NavigationItemsList} from '../NavigationItemsList';
import type {NavigationItem} from '../../types/navigation';
import type {
    QueriesVcsProps,
    VcsDetailConfig,
    VcsDetailRenderContext,
    VcsFileAction,
    VcsFileContext,
    VcsItem,
    VcsLocation,
} from '../../types/queriesVcs';
import {useBrowserReady} from './internal/useBrowserReady';
import {VcsHeader} from './internal/VcsHeader';
import {VcsPath} from './internal/VcsPath';
import {VcsFilePreview} from './internal/VcsFilePreview';
import i18n from './i18n';
import './QueriesVcs.scss';

const block = cn('qp-queries-vcs');
export type {QueriesVcsProps} from '../../types/queriesVcs';

function resolveDetailContext<T extends VcsItem>(
    detail: VcsDetailConfig<T> | undefined,
    location: VcsLocation,
    getActions: (context: VcsFileContext<T>) => VcsFileAction<T>[],
): VcsDetailRenderContext<T> | undefined {
    const opened = detail?.openedFile;
    if (
        !detail ||
        !opened ||
        opened.location.providerId !== location.providerId ||
        opened.location.repositoryId !== location.repositoryId ||
        opened.location.branch !== location.branch ||
        opened.location.path !== location.path
    ) {
        return undefined;
    }
    return {
        ...opened,
        content: detail.content,
        language: detail.language,
        loading: detail.loading,
        error: detail.error,
        actions: getActions(opened).map((action) => ({
            ...action,
            disabled: opened.item.disabled || action.disabled,
        })),
        onClose: () => detail.onClose?.(),
    };
}

function getContentState({
    location,
    providers,
    branches,
    listState,
}: Pick<QueriesVcsProps, 'location' | 'providers' | 'branches' | 'listState'>):
    'selecting' | 'waiting' | 'loading' | 'error' | 'ready' {
    if (
        !location.providerId ||
        !location.branch ||
        providers.loading ||
        providers.error ||
        branches.loading ||
        branches.error
    ) {
        return 'selecting';
    }
    if (listState?.error) return 'error';
    if (listState?.loaded) return 'ready';
    return listState?.loading ? 'loading' : 'waiting';
}

function renderPendingContent(state: ReturnType<typeof getContentState>, error: React.ReactNode) {
    if (state === 'loading') {
        return (
            <Flex justifyContent="center" role="status" aria-label={i18n('context_loading')}>
                <Loader />
            </Flex>
        );
    }
    if (state === 'error') {
        return (
            <Text color="danger" role="alert">
                {error === true ? i18n('alert_load-error') : error}
            </Text>
        );
    }
    return null;
}

function renderDetailContent<T extends VcsItem>(
    context: VcsDetailRenderContext<T> | undefined,
    detail: VcsDetailConfig<T> | undefined,
    iconFor: (item: T, view: 'detail', location: VcsLocation) => React.ReactNode,
) {
    if (!context) return null;
    if (detail?.renderContent) return detail.renderContent(context);
    return <VcsFilePreview {...context} icon={iconFor(context.item, 'detail', context.location)} />;
}

export function QueriesVcs<TItem extends VcsItem = VcsItem>({
    location,
    onUpdate,
    providers,
    branches,
    items,
    search,
    sort,
    listState,
    detail,
    header,
    renderHeader,
    renderItemIcon,
    renderRowItem,
    onInsertFile,
    onAttachFile,
    getFileActions,
    onPathSubmit,
    onLoadSuggestions,
    className,
}: QueriesVcsProps<TItem>) {
    const navigate = (next: VcsLocation) => {
        detail?.onClose?.();
        onUpdate(next);
    };
    const getActions = (context: VcsFileContext<TItem>): VcsFileAction<TItem>[] => {
        if (getFileActions) return getFileActions(context);
        const actions: VcsFileAction<TItem>[] = [];
        if (onInsertFile)
            actions.push({
                id: 'insert',
                title: i18n('action_insert'),
                content: <Icon data={ArrowRightToSquare} size={16} />,
                onClick: onInsertFile,
            });
        if (onAttachFile)
            actions.push({
                id: 'attach',
                title: i18n('action_attach'),
                content: <Icon data={Paperclip} size={16} />,
                onClick: onAttachFile,
            });
        if (context.item.sourceUrl)
            actions.push({
                id: 'source',
                title: i18n('action_source'),
                content: <Icon data={ArrowUpRightFromSquare} size={16} />,
                onClick: ({item}) => {
                    if (!item.sourceUrl) return;
                    try {
                        const url = new URL(item.sourceUrl, window.location.href);
                        if (url.protocol === 'https:' || url.protocol === 'http:') {
                            window.open(url.href, '_blank', 'noopener,noreferrer');
                        }
                    } catch {
                        // Invalid source URLs cannot be opened.
                    }
                },
            });
        return actions;
    };
    const iconFor = (item: TItem, view: 'list' | 'detail', itemLocation = location) =>
        renderItemIcon ? <>{renderItemIcon({item, location: itemLocation, view})}</> : item.icon;
    const headerContext = {
        location,
        onUpdate: navigate,
        providers,
        branches,
        actions: header?.actions ?? [],
    };
    const renderLayout = (content: React.ReactNode) => (
        <Flex direction="column" gap={2} className={block(null, className)}>
            <div className={block('header')}>
                {renderHeader ? renderHeader(headerContext) : <VcsHeader {...headerContext} />}
            </div>
            {content}
        </Flex>
    );
    const contentState = getContentState({location, providers, branches, listState});
    const browserReady = useBrowserReady(location, contentState === 'ready');
    if (contentState === 'selecting' || !browserReady) {
        return renderLayout(renderPendingContent(contentState, listState?.error));
    }
    const itemMap = new Map<NavigationItem, TItem>(items.map((item) => [item, item]));
    const detailContext = resolveDetailContext(
        contentState === 'ready' ? detail : undefined,
        location,
        getActions,
    );
    const detailContent = renderDetailContent(detailContext, detail, iconFor);
    return renderLayout(
        <>
            <div className={block('path')}>
                <VcsPath
                    key={JSON.stringify(location)}
                    location={location}
                    onUpdate={navigate}
                    onSubmit={(next) => {
                        detail?.onClose?.();
                        (onPathSubmit ?? onUpdate)(next);
                    }}
                    onLoadSuggestions={onLoadSuggestions}
                />
            </div>
            {detailContext ? (
                detailContent
            ) : (
                <>
                    {search && (
                        <SearchWithButtons
                            className={block('search')}
                            placeholder={i18n('field_search-placeholder')}
                            value={search.value}
                            onUpdate={search.onUpdate}
                        />
                    )}
                    {contentState === 'ready' ? (
                        <NavigationItemsList<NavigationItem>
                            className={block('list')}
                            items={items}
                            path={location.path}
                            search={search?.value}
                            sort={sort?.value}
                            onSortUpdate={sort?.onUpdate}
                            titleLabel={i18n('title_name')}
                            loading={listState?.loading}
                            hasMore={listState?.hasMore}
                            onLoadMore={listState?.onLoadMore}
                            emptyContent={
                                <EmptyContent
                                    variant={search?.value ? 'nothing-found' : 'no-files'}
                                />
                            }
                            renderRowItem={({item, index, isActive, isParentRow}) => {
                                const original = isParentRow ? undefined : itemMap.get(item);
                                if (!original) return <NavigationItemRow item={item} />;
                                if (renderRowItem)
                                    return (
                                        <>
                                            {renderRowItem({
                                                item: original,
                                                index,
                                                isActive,
                                                location,
                                            })}
                                        </>
                                    );
                                return (
                                    <Flex alignItems="center" gap={1} className={block('row')}>
                                        <div className={block('row-title')}>
                                            <NavigationItemRow
                                                item={{
                                                    ...original,
                                                    icon: iconFor(original, 'list'),
                                                }}
                                            />
                                        </div>
                                        {original.kind === 'file' && (
                                            <Flex
                                                shrink={0}
                                                onKeyDown={(event) => event.stopPropagation()}
                                            >
                                                <NavigationActionButtons
                                                    actions={getActions({
                                                        item: original,
                                                        location,
                                                    }).map((action) => ({
                                                        ...action,
                                                        disabled:
                                                            original.disabled || action.disabled,
                                                    }))}
                                                    arg={{item: original, location}}
                                                />
                                            </Flex>
                                        )}
                                    </Flex>
                                );
                            }}
                            onItemClick={(item) => {
                                const original = itemMap.get(item);
                                if (!original || original.kind === 'folder')
                                    navigate({...location, path: item.path});
                                else detail?.onOpen?.({item: original, location});
                            }}
                        />
                    ) : (
                        renderPendingContent(contentState, listState?.error)
                    )}
                </>
            )}
        </>,
    );
}
