import React from 'react';
import {QueriesList} from '../../modules/QueriesList';
import {EmptyContent} from '../../components/EmptyContent';
import i18n from './i18n';
import type {TutorialHistoryRow} from '../../types/tutorial';
import {TutorialRowContent} from './TutorialRowContent';
import {TutorialsEngineFilter} from './TutorialsEngineFilter';
import cn from 'bem-cn-lite';
import './TutorialsHistory.scss';

export type {TutorialsHistoryProps} from '../../types/tutorialsHistory';
import type {TutorialsHistoryProps} from '../../types/tutorialsHistory';

const block = cn('qp-tutorials-history');

export const TutorialsHistory = <T extends TutorialHistoryRow>({
    title,
    logo,
    search,
    engineFilter,
    items,
    selectedRowId,
    renderRowItem,
    onListItemClick,
    hasMore,
    loading,
    onLoadMore,
    renderLink,
    className,
}: TutorialsHistoryProps<T>) => {
    const engines = engineFilter?.engines;
    const hasEngines = Boolean(engines?.length);
    const selectedEngine = engineFilter?.value ?? null;

    return (
        <QueriesList
            variant="panel"
            className={block(null, className)}
            title={title || i18n('title_tutorials')}
            logo={logo}
            search={search}
            isFilterActive={hasEngines && selectedEngine !== null}
            headerActions={
                hasEngines && engineFilter && <TutorialsEngineFilter {...engineFilter} />
            }
            items={items}
            selectedRowId={selectedRowId}
            renderRow={(data) =>
                renderRowItem ? renderRowItem(data) : <TutorialRowContent {...data} />
            }
            emptyContent={<EmptyContent variant="no-data" title={i18n('title_no-tutorials')} />}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={onLoadMore}
            renderLink={renderLink}
            onListItemClick={onListItemClick}
        />
    );
};
