import React, {useState} from 'react';
import type {Meta as StoryMeta, StoryObj} from '@storybook/react';
import {Button, Flex, Text, TextInput} from '@gravity-ui/uikit';
import {QueryExecutionPanel} from '../QueryExecutionPanel';
import type {QueryExecutionTab} from '../../../types/queryExecutionPanel';
import type {ErrorTreeSeverity} from '../../../types/errorTree';
import {DashboardCharts} from '../../DashboardCharts';
import {lineSeriesMap} from '../../DashboardCharts/story/mockData';
import {demoEdges, demoNodes} from '../../../components/QueryGraph/QueryGraph.stories';
import {createQueryTrackerPanel} from './queryTrackerAdapter';
import type {ExampleQuery} from './queryTrackerAdapter';
import {designTabs} from './designReference';
import './QueryExecutionPanel.stories.scss';

const results = {
    columns: [{name: 'name', type: ['DataType', 'Utf8'] as const}],
    rows: [{name: 'Query result'}],
};
const progress = {graphProps: {nodes: demoNodes, edges: demoEdges}};
const metaProps = {data: {groups: [{items: [{name: 'Engine', value: 'YQL'}]}]}};
function Notes({active}: {active: boolean}) {
    const [value, setValue] = useState('');
    return (
        <Flex direction="column" gap={2}>
            <TextInput value={value} onUpdate={setValue} placeholder="Notes survive tab switches" />
            <Text>Active: {String(active)}</Text>
        </Flex>
    );
}
const allTabs: QueryExecutionTab[] = [
    {id: 'result/0', type: 'result', title: 'Result 1', props: results},
    {
        id: 'result/1',
        type: 'result',
        title: 'Result 2',
        props: {...results, rows: [{name: 'Another result'}]},
    },
    {id: 'progress', type: 'progress', props: progress},
    {
        id: 'info',
        type: 'info',
        props: {root: {id: 'root', severity: 'info', message: 'Query completed'}},
    },
    {
        id: 'statistics',
        type: 'statistics',
        props: {data: [{id: 'rows', name: 'Rows', values: {count: 2}}]},
    },
    {id: 'meta', type: 'meta', props: metaProps},
    {
        id: 'charts',
        type: 'charts',
        renderContent: () => <DashboardCharts dataSource={{line: lineSeriesMap}} />,
    },
    {
        id: 'notes',
        type: 'custom',
        title: 'Notes',
        renderContent: ({active}) => <Notes active={active} />,
    },
];
const meta: StoryMeta<typeof QueryExecutionPanel> = {
    title: 'Widgets/QueryExecutionPanel',
    component: QueryExecutionPanel,
    tags: ['autodocs'],
    args: {tabs: designTabs, execution: {startedAt: '11 Dec 2025, 12:07:27', author: 'admin'}},
    decorators: [
        (Story) => (
            <div className="qp-query-execution-panel-story">
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof QueryExecutionPanel>;
export const Default: Story = {};
export const Collapsed: Story = {args: {defaultCollapsed: true}};
export const Statistics: Story = {args: {defaultActiveTab: 'statistics'}};
export const Meta: Story = {args: {defaultActiveTab: 'meta'}};
export const Info: Story = {args: {defaultActiveTab: 'info'}};
export const Progress: Story = {args: {defaultActiveTab: 'progress'}};
export const Charts: Story = {args: {defaultActiveTab: 'charts'}};
export const Narrow: Story = {
    decorators: [
        (Story) => (
            <div style={{width: 360, maxWidth: '100%', height: '100%'}}>
                <Story />
            </div>
        ),
    ],
};
export const Empty: Story = {args: {tabs: []}};
export const EmptyInfo: Story = {args: {tabs: [{id: 'info', type: 'info'}]}};
export const Loading: Story = {args: {loading: true}};
export const LoadingError: Story = {
    render: function LoadingErrorExample(args) {
        const [error, setError] = useState(true);
        return <QueryExecutionPanel {...args} error={error} onRetry={() => setError(false)} />;
    },
};
export const DesignReference: Story = {
    decorators: [
        (Story) => (
            <div className="qp-query-execution-panel-story__reference">
                <Story />
            </div>
        ),
    ],
    render: function DesignReferenceExample(args) {
        const [expanded, setExpanded] = useState(false);
        return (
            <div
                className={`qp-query-execution-panel-story__layout${expanded ? ' qp-query-execution-panel-story__layout_expanded' : ''}`}
            >
                <QueryExecutionPanel {...args} expanded={expanded} onExpandedChange={setExpanded} />
            </div>
        );
    },
};
export const CustomOrder: Story = {args: {tabs: [allTabs[7], allTabs[1], allTabs[0], allTabs[5]]}};

export const DynamicMessages: Story = {
    render: function DynamicMessagesExample() {
        const [severity, setSeverity] = useState<ErrorTreeSeverity>('info');
        return (
            <Flex direction="column" gap={3} height="100%">
                <Flex gap={2}>
                    {(['info', 'warning', 'error'] as const).map((level) => (
                        <Button key={level} onClick={() => setSeverity(level)}>
                            {level}
                        </Button>
                    ))}
                </Flex>
                <QueryExecutionPanel
                    tabs={[
                        {
                            id: 'messages',
                            type: 'info',
                            props: {
                                root: {
                                    id: 'root',
                                    severity: 'info',
                                    message: 'Execution messages',
                                    children: [{id: 'child', severity, message: 'Updated message'}],
                                },
                            },
                        },
                    ]}
                />
            </Flex>
        );
    },
};
export const Controlled: Story = {
    args: {tabs: allTabs},
    render: function ControlledExample(args) {
        const [activeTab, setActiveTab] = useState('result/0');
        return (
            <Flex direction="column" gap={3} height="100%">
                <Text>Selected: {activeTab}</Text>
                <QueryExecutionPanel
                    {...args}
                    activeTab={activeTab}
                    onActiveTabChange={setActiveTab}
                />
            </Flex>
        );
    },
};
export const QueryTrackerLifecycle: Story = {
    render: function QueryTrackerLifecycleExample() {
        const [status, setStatus] = useState<ExampleQuery['status']>('RUNNING');
        const [executionId, setExecutionId] = useState(1);
        const query: ExampleQuery = {
            id: String(executionId),
            status,
            results: [results, results],
            progress,
            meta: metaProps,
            error: {root: {id: 'error', severity: 'error', message: 'Execution failed'}},
            statistics: {data: [{id: 'rows', name: 'Rows', values: {count: 2}}]},
            charts: [{dataSource: {line: lineSeriesMap}}],
        };
        return (
            <Flex direction="column" gap={3} height="100%">
                <Text>
                    Open Meta manually, then complete the query: your selection is preserved.
                </Text>
                <Flex gap={2} wrap>
                    <Button onClick={() => setStatus('COMPLETED')}>Complete</Button>
                    <Button onClick={() => setStatus('FAILED')}>Fail</Button>
                    <Button
                        onClick={() => {
                            setStatus('RUNNING');
                            setExecutionId(executionId + 1);
                        }}
                    >
                        New execution
                    </Button>
                </Flex>
                <QueryExecutionPanel key={query.id} {...createQueryTrackerPanel(query)} />
            </Flex>
        );
    },
};
export const ApplicationLayout: Story = {
    args: {tabs: allTabs},
    render: function ApplicationLayoutExample(args) {
        const [expanded, setExpanded] = useState(false);
        return (
            <div
                className={`qp-query-execution-panel-story__layout${expanded ? ' qp-query-execution-panel-story__layout_expanded' : ''}`}
            >
                <QueryExecutionPanel {...args} expanded={expanded} onExpandedChange={setExpanded} />
            </div>
        );
    },
};
