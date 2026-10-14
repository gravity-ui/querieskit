import React, {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Text, TextInput} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {QueryPage} from '..';
import type {QueryPageComparisonTab, QueryPageQueryTab} from '../../../types/queryPage';
import type {QueryHistoryRow} from '../../../types/history';
import {BASE_ITEMS} from '../../../modules/QueriesHistory/QueriesHistory.stories.data';
import {useQueriesSidebarTabs} from '../../../widgets/QueriesSidebar/QueriesSidebar.stories.data';
import {CLUSTERS, PARAMETERS, QUERY, SETTINGS} from '../../../widgets/QueryEditor/story/demoData';
import {createYtsaurusQueryEngines} from '../../../widgets/QueryEditor/presets/ytsaurus';
import {createQueryEditorPreset} from '../../../helpers/queryEditorPreset';
import {designTabs} from '../../../widgets/QueryExecutionPanel/story/designReference';
import './QueryPage.stories.scss';

const engines = createYtsaurusQueryEngines({
    yql: {versions: ['stable', 'preview']},
    chyt: {cliques: [{alias: 'analytics', state: 'active', health: 'good'}]},
    spyt: {discoveryGroups: [{path: '//sys/spark/clusters/demo', title: 'Demo Spark'}]},
});
const preset = createQueryEditorPreset({
    listPathChildren: ({language, token}) =>
        token.isCancellationRequested
            ? []
            : [
                  {
                      name: 'events',
                      path:
                          language === 'spyt' || language === 'clickhouse'
                              ? 'events'
                              : '//demo/events',
                      kind: 'table',
                  },
              ],
    getTableSchema: ({token}) =>
        token.isCancellationRequested
            ? []
            : [
                  {name: 'region', type: 'String'},
                  {name: 'event_id', type: 'Uint64'},
              ],
    onReferenceClick: action('navigateToTable'),
});

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
    fourEngines?: boolean;
    initialComparison?: boolean;
    initialActiveTab?: string;
};

function Example({
    sidebarHidden = false,
    resultsCollapsed = false,
    resultsExpanded = false,
    controlled = false,
    fourEngines = false,
    initialComparison = false,
    initialActiveTab = '1',
}: ExampleProps) {
    const createDraft = (id: string) => ({
        id,
        value:
            id === '2' ? 'SELECT region, COUNT(*) FROM `//demo/events` GROUP BY region;\n' : QUERY,
        savedValue:
            id === '2' ? 'SELECT region, COUNT(*) FROM `//demo/events` GROUP BY region;\n' : QUERY,
        clusterId: CLUSTERS[id === '2' ? 1 : 0].id,
        engineId: fourEngines ? engines[(Number(id) - 1) % engines.length].id : engines[0].id,
        parameters: PARAMETERS.map((parameter) => ({...parameter})),
        settings: {...SETTINGS, queryName: `Query ${id}`},
        executionPanelHeight: 300,
        collapsed: resultsCollapsed,
        expanded: resultsExpanded,
    });
    const [drafts, setDrafts] = useState(() =>
        (fourEngines ? ['1', '2', '3', '4'] : ['1', '2']).map(createDraft),
    );
    const [activeId, setActiveId] = useState(
        initialComparison ? 'comparison-initial' : initialActiveTab,
    );
    const nextId = useRef(fourEngines ? 5 : 3);
    const [comparisons, setComparisons] = useState<
        {
            id: string;
            original: QueryHistoryRow;
            modified: QueryHistoryRow;
            value: string | null;
            savedValue: string | null;
        }[]
    >(() => {
        if (!initialComparison) return [];
        const rows = BASE_ITEMS.filter((item): item is QueryHistoryRow => 'id' in item);
        return [
            {
                id: 'comparison-initial',
                original: rows[0],
                modified: rows[1],
                value: rows[1].query ?? null,
                savedValue: rows[1].query ?? null,
            },
        ];
    });
    const [historyItems, setHistoryItems] = useState(BASE_ITEMS);
    const historyRows = historyItems.filter((item): item is QueryHistoryRow => 'id' in item);
    const versionId = (row: QueryHistoryRow) => `${typeof row.id}:${row.id}`;
    const comparisonTabs: QueryPageComparisonTab[] = comparisons.map((comparison) => {
        const {id, original, modified, value, savedValue} = comparison;
        const updateComparison = (update: Partial<typeof comparison>) => {
            setComparisons((current) =>
                current.map((tab) => (tab.id === id ? {...tab, ...update} : tab)),
            );
        };
        return {
            id,
            type: 'comparison',
            leftTitle: original.title,
            rightTitle: modified.title,
            comparisonProps: {
                items: [
                    {
                        id: 'query',
                        title: 'Query',
                        language: 'sql',
                        original: original.query ?? null,
                        modified: value,
                    },
                ],
                onBlockChange: (_blockId, nextValue) => updateComparison({value: nextValue}),
                actions: {
                    hasChanges: value !== savedValue,
                    onReset: () => updateComparison({value: savedValue}),
                    onSave: () => {
                        const saved = {...modified, query: value ?? undefined};
                        setHistoryItems((current) =>
                            current.map((row) =>
                                'id' in row && row.id === modified.id ? saved : row,
                            ),
                        );
                        updateComparison({modified: saved, savedValue: value});
                    },
                    onCreateQuery: () => {
                        const queryId = String(nextId.current++);
                        const draft = createDraft(queryId);
                        setDrafts((current) => [
                            ...current,
                            {...draft, value: value ?? '', savedValue: ''},
                        ]);
                        setActiveId(queryId);
                    },
                },
                versionSelection: {
                    originalId: versionId(original),
                    modifiedId: versionId(modified),
                    options: historyRows.map((row) => ({id: versionId(row), title: row.title})),
                    onChange: ({originalId, modifiedId}) => {
                        const left = historyRows.find((row) => versionId(row) === originalId);
                        const right = historyRows.find((row) => versionId(row) === modifiedId);
                        if (left && right) {
                            // Changing only the baseline preserves the working draft.
                            const changedTarget = modifiedId !== versionId(modified);
                            updateComparison({
                                original: left,
                                modified: right,
                                ...(changedTarget
                                    ? {value: right.query ?? null, savedValue: right.query ?? null}
                                    : {}),
                            });
                        }
                    },
                },
            },
        };
    });
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
                        tabs: sidebarTabs.map((tab) =>
                            tab.type === 'history'
                                ? {
                                      ...tab,
                                      props: {
                                          ...tab.props,
                                          items: historyItems.filter(
                                              (item) =>
                                                  !('id' in item) ||
                                                  item.title
                                                      .toLowerCase()
                                                      .includes(
                                                          tab.props.search.value?.toLowerCase() ??
                                                              '',
                                                      ),
                                          ),
                                      },
                                  }
                                : tab,
                        ),
                    }}
                    historyActions={{
                        onRename: (item, title) =>
                            setHistoryItems((current) =>
                                current.map((row) =>
                                    'id' in row && row.id === item.id ? {...row, title} : row,
                                ),
                            ),
                        onDelete: (item) =>
                            setHistoryItems((current) =>
                                current.filter((row) => !('id' in row) || row.id !== item.id),
                            ),
                        onCompare: (original, modified) => {
                            const id = `comparison-${nextId.current++}`;
                            setComparisons((current) => [
                                ...current,
                                {
                                    id,
                                    original,
                                    modified,
                                    value: modified.query ?? null,
                                    savedValue: modified.query ?? null,
                                },
                            ]);
                            setActiveId(id);
                        },
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
                            if (comparisons.some((tab) => tab.id === id)) {
                                setComparisons((current) => current.filter((tab) => tab.id !== id));
                                if (activeId === id) setActiveId(drafts[0].id);
                                return;
                            }
                            if (drafts.length === 1) return;
                            const remaining = drafts.filter((item) => item.id !== id);
                            setDrafts(remaining);
                            if (activeId === id) setActiveId(remaining[0].id);
                        },
                        items: [
                            ...drafts.map(
                                (draft): QueryPageQueryTab<(typeof SETTINGS)['custom']> => ({
                                    id: draft.id,
                                    title: `Query ${draft.id}`,
                                    type: 'query' as const,
                                    status: 'draft' as const,
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
                                        onClusterChange: (clusterId) =>
                                            updateDraft(draft.id, {clusterId}),
                                        engines,
                                        preset,
                                        engineId: draft.engineId,
                                        onEngineChange: (engineId) =>
                                            updateDraft(draft.id, {engineId}),
                                        onRun: () =>
                                            action('run')({
                                                id: draft.id,
                                                value: draft.value,
                                                parameters: draft.parameters,
                                            }),
                                        onFormat: () =>
                                            updateDraft(draft.id, {
                                                value: draft.value.trim() + '\n',
                                            }),
                                        onValidate: () => action('validate')(draft.id),
                                        saveProps: {
                                            onSave: () =>
                                                updateDraft(draft.id, {savedValue: draft.value}),
                                            onSaveAs: () => action('saveAs')(draft.id),
                                        },
                                        parametersProps: {
                                            value: draft.parameters,
                                            onChange: (parameters) =>
                                                updateDraft(draft.id, {parameters}),
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
                                                type: 'custom' as const,
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
                                            if (expandedControlled)
                                                updateDraft(draft.id, {expanded});
                                            action('resultsExpanded')({id: draft.id, expanded});
                                        },
                                    },
                                }),
                            ),
                            ...comparisonTabs,
                        ],
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
export const HistoryComparison: Story = {
    args: {initialComparison: true},
    parameters: {
        docs: {
            description: {
                story: 'Starts with an editable comparison. To open another, use Select for Compare in the history row menu. Rename and Delete update the demo history. Comparison tabs support editing the right-hand draft, reset/save, creating a query from the current draft, version selectors, and split/unified modes.',
            },
        },
    },
};
export const IndependentTabs: Story = {
    args: {initialActiveTab: '2'},
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

export const FourEngines: Story = {args: {fourEngines: true}};
