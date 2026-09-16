import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import type {QueryGraphEdge, QueryGraphNode} from '../../types/queryGraph';
import {QueryGraph} from './QueryGraph';
import {largeGraphEdges, largeGraphNodes} from './story/largeGraphData';

export const demoNodes: QueryGraphNode[] = [
    {id: 'source', kind: 'input', name: 'orders', label: 'warehouse.orders'},
    {
        id: 'read',
        kind: 'operation',
        name: 'Read',
        operationType: 'read',
        status: 'completed',
        progress: {total: 12, completed: 12},
    },
    {
        id: 'map',
        kind: 'operation',
        name: 'Map',
        operationType: 'map',
        status: 'running',
        progress: {total: 100, completed: 68, running: 8, pending: 24},
        popup: {
            stages: [
                {name: 'Preparing', duration: 1300},
                {name: 'Executing', duration: 8400},
            ],
            details: [
                {name: 'Columns', value: ['id', 'price', 'created_at']},
                {name: 'Settings', children: [{name: 'Workers', value: 8}]},
            ],
            jobs: {total: 100, completed: 68, running: 8, pending: 24},
            inputs: [
                {
                    name: 'orders',
                    columns: [
                        {name: 'id', type: 'Uint64'},
                        {name: 'price', type: 'Double'},
                    ],
                },
            ],
            outputs: [{name: 'mapped', columns: [{name: 'total', type: 'Double'}]}],
        },
    },
    {
        id: 'reduce',
        kind: 'operation',
        name: 'Reduce',
        operationType: 'reduce',
        status: 'waiting',
        progress: {total: 20},
    },
    {id: 'sink', kind: 'output', name: 'result', label: 'warehouse.result'},
];

export const demoEdges: QueryGraphEdge[] = [
    {id: 'source-read', source: 'source', target: 'read'},
    {id: 'read-map', source: 'read', target: 'map'},
    {id: 'map-reduce', source: 'map', target: 'reduce'},
    {id: 'reduce-sink', source: 'reduce', target: 'sink'},
];

const meta: Meta<typeof QueryGraph> = {
    title: 'Components/QueryGraph',
    component: QueryGraph,
    tags: ['autodocs'],
    args: {nodes: demoNodes, edges: demoEdges},
    render: (args) => <QueryGraph {...args} className="query-graph-story" />,
    decorators: [
        (Story) => (
            <div style={{height: 600}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof QueryGraph>;

export const Default: Story = {};

export const Statuses: Story = {
    args: {
        nodes: [
            {id: 'not-started', kind: 'operation', name: 'Map', status: 'not-started'},
            {id: 'waiting', kind: 'operation', name: 'Map', status: 'waiting'},
            {id: 'running', kind: 'operation', name: 'Map', status: 'running'},
            {id: 'completed', kind: 'operation', name: 'Map', status: 'completed'},
            {id: 'failed', kind: 'operation', name: 'Map', status: 'failed'},
            {id: 'aborted', kind: 'operation', name: 'Map', status: 'aborted'},
        ].map((node, index) => ({
            ...node,
            progress: {total: index === 5 ? 23 : 2_684_677},
        })) as QueryGraphNode[],
        edges: [],
        largeGraphThreshold: false,
    },
};

export const OperationTypes: Story = {
    args: {
        nodes: (
            [
                'read',
                'map',
                'reduce',
                'map-reduce',
                'merge',
                'sort',
                'erase',
                'commit',
                'operation',
            ] as const
        ).map((operationType) => ({
            id: operationType,
            kind: 'operation' as const,
            name: operationType,
            label:
                operationType === 'map-reduce'
                    ? 'A very long reusable MapReduce operation label'
                    : operationType,
            operationType,
            status: 'not-started' as const,
        })),
        edges: [
            {id: 'read-map', source: 'read', target: 'map'},
            {id: 'map-reduce', source: 'map', target: 'reduce'},
            {id: 'map-reduce-merge', source: 'map-reduce', target: 'merge'},
            {id: 'merge-sort', source: 'merge', target: 'sort'},
            {id: 'erase-commit', source: 'erase', target: 'commit'},
            {id: 'commit-operation', source: 'commit', target: 'operation'},
        ],
        largeGraphThreshold: false,
    },
};

export const CustomIcon: Story = {
    args: {
        nodes: [
            {
                id: 'custom',
                kind: 'operation',
                name: 'Custom operation',
                status: 'not-started',
                icon: (
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path fill="currentColor" d="M8 1 15 8 8 15 1 8z" />
                    </svg>
                ),
            },
        ],
        edges: [],
        largeGraphThreshold: false,
    },
};

function UpdatingProgressStory(props: React.ComponentProps<typeof QueryGraph>) {
    const [completed, setCompleted] = useState(0);
    useEffect(() => {
        const timer = window.setInterval(() => setCompleted((value) => (value + 5) % 105), 500);
        return () => window.clearInterval(timer);
    }, []);
    return (
        <QueryGraph
            {...props}
            nodes={props.nodes.map((node) =>
                node.id === 'progress'
                    ? {...node, progress: {total: 100, completed, fraction: completed / 100}}
                    : node,
            )}
        />
    );
}

export const UpdatingProgress: Story = {
    args: {
        nodes: [
            {
                id: 'progress',
                kind: 'operation',
                name: 'Map',
                operationType: 'map',
                status: 'running',
                progress: {total: 100, completed: 0},
            },
        ],
        edges: [],
        largeGraphThreshold: false,
    },
    render: (args) => <UpdatingProgressStory {...args} />,
};

export const LargeGraph: Story = {
    args: {
        nodes: largeGraphNodes,
        edges: largeGraphEdges,
        largeGraphThreshold: false,
    },
};

export const LargeGraphThreshold: Story = {
    args: {
        nodes: Array.from({length: 701}, (_, index) => ({
            id: `node-${index}`,
            kind: 'operation' as const,
            name: `Operation ${index}`,
            status: index % 3 ? ('completed' as const) : ('running' as const),
        })),
        edges: Array.from({length: 700}, (_, index) => ({
            id: `edge-${index}`,
            source: `node-${index}`,
            target: `node-${index + 1}`,
        })),
    },
};

export const InvalidGraph: Story = {
    args: {nodes: demoNodes, edges: [{id: 'bad', source: 'source', target: 'missing'}]},
};
