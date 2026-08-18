import React from 'react';
import {HistoryHeader, HistoryLayout, RowsList} from '../../modules';
import i18n from './i18n';
import {
    QueryHistoryFilterConfig,
    QueryHistoryItem,
    QueryHistorySearchConfig,
} from '../../types/history';
import {TutorialHistoryRow} from '../../types/tutorial';
import {getListKey} from '../../helpers/getListKey';
import {TutorialRowContent} from './TutorialRowContent';
import cn from 'bem-cn-lite';
import './TutorialsHistory.scss';

export type TutorialsHistoryProps<T extends TutorialHistoryRow = TutorialHistoryRow> = {
    className?: string;
    title?: string;
    logo?: React.ReactNode;
    search: QueryHistorySearchConfig;
    filter?: QueryHistoryFilterConfig;
    items: QueryHistoryItem<T>[];
    selectedRowId?: T['id'];
    onListItemClick?: (item: QueryHistoryItem<T>) => void;
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
    const showSearchResults = Boolean(search.fullSearch && search.value?.trim());
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
