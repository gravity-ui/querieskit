import React, {useCallback, useState} from 'react';
import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {QueryResultsTable} from '../../components';
import type {
    QueryResultColumn,
    QueryResultFormatterSettings,
    QueryResultsSchemaRenderContext,
    QueryResultsView,
} from '../../types/queryResults';
import {QueryResultsSchema} from './internal/QueryResultsSchema';
import i18n from './i18n';

import './QueryResults.scss';

const block = cn('qp-query-results');

export type QueryResultsProps<TRow extends Record<string, unknown>> = {
    columns: Array<QueryResultColumn<TRow>>;
    /** Values use the YQL wire representation consumed by @gravity-ui/unipika. */
    rows: TRow[];
    totalRows?: number;
    loading?: boolean;
    errorContent?: React.ReactNode;
    rowKey?: (row: TRow, index: number) => string | number;
    formatterSettings?: QueryResultFormatterSettings;
    maxVisibleLines?: number;
    title?: React.ReactNode;
    toolbarContent?: React.ReactNode;
    actions?: React.ReactNode;
    view?: QueryResultsView;
    defaultView?: QueryResultsView;
    onViewChange?: (view: QueryResultsView) => void;
    renderSchema?: (context: QueryResultsSchemaRenderContext<TRow>) => React.ReactNode;
    className?: string;
};

export function QueryResults<TRow extends Record<string, unknown>>({
    columns,
    rows,
    totalRows = rows.length,
    loading,
    errorContent,
    rowKey,
    formatterSettings,
    maxVisibleLines,
    title,
    toolbarContent,
    actions,
    view: controlledView,
    defaultView = 'result',
    onViewChange,
    renderSchema,
    className,
}: QueryResultsProps<TRow>) {
    const [uncontrolledView, setUncontrolledView] = useState<QueryResultsView>(defaultView);
    const view = controlledView ?? uncontrolledView;

    const handleViewChange = useCallback(
        (nextView: string) => {
            const next = nextView as QueryResultsView;
            if (controlledView === undefined) {
                setUncontrolledView(next);
            }
            onViewChange?.(next);
        },
        [controlledView, onViewChange],
    );

    const schema = renderSchema?.({columns});
    let content: React.ReactNode;

    if (errorContent) {
        content = <Text color="danger">{errorContent}</Text>;
    } else if (view === 'schema') {
        content = schema ?? <QueryResultsSchema columns={columns} loading={loading} />;
    } else {
        content = (
            <QueryResultsTable
                columns={columns}
                rows={rows}
                loading={loading}
                rowKey={rowKey}
                formatterSettings={formatterSettings}
                maxVisibleLines={maxVisibleLines}
            />
        );
    }

    return (
        <Flex direction="column" gap={2} className={block(null, className)}>
            {title && <Text variant="subheader-1">{title}</Text>}
            <Flex gap={2} alignItems="center" className={block('toolbar')}>
                <SegmentedRadioGroup
                    value={view}
                    onUpdate={handleViewChange}
                    width="auto"
                    size="s"
                    className={block('views')}
                >
                    <SegmentedRadioGroup.Option value="result">
                        {i18n('tab_result')}
                    </SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="schema">
                        {i18n('tab_schema')}
                    </SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
                <Text color="secondary" className={block('rows-info')}>
                    {i18n('context_rows-info', {
                        count: totalRows,
                        visible: rows.length,
                        total: totalRows,
                    })}
                </Text>
                {toolbarContent && <div className={block('toolbar-content')}>{toolbarContent}</div>}
                {actions && <div className={block('actions')}>{actions}</div>}
            </Flex>
            <div className={block('content')}>{content}</div>
        </Flex>
    );
}
