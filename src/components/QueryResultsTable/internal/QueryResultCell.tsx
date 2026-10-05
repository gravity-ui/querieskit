import React, {useId, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Button, ClipboardButton, Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {
    QueryResultCellRenderContext,
    QueryResultCellSettings,
} from '../../../types/queryResults';
import {
    type FormattedQueryResultValue,
    formatQueryResultValue,
} from '../helpers/formatQueryResultValue';
import i18n from '../i18n';

import './QueryResultCell.scss';

const block = cn('qp-query-result-cell');

function cellMetadata(formatted: FormattedQueryResultValue) {
    return formatted.error ? {isIncomplete: false, tag: undefined} : formatted;
}

type QueryResultCellProps<TRow extends Record<string, unknown>> =
    QueryResultCellRenderContext<TRow> &
        QueryResultCellSettings<TRow> & {
            maxVisibleLines: number;
            collapseAfterLines: number;
        };

export function QueryResultCell<TRow extends Record<string, unknown>>({
    row,
    value,
    index,
    column,
    formatterSettings,
    maxVisibleLines,
    collapseAfterLines,
    maxInlineTextLength,
    getCellOptions,
    onCellPreview,
}: QueryResultCellProps<TRow>) {
    const contentId = useId();
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const request = useRef<object | null>(null);
    const context = useMemo(() => ({row, value, index, column}), [row, value, index, column]);
    const formatted = useMemo<FormattedQueryResultValue>(() => {
        try {
            return formatQueryResultValue(
                value,
                column.type,
                formatterSettings,
                getCellOptions?.(context),
                maxInlineTextLength,
            );
        } catch {
            return {error: true as const, html: '', text: ''};
        }
    }, [value, column.type, formatterSettings, getCellOptions, context, maxInlineTextLength]);
    const {isIncomplete, tag} = cellMetadata(formatted);
    // YQL types are wire tuples: equivalent inline column definitions must not
    // reset expansion or invalidate an in-flight preview on a parent render.
    const columnTypeKey = JSON.stringify(column.type);

    useLayoutEffect(() => {
        setExpanded(false);
        setLoading(false);
        setPreviewError(false);
        request.current = null;
        return () => {
            request.current = null;
        };
    }, [row, value, index, column.name, columnTypeKey, isIncomplete, tag]);

    const preview = async () => {
        if (!onCellPreview || request.current) return;
        const token = {};
        request.current = token;
        setLoading(true);
        setPreviewError(false);
        try {
            await onCellPreview({...context, isIncomplete, tag});
        } catch {
            if (request.current === token) setPreviewError(true);
        } finally {
            if (request.current === token) {
                request.current = null;
                setLoading(false);
            }
        }
    };

    if (formatted.error) {
        return (
            <span className={block('error')} role="alert">
                {i18n('alert_format-value-error')}
            </span>
        );
    }

    const incompleteTagged = isIncomplete && tag !== undefined;
    const placeholder = incompleteTagged || formatted.isTooLarge;
    const hasMore =
        !placeholder &&
        formatted.html.split('\n').length > Math.max(maxVisibleLines, collapseAfterLines);
    const previewLabel = i18n(previewError ? 'action_retry-preview' : 'action_preview');
    const canPreview = Boolean(onCellPreview && (isIncomplete || formatted.isTooLarge));

    return (
        <div
            className={block({
                persistent: placeholder || previewError || loading,
                copyable: !isIncomplete,
            })}
        >
            {incompleteTagged ? (
                <span className={block('warning')}>{i18n('alert_incomplete-tag', {tag})}</span>
            ) : (
                <>
                    {isIncomplete && (
                        <div className={block('warning')}>{i18n('alert_incomplete-value')}</div>
                    )}
                    {formatted.isTooLarge ? (
                        <span>{i18n('context_value-too-large')}</span>
                    ) : (
                        <div
                            id={contentId}
                            className={block('content', {collapsed: hasMore && !expanded})}
                            style={
                                {
                                    '--query-result-visible-lines': maxVisibleLines,
                                } as React.CSSProperties
                            }
                        >
                            <span
                                className="unipika"
                                dangerouslySetInnerHTML={{__html: formatted.html}}
                            />
                        </div>
                    )}
                </>
            )}
            <Flex gap={1} alignItems="center" className={block('actions')}>
                {!isIncomplete && (
                    <ClipboardButton
                        className={block('copy')}
                        text={formatted.text}
                        view="flat-secondary"
                        size="s"
                        aria-label={i18n('action_copy')}
                        tooltipInitialText={i18n('action_copy')}
                        tooltipSuccessText={i18n('context_copied')}
                    />
                )}
                {canPreview && (
                    <Button
                        view="flat-secondary"
                        size="s"
                        onClick={preview}
                        loading={loading}
                        disabled={loading}
                        aria-label={previewLabel}
                    >
                        {previewLabel}
                    </Button>
                )}
            </Flex>
            {previewError && (
                <div role="alert" className={block('error')}>
                    {i18n('alert_preview-error')}
                </div>
            )}
            {hasMore && (
                <Button
                    view="flat"
                    size="s"
                    className={block('show-more')}
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    onClick={() => setExpanded((current) => !current)}
                >
                    {i18n(expanded ? 'action_show-less' : 'action_show-more')}
                </Button>
            )}
        </div>
    );
}
