import React, {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Text, TextInput} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {QueryPage} from '..';
import {useQueriesSidebarTabs} from '../../../widgets/QueriesSidebar/QueriesSidebar.stories.data';
import {
    CLUSTERS,
    PARAMETERS,
    QUERY,
    SETTINGS,
    TAB_ENGINES,
} from '../../../widgets/QueryEditor/story/demoData';
import {designTabs} from '../../../widgets/QueryExecutionPanel/story/designReference';
import './QueryPage.stories.scss';

function Notes() {
    const [value, setValue] = useState('');
    return (
        <TextInput
            controlProps={{'aria-label': 'Execution notes'}}
            placeholder="These notes survive collapsing and expanding results"
            value={value}
            onUpdate={setValue}
        />
    );
}

type ExampleProps = {
    sidebarHidden?: boolean;
    resultsCollapsed?: boolean;
    resultsExpanded?: boolean;
    controlled?: boolean;
};

function Example({
    sidebarHidden = false,
    resultsCollapsed = false,
    resultsExpanded = false,
    controlled = false,
}: ExampleProps) {
    const createDraft = (id: string) => ({
        id,
        value:
            id === '2' ? 'SELECT region, COUNT(*) FROM `//demo/events` GROUP BY region;\n' : QUERY,
        savedValue:
            id === '2' ? 'SELECT region, COUNT(*) FROM `//demo/events` GROUP BY region;\n' : QUERY,
        clusterId: CLUSTERS[id === '2' ? 1 : 0].id,
        engineId: TAB_ENGINES[0].id,
        parameters: PARAMETERS.map((parameter) => ({...parameter})),
        settings: {...SETTINGS, queryName: `Query ${id}`},
        executionPanelHeight: 300,
        collapsed: resultsCollapsed,
        expanded: resultsExpanded,
    });
    const [drafts, setDrafts] = useState(() => [createDraft('1'), createDraft('2')]);
    const [activeId, setActiveId] = useState('1');
    const nextId = useRef(3);
    const activeDraft = drafts.find(({id}) => id === activeId) ?? drafts[0];
    const updateDraft = (id: string, update: Partial<(typeof drafts)[number]>) => {
        setDrafts((current) =>
            current.map((item) => (item.id === id ? {...item, ...update} : item)),
        );
    };
    const sidebarTabs = useQueriesSidebarTabs();
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebarHidden);
    const expandedControlled = controlled || resultsExpanded;

    return (
        <Flex direction="column" gap={3}>
            {controlled && (
                <Flex gap={3} alignItems="center" wrap>
                    <Button onClick={() => setSidebarCollapsed((value) => !value)}>
                        Toggle sidebar externally
                    </Button>
                    <Button
                        onClick={() => {
                            setSidebarWidth(300);
                            updateDraft(activeId, {executionPanelHeight: 300});
                        }}
                    >
                        Reset sizes
                    </Button>
                    <Text>
                        Sidebar: {Math.round(sidebarWidth)} px; results:{' '}
                        {Math.round(activeDraft.executionPanelHeight)} px (Query {activeId})
                    </Text>
                </Flex>
            )}
            <div className="qp-query-page-story">
                <QueryPage
                    defaultSidebarCollapsed={sidebarHidden}
                    sidebarWidth={controlled ? sidebarWidth : undefined}
                    onSidebarWidthChange={controlled ? setSidebarWidth : action('sidebarWidth')}
                    sidebarCollapsed={controlled ? sidebarCollapsed : undefined}
                    onSidebarCollapsedChange={
                        controlled ? setSidebarCollapsed : action('sidebarCollapsed')
                    }
                    sidebarProps={{
                        header: <Text variant="subheader-2">Queries</Text>,
                        keepMounted: true,
                        tabs: sidebarTabs,
                    }}
                    tabsProps={{
                        activeTab: activeId,
                        onActiveTabChange: setActiveId,
                        hideCloseOnLastTab: true,
                        onAddTab: () => {
                            const id = String(nextId.current++);
                            setDrafts((current) => [...current, createDraft(id)]);
                            setActiveId(id);
                        },
                        onCloseTab: (id) => {
                            if (drafts.length === 1) return;
                            const remaining = drafts.filter((item) => item.id !== id);
                            setDrafts(remaining);
                            if (activeId === id) setActiveId(remaining[0].id);
                        },
                        items: drafts.map((draft) => ({
                            id: draft.id,
                            title: `Query ${draft.id}`,
                            type: 'query',
                            status: 'draft',
                            isModified: draft.value !== draft.savedValue,
                            executionPanelHeight: controlled
                                ? draft.executionPanelHeight
                                : undefined,
                            onExecutionPanelHeightChange: (height) => {
                                if (controlled)
                                    updateDraft(draft.id, {executionPanelHeight: height});
                                action('executionPanelHeight')({id: draft.id, height});
                            },
                            editorProps: {
                                value: draft.value,
                                onChange: (value) => updateDraft(draft.id, {value}),
                                clusters: CLUSTERS,
                                clusterId: draft.clusterId,
                                onClusterChange: (clusterId) => updateDraft(draft.id, {clusterId}),
                                engines: TAB_ENGINES,
                                engineId: draft.engineId,
                                onEngineChange: (engineId) => updateDraft(draft.id, {engineId}),
                                onRun: () =>
                                    action('run')({
                                        id: draft.id,
                                        value: draft.value,
                                        parameters: draft.parameters,
                                    }),
                                onFormat: () =>
                                    updateDraft(draft.id, {value: draft.value.trim() + '\n'}),
                                onValidate: () => action('validate')(draft.id),
                                saveProps: {
                                    onSave: () => updateDraft(draft.id, {savedValue: draft.value}),
                                    onSaveAs: () => action('saveAs')(draft.id),
                                },
                                parametersProps: {
                                    value: draft.parameters,
                                    onChange: (parameters) => updateDraft(draft.id, {parameters}),
                                },
                                settingsProps: {
                                    value: draft.settings,
                                    onChange: (settings: typeof SETTINGS) =>
                                        updateDraft(draft.id, {settings}),
                                },
                            },
                            executionPanelProps: {
                                tabs: [
                                    ...designTabs,
                                    {
                                        id: 'notes',
                                        type: 'custom',
                                        title: 'Notes',
                                        renderContent: () => <Notes />,
                                    },
                                ],
                                execution: {
                                    startedAt: '11 Dec 2025, 12:07:27',
                                    author: `query-${draft.id}-author`,
                                },
                                defaultCollapsed: resultsCollapsed,
                                collapsed: controlled ? draft.collapsed : undefined,
                                onCollapsedChange: (collapsed) => {
                                    if (controlled) updateDraft(draft.id, {collapsed});
                                    action('resultsCollapsed')({id: draft.id, collapsed});
                                },
                                expanded: expandedControlled ? draft.expanded : undefined,
                                onExpandedChange: (expanded) => {
                                    if (expandedControlled) updateDraft(draft.id, {expanded});
                                    action('resultsExpanded')({id: draft.id, expanded});
                                },
                            },
                        })),
                    }}
                />
            </div>
        </Flex>
    );
}

const meta = {
    title: 'Pages/QueryPage',
    component: Example,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'A shared sidebar and query tabs, each containing an independent editor and execution panel. Drag the separators or focus them and use arrow keys to resize. Query data, tabs and actions belong to the application.',
            },
        },
    },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const IndependentTabs: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Edit Query 1, open its Notes results tab, then switch to Query 2. Each query retains its editor, settings, notes and results layout. Closing a query removes its workspace; adding a query creates a fresh one.',
            },
        },
    },
};
export const HiddenSidebar: Story = {args: {sidebarHidden: true}};
export const CollapsedResults: Story = {args: {resultsCollapsed: true}};
export const ExpandedResults: Story = {args: {resultsExpanded: true}};
export const ControlledLayout: Story = {args: {controlled: true}};
