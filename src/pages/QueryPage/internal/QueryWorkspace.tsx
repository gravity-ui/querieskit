import type {AttachItem} from '../../../types/attachments';
import React, {useId} from 'react';
import cn from 'bem-cn-lite';
import type {NavigationMetaItem} from '../../../types/navigation';
import type {QueryPageQueryTab} from '../../../types/queryPage';
import {QueryEditor} from '../../../widgets/QueryEditor';
import {QueryExecutionPanel} from '../../../widgets/QueryExecutionPanel';
import {ResizeHandle} from './ResizeHandle';
import {useElementSize, useLayoutState} from './useLayoutState';
import i18n from '../i18n';
import './QueryWorkspace.scss';

const block = cn('qp-query-workspace');
const MIN_EDITOR_HEIGHT = 160;
const MIN_RESULTS = 120;
const DIVIDER = 6;

export function QueryWorkspace<
    TCustom extends object,
    TRow extends Record<string, unknown>,
    TMetaItem extends NavigationMetaItem,
    TAttachment extends AttachItem,
    TValue,
>({
    tab,
    active,
}: {
    tab: QueryPageQueryTab<TCustom, TRow, TMetaItem, TAttachment, TValue>;
    active: boolean;
}) {
    const children = <StandardQueryWorkspace tab={tab} active={active} />;
    return tab.renderWorkspace ? tab.renderWorkspace({children, active}) : children;
}

function StandardQueryWorkspace<
    TCustom extends object,
    TRow extends Record<string, unknown>,
    TMetaItem extends NavigationMetaItem,
    TAttachment extends AttachItem,
    TValue,
>({
    tab,
    active,
}: {
    tab: QueryPageQueryTab<TCustom, TRow, TMetaItem, TAttachment, TValue>;
    active: boolean;
}) {
    const {editorProps, executionPanelProps} = tab;
    const resultsId = useId();
    const [rootRef, rootSize] = useElementSize();
    const [preferredHeight, changeHeight] = useLayoutState(
        tab.executionPanelHeight,
        tab.defaultExecutionPanelHeight ?? 300,
        tab.onExecutionPanelHeightChange,
    );
    const [collapsed, changeCollapsed] = useLayoutState(
        executionPanelProps.collapsed,
        executionPanelProps.defaultCollapsed ?? false,
        executionPanelProps.onCollapsedChange,
    );
    const [expanded, changeExpanded] = useLayoutState(
        executionPanelProps.expanded,
        false,
        executionPanelProps.onExpandedChange,
    );
    const showResults =
        tab.status !== 'draft' ||
        executionPanelProps.tabs.length > 0 ||
        Boolean(
            executionPanelProps.execution ||
            executionPanelProps.statusContent ||
            executionPanelProps.loading ||
            executionPanelProps.error,
        );
    const showExpanded = showResults && expanded && !collapsed;
    const maxHeight = rootSize.height
        ? Math.max(MIN_RESULTS, rootSize.height - MIN_EDITOR_HEIGHT - DIVIDER)
        : undefined;
    const height = Math.max(
        MIN_RESULTS,
        Math.min(maxHeight ?? Infinity, Number.isFinite(preferredHeight) ? preferredHeight : 300),
    );

    return (
        <div
            ref={rootRef}
            className={block({expanded: showExpanded, collapsed})}
            // Use an explicit minimum: Monaco's inline height must never become
            // the grid's intrinsic minimum after closing and reopening results.
            style={
                showExpanded
                    ? undefined
                    : {
                          gridTemplateRows: `minmax(${MIN_EDITOR_HEIGHT}px, 1fr)${showResults ? ` ${collapsed ? 'auto' : `${DIVIDER}px ${height}px`}` : ''}`,
                      }
            }
        >
            <div className={block('editor-region')} hidden={showExpanded}>
                <div className={block('editor')}>
                    <QueryEditor {...editorProps} />
                </div>
            </div>
            <div
                className={block('results-divider')}
                hidden={!showResults || collapsed || showExpanded}
            >
                <ResizeHandle
                    orientation="horizontal"
                    value={height}
                    min={MIN_RESULTS}
                    max={maxHeight}
                    label={i18n('action_resize-results')}
                    controls={resultsId}
                    onChange={changeHeight}
                />
            </div>
            <div id={resultsId} className={block('results')} hidden={!showResults}>
                <QueryExecutionPanel
                    {...executionPanelProps}
                    active={showResults && active && executionPanelProps.active !== false}
                    collapsed={collapsed}
                    expanded={expanded}
                    onCollapsedChange={changeCollapsed}
                    onExpandedChange={changeExpanded}
                />
            </div>
        </div>
    );
}
