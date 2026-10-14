import type {QueryGraphEdge, QueryGraphNode} from '../../../types/queryGraph';

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
