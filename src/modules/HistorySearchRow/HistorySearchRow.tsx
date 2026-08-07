import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {QueryHistoryRow, QueryHistoryRowRenderData} from '../../types/history';
import {HistoryPrivateIcon, MonacoEditor, QueryDuration, QueryStatusIcon} from '../../components';
import {formatTimeCanonical} from '../../helpers/time';
import {isFieldVisible} from '../../helpers/isFieldVisible';
import {fitQueryToVisibleLines} from './helpers/fitQueryToVisibleLines';
import {MONACO_CONFIG} from './monacoConfig';
import {resolveMonacoLanguage} from './helpers/resolveMonacoLanguage';
import './HistorySearchRow.scss';
import cn from 'bem-cn-lite';

const block = cn('qp-history-search-row');

export const SEARCH_ROW_HEIGHT = 110;

export type Props<T extends QueryHistoryRow> = {
    item: T;
} & Omit<QueryHistoryRowRenderData<T>, 'item'>;

export const HistorySearchRow = <T extends QueryHistoryRow>({item, visibleFields}: Props<T>) => {
    const {status, startTime, endTime, engine, mode, isPrivate, query} = item;

    return (
        <Flex direction="column" gap={2} className={block()}>
            <Flex gap={2} alignItems="center">
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
            <MonacoEditor
                value={fitQueryToVisibleLines(query)}
                language={resolveMonacoLanguage(engine)}
                readOnly
                monacoConfig={MONACO_CONFIG}
                className={block('monaco')}
            />
        </Flex>
    );
};
