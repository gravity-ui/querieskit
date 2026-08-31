import React from 'react';
import cn from 'bem-cn-lite';
import {QueriesList} from '../../modules';
import {
    QueryListComparisonConfig,
    QueryListEditingConfig,
    QueryListFilterConfig,
    QueryListItem,
    QueryListRowAction,
    QueryListRowRenderData,
    QueryListSearchConfig,
    QueryListVisibleFieldsConfig,
} from '../../types/queryList';
import {SavedQuery} from '../../types/savedQueries';
import i18n from './i18n';
import {SavedQueryRowContent} from './SavedQueryRowContent';
import './SavedQueries.scss';

export type SavedQueriesProps<T extends SavedQuery = SavedQuery> = {
    className?: string;
    title?: string;
    logo?: React.ReactNode;
    search: QueryListSearchConfig;
    filter?: QueryListFilterConfig;
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    editing?: QueryListEditingConfig<T>;
    comparison?: QueryListComparisonConfig<T>;
    visibleFields?: QueryListVisibleFieldsConfig<T>;
    renderAuthor?: (item: T) => React.ReactNode;
    renderRowItem?: (data: QueryListRowRenderData<T>) => React.ReactNode;
    getRowActions?: (item: T) => QueryListRowAction<T>[];
    onListItemClick?: (item: QueryListItem<T>) => void;
};

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
    visibleFields,
    renderAuthor,
    renderRowItem,
    getRowActions,
    onListItemClick,
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
            visibleFields={visibleFields}
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
        />
    );
};
