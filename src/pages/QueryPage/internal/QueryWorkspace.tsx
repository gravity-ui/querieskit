import type {AttachItem} from '../../../types/attachments';
import React from 'react';
import type {NavigationMetaItem} from '../../../types/navigation';
import type {QueryPageCustomQueryTab, QueryPageQueryTab} from '../../../types/queryPage';
import {QueryEditor} from '../../../widgets/QueryEditor';
import {QueryExecutionPanel} from '../../../widgets/QueryExecutionPanel';
import {QueryWorkspaceLayout} from '../../../modules/QueryWorkspaceLayout';

type Props<
    TCustom extends object,
    TRow extends Record<string, unknown>,
    TMetaItem extends NavigationMetaItem,
    TAttachment extends AttachItem,
    TValue,
> = {
    tab: QueryPageQueryTab<TCustom, TRow, TMetaItem, TAttachment, TValue> | QueryPageCustomQueryTab;
    active: boolean;
};

export function QueryWorkspace<
    TCustom extends object,
    TRow extends Record<string, unknown>,
    TMetaItem extends NavigationMetaItem,
    TAttachment extends AttachItem,
    TValue,
>({tab, active}: Props<TCustom, TRow, TMetaItem, TAttachment, TValue>) {
    if (tab.renderContent) return tab.renderContent({active});
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
    const showResults =
        tab.status !== 'draft' ||
        executionPanelProps.tabs.length > 0 ||
        Boolean(
            executionPanelProps.execution ||
            executionPanelProps.statusContent ||
            executionPanelProps.loading ||
            executionPanelProps.error,
        );
    return (
        <QueryWorkspaceLayout
            active={active}
            showResults={showResults}
            executionPanelHeight={tab.executionPanelHeight}
            defaultExecutionPanelHeight={tab.defaultExecutionPanelHeight}
            onExecutionPanelHeightChange={tab.onExecutionPanelHeightChange}
            collapsed={executionPanelProps.collapsed}
            defaultCollapsed={executionPanelProps.defaultCollapsed}
            onCollapsedChange={executionPanelProps.onCollapsedChange}
            expanded={executionPanelProps.expanded}
            onExpandedChange={executionPanelProps.onExpandedChange}
            renderEditor={({active: editorActive}) => (
                <QueryEditor
                    {...editorProps}
                    active={editorActive && editorProps.active !== false}
                />
            )}
            renderExecutionPanel={({active: executionActive, ...layout}) => (
                <QueryExecutionPanel
                    {...executionPanelProps}
                    {...layout}
                    active={executionActive && executionPanelProps.active !== false}
                />
            )}
        />
    );
}
