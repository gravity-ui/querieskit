import React from 'react';
import {
    QueryPage,
    type QueryPageCustomQueryTab,
    QueryWorkspaceLayout,
    type QueryWorkspaceLayoutProps,
} from '../../src';

const layout: QueryWorkspaceLayoutProps = {
    renderEditor: ({active}) => <div hidden={!active} />,
    renderExecutionPanel: ({onExpandedChange}) => <button onClick={() => onExpandedChange(true)} />,
};
const tab: QueryPageCustomQueryTab = {
    type: 'query',
    id: 'session',
    title: 'Session',
    status: 'draft',
    renderContent: ({active}) => <QueryWorkspaceLayout {...layout} active={active} />,
};
export const example = (
    <QueryPage
        sidebarProps={{tabs: []}}
        tabsProps={{
            items: [tab],
            activeTab: 'session',
            onActiveTabChange: () => {},
            onAddTab: () => {},
            onCloseTab: () => {},
        }}
    />
);
// @ts-expect-error Containers do not accept redundant widget props.
export const invalid: QueryPageCustomQueryTab = {...tab, executionPanelProps: {tabs: []}};
