import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {QueryHistoryRow, QueryHistoryRowRenderData} from '../../types/history';
import {
    HistoryPrivateIcon,
    QueryDuration,
    QueryStatusIcon,
    SearchRowLayout,
} from '../../components';
import {formatTimeCanonical} from '../../helpers/time';
import {isFieldVisible} from '../../helpers/isFieldVisible';
import {resolveMonacoLanguage} from './helpers/resolveMonacoLanguage';
import './HistorySearchRow.scss';
import cn from 'bem-cn-lite';

const block = cn('qp-history-search-row');

export type Props<T extends QueryHistoryRow> = {
    item: T;
} & Omit<QueryHistoryRowRenderData<T>, 'item' | 'variant'>;

export const HistorySearchRow = <T extends QueryHistoryRow>({
    item,
    visibleFields,
    editing,
    comparison,
}: Props<T>) => {
    const {href, status, startTime, endTime, engine, mode, isPrivate, query} = item;

    return (
        <SearchRowLayout
            query={query}
            language={resolveMonacoLanguage(engine)}
            href={href}
            disabled={Boolean(editing?.enabled) || Boolean(comparison?.enabled)}
            className={block()}
            header={
                <Flex gap={2} alignItems="center" className={block('header')}>
                    <QueryStatusIcon status={status} className={block('icon')} />
                    {isFieldVisible(visibleFields, 'duration') && startTime && (
                        <QueryDuration status={status} startTime={startTime} endTime={endTime} />
                    )}
                    {isFieldVisible(visibleFields, 'mode') && mode && (
                        <Text color="complementary">{mode}</Text>
                    )}
                    {isFieldVisible(visibleFields, 'startTime') && startTime && (
                        <Text color="complementary" className={block('start-time')}>
                            {formatTimeCanonical(startTime)}
                        </Text>
                    )}
                    {isFieldVisible(visibleFields, 'engine') && engine && (
                        <Text color="complementary">{engine}</Text>
                    )}
                    {isFieldVisible(visibleFields, 'isPrivate') && (
                        <HistoryPrivateIcon isPrivate={isPrivate} />
                    )}
                </Flex>
            }
        />
    );
};
