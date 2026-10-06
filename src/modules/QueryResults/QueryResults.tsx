import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {QueryResultsTable} from '../../components/QueryResultsTable';
import type {QueryResultsProps, QueryResultsView} from '../../types/queryResults';
import {QueryResultsSchema} from './internal/QueryResultsSchema';
import i18n from './i18n';

import './QueryResults.scss';

const block = cn('qp-query-results');

export type {QueryResultsProps} from '../../types/queryResults';

export function QueryResults<TRow extends Record<string, unknown>>({
    columns,
    rows,
    totalRows = rows.length,
    loading,
    errorContent,
    rowKey,
    displayIndices,
    stripedRows,
    stickyHead,
    formatterSettings,
    maxVisibleLines,
    collapseAfterLines,
    maxInlineTextLength,
    getCellOptions,
    onCellPreview,
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
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [toolbarHeight, setToolbarHeight] = useState(0);

    useLayoutEffect(() => {
        const toolbar = toolbarRef.current;
        if (!toolbar || view !== 'schema' || stickyHead === false) return undefined;

        const measure = () => setToolbarHeight(toolbar.getBoundingClientRect().height);
        measure();
        if (!globalThis.ResizeObserver) return undefined;

        const observer = new ResizeObserver(measure);
        observer.observe(toolbar);
        return () => observer.disconnect();
    }, [view, stickyHead]);

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
        content = schema ?? (
            <QueryResultsSchema
                columns={columns}
                loading={loading}
                displayIndices={displayIndices}
                stripedRows={stripedRows}
                stickyHead={stickyHead}
                stickyTop={toolbarHeight}
            />
        );
    } else {
        content = (
            <QueryResultsTable
                columns={columns}
                rows={rows}
                loading={loading}
                rowKey={rowKey}
                displayIndices={displayIndices}
                stripedRows={stripedRows}
                stickyHead={stickyHead}
                formatterSettings={formatterSettings}
                maxVisibleLines={maxVisibleLines}
                collapseAfterLines={collapseAfterLines}
                maxInlineTextLength={maxInlineTextLength}
                getCellOptions={getCellOptions}
                onCellPreview={onCellPreview}
            />
        );
    }

    return (
        <Flex direction="column" className={block(null, className)}>
            {title && <Text variant="subheader-1">{title}</Text>}
            <Flex ref={toolbarRef} gap={2} wrap alignItems="center" className={block('toolbar')}>
                <SegmentedRadioGroup
                    value={view}
                    onUpdate={handleViewChange}
                    width="auto"
                    size="m"
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
