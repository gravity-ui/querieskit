import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Text, TextArea, TextInput} from '@gravity-ui/uikit';
import {QueryPageLayout} from '..';
import {QueryWorkspaceLayout} from '../../QueryWorkspaceLayout';
import './QueryPageLayout.stories.scss';

function Sidebar() {
    const [search, setSearch] = useState('');
    return (
        <Flex direction="column" gap={3} className="qp-query-page-layout-story__panel">
            <Text variant="subheader-2">Saved queries</Text>
            <TextInput
                value={search}
                onUpdate={setSearch}
                placeholder="Find a query"
                controlProps={{'aria-label': 'Find a query'}}
            />
            <Text color="secondary">The search draft survives sidebar collapse.</Text>
        </Flex>
    );
}

function Workspace() {
    const [query, setQuery] = useState('SELECT region, COUNT(*) FROM events GROUP BY region;');
    return (
        <QueryWorkspaceLayout
            defaultExecutionPanelHeight={220}
            renderEditor={() => (
                <Flex direction="column" gap={3} className="qp-query-page-layout-story__panel">
                    <Text variant="subheader-2">Query</Text>
                    <TextArea
                        value={query}
                        onUpdate={setQuery}
                        rows={6}
                        controlProps={{'aria-label': 'Query text'}}
                    />
                </Flex>
            )}
            renderExecutionPanel={({collapsed, onCollapsedChange, expanded, onExpandedChange}) => (
                <Flex direction="column" gap={3} className="qp-query-page-layout-story__panel">
                    <Flex alignItems="center" gap={2}>
                        <Text variant="subheader-2">Results</Text>
                        <Button onClick={() => onCollapsedChange(!collapsed)}>
                            {collapsed ? 'Show results' : 'Collapse results'}
                        </Button>
                        <Button onClick={() => onExpandedChange(!expanded)}>
                            {expanded ? 'Restore editor' : 'Expand results'}
                        </Button>
                    </Flex>
                    {!collapsed && <Text>Application-owned results appear here.</Text>}
                </Flex>
            )}
        />
    );
}

function Example({customHeader = false, controlled = false}) {
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    return (
        <Flex direction="column" gap={3}>
            {controlled && (
                <Flex alignItems="center" gap={3} wrap>
                    <Button onClick={() => setSidebarCollapsed((value) => !value)}>
                        Toggle sidebar externally
                    </Button>
                    <Button onClick={() => setSidebarWidth(300)}>Reset sidebar width</Button>
                    <Text>Sidebar: {Math.round(sidebarWidth)} px</Text>
                </Flex>
            )}
            <div className="qp-query-page-layout-story">
                <QueryPageLayout
                    sidebar={<Sidebar />}
                    sidebarWidth={controlled ? sidebarWidth : undefined}
                    onSidebarWidthChange={controlled ? setSidebarWidth : undefined}
                    sidebarCollapsed={controlled ? sidebarCollapsed : undefined}
                    onSidebarCollapsedChange={controlled ? setSidebarCollapsed : undefined}
                    header={
                        customHeader ? (
                            ({sidebarToggle, sidebarCollapsed: collapsed}) => (
                                <Flex
                                    alignItems="center"
                                    gap={3}
                                    className="qp-query-page-layout-story__header"
                                >
                                    {sidebarToggle}
                                    <Text variant="subheader-2">Analytics workspace</Text>
                                    <Text color="secondary">
                                        {collapsed ? 'Sidebar hidden' : 'Sidebar visible'}
                                    </Text>
                                </Flex>
                            )
                        ) : (
                            <Text variant="subheader-2">Analytics workspace</Text>
                        )
                    }
                >
                    <Workspace />
                </QueryPageLayout>
            </div>
        </Flex>
    );
}

const meta = {
    title: 'Modules/QueryPageLayout',
    component: Example,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'A sidebar and one workspace without query tabs. Drag the sidebar separator or focus it and use arrow/Home/End keys. The nested QueryWorkspaceLayout independently resizes the editor and results.',
            },
        },
    },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleWorkspace: Story = {};
export const CustomHeader: Story = {args: {customHeader: true}};
export const Controlled: Story = {args: {controlled: true}};
