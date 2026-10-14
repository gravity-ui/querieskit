import React, {useState} from 'react';
import {ArrowDownToLine, ArrowUpFromLine, CircleCheck, Gear} from '@gravity-ui/icons';
import {Button, Flex, Icon, Label} from '@gravity-ui/uikit';
import type {QueryExecutionTab} from '../../../types/queryExecutionPanel';
import type {QueryResultsProps} from '../../../types/queryResults';
import {DashboardCharts} from '../../DashboardCharts';
import type {DashboardChartsProps} from '../../DashboardCharts/types';
import {demoEdges, demoNodes} from '../../../components/QueryGraph/QueryGraph.stories';

const result: QueryResultsProps<Record<string, unknown>> = {
    columns: [
        {name: 'age', type: ['DataType', 'Int32'], width: 56},
        {name: 'ip', type: ['DataType', 'Utf8'], width: 160},
        {name: 'last_time_on_site', type: ['DataType', 'Double'], width: 128},
        {name: 'last_url', type: ['DataType', 'Utf8'], width: 400},
        {name: 'last_visit_time', type: ['DataType', 'Int64'], width: 128},
        {name: 'name', type: ['DataType', 'Utf8'], width: 128},
        {name: 'region', type: ['DataType', 'Int32'], width: 128},
        {name: 'user_agent', type: ['DataType', 'Utf8'], width: 128},
    ],
    rows: ['Anya', 'Petr', 'Masha', 'Alena', 'Irina', 'Anna', 'Ivan'].map((name, index) => ({
        age: String([15, 25, 17, 5, 23, 13, 33][index]),
        ip: ['95.106.17.32', '88.78.248.151', '93.94.183.63'][index % 3],
        last_time_on_site: String([15.5, 5, 10.5, 22.5, 15, 19.5, 15.5][index]),
        last_url:
            index === 6
                ? 'https://maps.yandex.ru/?ll=37.671587%2C55.867321&z=15&text=search&sspn=0.105829%2C0.026809'
                : 'https://yandex.ru/',
        last_visit_time: String(1447027200 - index * 604800),
        name,
        region: String([213, 225, 1, 225, 2, 21, 125][index]),
        user_agent: '',
    })),
    actions: (
        <Flex gap={2}>
            <Button view="flat">
                <Icon data={ArrowUpFromLine} size={16} />
                Export
            </Button>
            <Button view="flat">
                <Icon data={ArrowDownToLine} size={16} />
                Download
            </Button>
            <Button view="flat" aria-label="Settings">
                <Icon data={Gear} size={16} />
            </Button>
        </Flex>
    ),
};

const chartItems: NonNullable<DashboardChartsProps['chartItems']> = [0, 1].map((index) => ({
    id: `chart-${index}`,
    chartData: {
        title: {text: 'Push Process Errors'},
        legend: {enabled: false},
        xAxis: {type: 'datetime'},
        yAxis: [{min: 0}],
        series: {
            data: [
                {
                    type: 'line',
                    seriesId: `errors-${index}`,
                    name: 'Errors',
                    data: [
                        130, 100, 155, 175, 160, 100, 165, 180, 150, 190, 170, 125, 155, 40, 145,
                        155,
                    ].map((y, i) => ({
                        x: Date.UTC(2025, 11, 11, 1) + i * 20 * 60 * 1000,
                        y: y * 1e6,
                    })),
                },
            ],
        },
    },
}));

function ReferenceCharts() {
    const [items, setItems] = useState(chartItems);
    return (
        <DashboardCharts
            dataSource={{
                line: Object.fromEntries(
                    chartItems.map((item) => {
                        const series = item.chartData.series.data[0];
                        return [series.seriesId, series];
                    }),
                ),
            }}
            chartItems={items}
            onItemsChange={setItems}
            defaultLayout={chartItems.map(({id}, i) => ({i: id, x: i * 2, y: 0, w: 2, h: 4}))}
        />
    );
}

export const designTabs: QueryExecutionTab[] = [
    {id: 'result', type: 'result', props: result},
    {id: 'progress', type: 'progress', props: {graphProps: {nodes: demoNodes, edges: demoEdges}}},
    {
        id: 'info',
        type: 'info',
        props: {
            root: {
                id: 'root',
                severity: 'error',
                message: 'Missing value for parameter: $h',
                code: 2,
                attributes: {parameter: '$h'},
                children: [
                    {
                        id: 'child',
                        severity: 'error',
                        message: 'Missing value for parameter: $h',
                        code: 2,
                        attributes: {parameter: '$h'},
                    },
                ],
            },
        },
    },
    {
        id: 'statistics',
        type: 'statistics',
        props: {
            data: [
                {
                    id: 'group-1',
                    name: 'Value',
                    children: [
                        {
                            id: 'group-2',
                            name: 'Value',
                            children: [{id: 'metric', name: 'Value', values: {}}],
                        },
                    ],
                },
                {
                    id: 'group-3',
                    name: 'Value',
                    children: [{id: 'metric-2', name: 'Value', values: {}}],
                },
                {
                    id: 'group-4',
                    name: 'Value',
                    children: [{id: 'metric-3', name: 'Value', values: {}}],
                },
            ],
            defaultExpandedIds: ['group-1', 'group-2'],
        },
    },
    {
        id: 'meta',
        type: 'meta',
        props: {
            data: {
                groups: [
                    {
                        items: [
                            {name: 'ID', value: '0yui78900ghjkl'},
                            {
                                name: 'Status',
                                value: (
                                    <Label
                                        theme="success"
                                        icon={<Icon data={CircleCheck} size={12} />}
                                    >
                                        Completed
                                    </Label>
                                ),
                            },
                            {name: 'Execution mode', value: 'run'},
                            {name: 'Created', value: '27.12.2024 18:56:32'},
                            {name: 'Modified', value: '27.12.2024 18:56:32'},
                            {name: 'Worker ID', value: '89d97cc9-43ba6556-9bb1c687-62567115'},
                            {name: 'Worker PID', value: '587651'},
                            {
                                name: 'Worker host',
                                value: 'yt-query-tracker-production-1.sas.yp-c.yandex.net:9028',
                            },
                            {
                                name: 'Files',
                                value: (
                                    <Button size="s" view="outlined">
                                        View details
                                    </Button>
                                ),
                            },
                        ],
                    },
                ],
            },
        },
    },
    {
        id: 'charts',
        type: 'charts',
        renderContent: () => <ReferenceCharts />,
    },
];
