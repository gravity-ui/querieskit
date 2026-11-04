import React, {useId} from 'react';
import cn from 'bem-cn-lite';
import {ResizeHandle} from '../../components/ResizeHandle';
import {useElementSize, useLayoutState} from '../../helpers/useLayoutState';
import type {QueryWorkspaceLayoutProps} from '../../types/queryWorkspaceLayout';
import i18n from './i18n';
import './QueryWorkspaceLayout.scss';

const block = cn('qp-query-workspace');
const MIN_EDITOR_HEIGHT = 160;
const MIN_RESULTS = 120;
const DIVIDER = 6;

export function QueryWorkspaceLayout({
    renderEditor,
    renderExecutionPanel,
    active = true,
    showResults = true,
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    expanded: controlledExpanded,
    defaultExpanded = false,
    onExpandedChange,
    executionPanelHeight,
    defaultExecutionPanelHeight = 300,
    onExecutionPanelHeightChange,
    className,
}: QueryWorkspaceLayoutProps) {
    const resultsId = useId();
    const [rootRef, rootSize] = useElementSize();
    const [preferredHeight, changeHeight] = useLayoutState(
        executionPanelHeight,
        defaultExecutionPanelHeight,
        onExecutionPanelHeightChange,
    );
    const [collapsed, changeCollapsed] = useLayoutState(
        controlledCollapsed,
        defaultCollapsed,
        onCollapsedChange,
    );
    const [expanded, changeExpanded] = useLayoutState(
        controlledExpanded,
        defaultExpanded,
        onExpandedChange,
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
            className={block({expanded: showExpanded, collapsed}, className)}
            // Monaco's inline height must not become the grid's intrinsic minimum.
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
                    {renderEditor({active: active && !showExpanded})}
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
                {renderExecutionPanel({
                    active: active && showResults,
                    collapsed,
                    expanded,
                    onCollapsedChange: changeCollapsed,
                    onExpandedChange: changeExpanded,
                })}
            </div>
        </div>
    );
}
