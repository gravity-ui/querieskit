import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {HistoryPrivateIcon} from '../../components/HistoryPrivateIcon';
import {QueryDuration} from '../../components/QueryDuration';
import {QueryStatusIcon} from '../../components/QueryStatusIcon';
import {SearchRowLayout} from '../../components/SearchRowLayout';
import {isFieldVisible} from '../../helpers/isFieldVisible';
import {formatTimeCanonical} from '../../helpers/time';
import type {QueryHistoryRow} from '../../types/history';
import type {HistorySearchRowProps as Props} from '../../types/historySearchRowProps';
import {resolveMonacoLanguage} from './helpers/resolveMonacoLanguage';
import './HistorySearchRow.scss';
export type {HistorySearchRowProps as Props} from '../../types/historySearchRowProps';

const block = cn('qp-history-search-row');

export const HistorySearchRow = <T extends QueryHistoryRow>({
    item,
    visibleFields,
    editing,
    comparison,
    renderLink,
}: Props<T>) => {
    const {href, status, startTime, endTime, engine, mode, isPrivate, query} = item;

    return (
        <SearchRowLayout
            query={query}
            language={resolveMonacoLanguage(engine)}
            href={href}
            disabled={Boolean(editing?.enabled) || Boolean(comparison?.enabled)}
            renderLink={renderLink}
            className={block()}
            header={
                <Flex gap={2} alignItems="center" className={block('header')}>
                    <QueryStatusIcon status={status} className={block('icon')} />
                    {isFieldVisible<QueryHistoryRow>(visibleFields, 'duration') &&
                        startTime !== undefined && (
                            <QueryDuration
                                status={status}
                                startTime={startTime}
                                endTime={endTime}
                            />
                        )}
                    {isFieldVisible<QueryHistoryRow>(visibleFields, 'mode') && mode && (
                        <Text color="complementary">{mode}</Text>
                    )}
                    {isFieldVisible<QueryHistoryRow>(visibleFields, 'startTime') &&
                        startTime !== undefined && (
                            <Text color="complementary" className={block('start-time')}>
                                {formatTimeCanonical(startTime)}
                            </Text>
                        )}
                    {isFieldVisible<QueryHistoryRow>(visibleFields, 'engine') && engine && (
                        <Text color="complementary">{engine}</Text>
                    )}
                    {isFieldVisible<QueryHistoryRow>(visibleFields, 'isPrivate') && (
                        <HistoryPrivateIcon isPrivate={isPrivate} />
                    )}
                </Flex>
            }
        />
    );
};
