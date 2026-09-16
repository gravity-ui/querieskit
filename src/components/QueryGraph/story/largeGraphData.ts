import type {QueryGraphEdge, QueryGraphNode, QueryGraphNodeStatus} from '../../../types/queryGraph';

type OperationOptions = {
    id: string;
    name: string;
    label?: string;
    inputs?: number;
    outputs?: number;
    status?: QueryGraphNodeStatus;
    total?: number;
    completed?: number;
    running?: number;
};

function operation({
    id,
    name,
    label,
    inputs = 1,
    outputs = 1,
    status = 'completed',
    total = 100,
    completed = total,
    running,
}: OperationOptions): QueryGraphNode {
    const pending = Math.max(0, total - completed - (running ?? 0));

    return {
        id,
        kind: 'operation',
        name,
        label,
        status,
        progress: {total, completed, running, pending},
        popup: {
            details: [
                {name: 'Operation ID', value: id},
                {name: 'Inputs', value: inputs},
                {name: 'Outputs', value: outputs},
            ],
            jobs: {total, completed, running, pending},
        },
    };
}

// The topology is adapted from a processed production graph. Product-specific names and
// backend fields are intentionally normalized to the public QueryGraph contract.
export const largeGraphNodes: QueryGraphNode[] = [
    {
        id: '25',
        kind: 'input',
        name: 'date_dim',
        label: 'tpcds/3TB/date_dim',
        popup: {details: [{name: 'Path', value: 'tpcds/3TB/date_dim'}]},
    },
    {
        id: '26',
        kind: 'input',
        name: 'web_sales',
        label: 'tpcds/3TB/web_sales',
        popup: {details: [{name: 'Path', value: 'tpcds/3TB/web_sales'}]},
    },
    {
        id: '27',
        kind: 'input',
        name: 'customer_address',
        label: 'tpcds/3TB/customer_address',
        popup: {details: [{name: 'Path', value: 'tpcds/3TB/customer_address'}]},
    },
    {
        id: '153',
        kind: 'input',
        name: 'store_sales',
        label: 'tpcds/3TB/store_sales',
        popup: {details: [{name: 'Path', value: 'tpcds/3TB/store_sales'}]},
    },
    operation({id: '21', name: 'Sort', total: 48}),
    operation({id: '41', name: 'Reduce', label: '2 inputs', inputs: 2, total: 96}),
    operation({id: '50', name: 'MapReduce', label: '2 inputs', inputs: 2, total: 180}),
    operation({id: '67', name: 'MapReduce', label: '3 outputs', outputs: 3, total: 240}),
    operation({id: '92', name: 'Merge', total: 72}),
    operation({id: '96', name: 'Merge', total: 84}),
    operation({id: '100', name: 'Merge', total: 64}),
    operation({id: '38', name: 'Reduce', label: '2 inputs', inputs: 2, total: 112}),
    operation({id: '59', name: 'MapReduce', label: '2 inputs', inputs: 2, total: 196}),
    operation({id: '75', name: 'MapReduce', label: '3 outputs', outputs: 3, total: 256}),
    operation({id: '105', name: 'Merge', total: 80}),
    operation({id: '109', name: 'Merge', total: 88}),
    operation({id: '140', name: 'Map', total: 144}),
    operation({
        id: '171',
        name: 'Map',
        status: 'running',
        total: 128,
        completed: 72,
        running: 16,
    }),
    operation({id: '179', name: 'Map', status: 'waiting', total: 96, completed: 0}),
    operation({id: '186', name: 'Map', status: 'not-started', total: 80, completed: 0}),
    operation({id: '192', name: 'Map', status: 'not-started', total: 64, completed: 0}),
    operation({id: '197', name: 'Sort', status: 'not-started', total: 48, completed: 0}),
    operation({id: '200', name: 'Fetch result', status: 'not-started', total: 1, completed: 0}),
    operation({id: '198', name: 'Commit result', status: 'not-started', total: 1, completed: 0}),
];

const topology = [
    ['25', '21'],
    ['26', '41'],
    ['21', '41'],
    ['27', '50'],
    ['41', '50'],
    ['50', '67'],
    ['67', '92'],
    ['67', '96'],
    ['67', '100'],
    ['153', '38'],
    ['21', '38'],
    ['27', '59'],
    ['38', '59'],
    ['59', '75'],
    ['75', '105'],
    ['75', '109'],
    ['75', '140'],
    ['109', '140'],
    ['75', '171'],
    ['105', '171'],
    ['140', '171'],
    ['67', '179'],
    ['100', '179'],
    ['171', '179'],
    ['67', '186'],
    ['96', '186'],
    ['179', '186'],
    ['67', '192'],
    ['92', '192'],
    ['186', '192'],
    ['192', '197'],
    ['197', '200'],
    ['200', '198'],
] as const;

export const largeGraphEdges: QueryGraphEdge[] = topology.map(([source, target]) => ({
    id: `${source}-${target}`,
    source,
    target,
}));
