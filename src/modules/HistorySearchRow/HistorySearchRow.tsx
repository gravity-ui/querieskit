import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {QueryHistoryRow, QueryHistoryRowRenderData} from '../../types/history';
import {
    HistoryPrivateIcon,
    MonacoEditor,
    MonacoEditorConfig,
    QueryDuration,
    QueryStatusIcon,
} from '../../components';
import {formatTimeCanonical} from '../../helpers/time';
import {isFieldVisible} from '../../helpers/isFieldVisible';
import './HistorySearchRow.scss';
import cn from 'bem-cn-lite';

const MONACO_VISIBLE_LINES = 4;
const MONACO_LINE_HEIGHT = 18;

const fitQueryToVisibleLines = (query = '') => {
    const lines = query.split(/\r\n|\r|\n/).slice(0, MONACO_VISIBLE_LINES);
    while (lines.length < MONACO_VISIBLE_LINES) {
        lines.push('');
    }

    return lines.join('\n');
};

const MONACO_CONFIG: MonacoEditorConfig = {
    contextmenu: false,
    fontSize: 12,
    lineHeight: MONACO_LINE_HEIGHT,
    language: 'plaintext',
    renderWhitespace: 'boundary',
    minimap: {
        enabled: false,
    },
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    overviewRulerLanes: 0,
    lineNumbersMinChars: 2,
    glyphMargin: false,
    scrollbar: {
        vertical: 'hidden',
        verticalHasArrows: false,
        horizontal: 'auto',
        useShadows: false,
        alwaysConsumeMouseWheel: false,
    },
};

const block = cn('qp-history-search-row');

export const SEARCH_ROW_HEIGHT = 144;

export type Props<T extends QueryHistoryRow> = {
    item: T;
} & Omit<QueryHistoryRowRenderData<T>, 'item'>;

export const HistorySearchRow = <T extends QueryHistoryRow>({item, visibleFields}: Props<T>) => {
    const {status, startTime, endTime, engine, mode, isPrivate, query} = item;

    return (
        <Flex direction="column" gap={2} className={block()}>
            <Flex gap={2} alignItems="center">
                <QueryStatusIcon status={status} />
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
                readOnly
                monacoConfig={MONACO_CONFIG}
                className={block('monaco')}
            />
        </Flex>
    );
};
