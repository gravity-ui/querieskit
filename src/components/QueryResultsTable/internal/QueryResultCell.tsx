import React, {useMemo, useState} from 'react';
import {Button, ClipboardButton} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {QueryResultColumn, QueryResultFormatterSettings} from '../../../types/queryResults';
import {formatQueryResultValue} from '../helpers/formatQueryResultValue';
import i18n from '../i18n';

const block = cn('qp-query-results-table');

export type QueryResultCellProps<TRow extends Record<string, unknown>> = {
    row: TRow;
    value: unknown;
    index: number;
    column: QueryResultColumn<TRow>;
    formatterSettings?: QueryResultFormatterSettings;
    maxVisibleLines: number;
};

export function QueryResultCell<TRow extends Record<string, unknown>>({
    row,
    value,
    index,
    column,
    formatterSettings,
    maxVisibleLines,
}: QueryResultCellProps<TRow>) {
    const [expanded, setExpanded] = useState(false);
    const formatted = useMemo(
        () => formatQueryResultValue(value, column.type, formatterSettings),
        [column.type, formatterSettings, value],
    );

    if (column.render) {
        return <>{column.render({row, value, index, column})}</>;
    }

    if (formatted.error) {
        return <span className={block('format-error')}>{i18n('alert_format-value-error')}</span>;
    }

    const lines = formatted.html.split('\n');
    const hasMore = lines.length > maxVisibleLines;
    const html = expanded || !hasMore ? formatted.html : lines.slice(0, maxVisibleLines).join('\n');

    return (
        <span className={block('cell')}>
            <span className="unipika" dangerouslySetInnerHTML={{__html: html}} />
            <span className={block('cell-actions')}>
                <ClipboardButton text={formatted.text} view="flat-secondary" size="s" />
            </span>
            {hasMore && (
                <Button
                    view="flat"
                    size="s"
                    className={block('show-more')}
                    onClick={() => setExpanded((currentExpanded) => !currentExpanded)}
                >
                    {i18n(expanded ? 'action_show-less' : 'action_show-more')}
                </Button>
            )}
        </span>
    );
}
