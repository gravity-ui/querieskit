import React from 'react';
import {HistoryHeader} from '../../modules/HistoryHeader';
import {HistoryLayout} from '../../modules/HistoryLayout';
import {RowsList} from '../../modules/RowsList';
import i18n from './i18n';
import type {
    QueryListFilterConfig,
    QueryListItem,
    QueryListSearchConfig,
} from '../../types/queryList';
import type {TutorialHistoryRow} from '../../types/tutorial';
import {getListKey} from '../../helpers/getListKey';
import {TutorialRowContent} from './TutorialRowContent';
import cn from 'bem-cn-lite';
import './TutorialsHistory.scss';

export type TutorialsHistoryProps<T extends TutorialHistoryRow = TutorialHistoryRow> = {
    className?: string;
    title?: string;
    logo?: React.ReactNode;
    search: QueryListSearchConfig;
    filter?: QueryListFilterConfig;
    items: QueryListItem<T>[];
    selectedRowId?: T['id'];
    onListItemClick?: (item: QueryListItem<T>) => void;
};

const block = cn('qp-tutorials-history');

export const TutorialsHistory = <T extends TutorialHistoryRow>({
    title,
    logo,
    search,
    filter,
    items,
    selectedRowId,
    onListItemClick,
    className,
}: TutorialsHistoryProps<T>) => {
    const fullSearchAvailable = search.fullSearchAvailable !== false;
    const showSearchResults = Boolean(
        fullSearchAvailable && search.fullSearch && search.value?.trim(),
    );
    const rowVariant = showSearchResults ? 'search' : 'default';

    return (
        <HistoryLayout
            className={block(null, className)}
            title={title || i18n('title_tutorials')}
            logo={logo}
            header={
                <HistoryHeader
                    search={search.value}
                    fullSearch={search.fullSearch}
                    fullSearchAvailable={fullSearchAvailable}
                    hasClear={search.hasClear}
                    filter={filter}
                    onUpdate={search.onUpdate}
                />
            }
        >
            <RowsList
                key={getListKey(items, rowVariant)}
                items={items}
                rowVariant={rowVariant}
                selectedRowId={selectedRowId}
                renderRow={(data) => <TutorialRowContent {...data} />}
                showFiltersHint={Boolean(filter)}
                onItemClick={onListItemClick}
            />
        </HistoryLayout>
    );
};
