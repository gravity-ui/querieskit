import React from 'react';
import cn from 'bem-cn-lite';
import {QueriesList} from '../../modules/QueriesList';
import type {SavedQuery} from '../../types/savedQueries';
import i18n from './i18n';
import {SavedQueryRowContent} from './SavedQueryRowContent';
import './SavedQueries.scss';

export type {SavedQueriesProps} from '../../types/savedQueriesProps';
import type {SavedQueriesProps} from '../../types/savedQueriesProps';

const block = cn('qp-saved-queries');

export const SavedQueries = <T extends SavedQuery>({
    title,
    logo,
    search,
    filter,
    items,
    selectedRowId,
    editing,
    comparison,
    renderAuthor,
    renderRowItem,
    getRowActions,
    onListItemClick,
    hasMore,
    loading,
    onLoadMore,
    renderLink,
    className,
}: SavedQueriesProps<T>) => {
    return (
        <QueriesList
            className={block(null, className)}
            title={title || i18n('title_saved')}
            logo={logo}
            search={search}
            filter={filter}
            items={items}
            selectedRowId={selectedRowId}
            editing={editing}
            comparison={comparison}
            getRowActions={getRowActions}
            renderRow={(data) =>
                renderRowItem ? (
                    renderRowItem(data)
                ) : (
                    <SavedQueryRowContent {...data} renderAuthor={renderAuthor} />
                )
            }
            onListItemClick={onListItemClick}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={onLoadMore}
            renderLink={renderLink}
        />
    );
};
