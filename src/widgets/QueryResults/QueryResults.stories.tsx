import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowUpRightFromSquare,
    DatabaseArrowRight,
    Gear,
    LayoutColumns,
} from '@gravity-ui/icons';
import {Button, Flex, Icon, Link} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {QueryResults} from './QueryResults';
import type {QueryResultColumn, QueryResultsView} from '../../types/queryResults';

type Row = {
    age: number;
    ip: string;
    last_url: string;
    last_visit_time: number;
    name: unknown;
    region: number;
    user_agent: string;
};

const columns: Array<QueryResultColumn<Row>> = [
    {name: 'age', header: 'age', type: ['DataType', 'Int32'], width: 70},
    {name: 'ip', header: 'ip', type: ['DataType', 'String'], width: 180},
    {name: 'last_url', header: 'last_url', type: ['DataType', 'Utf8'], width: 420},
    {
        name: 'last_visit_time',
        header: 'last_visit_time',
        type: ['DataType', 'Timestamp'],
        width: 160,
    },
    {name: 'name', header: 'name', type: ['OptionalType', ['DataType', 'Utf8']], width: 160},
    {name: 'region', header: 'region', type: ['DataType', 'Uint32'], width: 100},
    {name: 'user_agent', header: 'user_agent', type: ['DataType', 'String'], width: 360},
];

const rows: Row[] = [
    {
        age: 15,
        ip: '95.106.17.32',
        last_url:
            'http://avia-talk.ru/otzyvy-o-aviakompaniyax-rossii/otzyvy-aviakompaniya-s7-sibir/comments2',
        last_visit_time: 1447027200,
        name: ['Anya'],
        region: 213,
        user_agent: 'Mozilla/5.0',
    },
    {
        age: 25,
        ip: '88.78.248.151',
        last_url:
            'http://www.arrivo.ru/statii/sovety/kak-puteshestvovat-s-peresadkami-vazhney-sovety.html',
        last_visit_time: 1447113600,
        name: ['Petr'],
        region: 225,
        user_agent:
            'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.2; Win64; x64; Trident/4.0; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648)',
    },
    {
        age: 17,
        ip: '93.94.183.63',
        last_url: 'http://www.avia77.ru/advices/change%20of%20plane/',
        last_visit_time: 1447160400,
        name: ['Masha'],
        region: 1,
        user_agent: 'Opera/9.80 (Windows NT 5.1) Presto/2.12.388 Version/12.17',
    },
];

const meta: Meta<typeof QueryResults> = {
    title: 'Widgets/QueryResults',
    component: QueryResults,
    tags: ['autodocs'],
    parameters: {layout: 'padded'},
};

export default meta;
type Story = StoryObj<typeof QueryResults<Row>>;

export const Default: Story = {
    args: {
        columns,
        rows,
        totalRows: 6,
        toolbarContent: (
            <Flex gap={2} alignItems="center">
                <Link href="#">markov: `tmp/yql/mbobelyuk/result`</Link>
                <Button view="flat-secondary" size="s" onClick={action('insert')}>
                    <Icon data={DatabaseArrowRight} size={16} />
                    Insert
                </Button>
                <Button view="flat-secondary" size="s" onClick={action('go-to-yt')}>
                    Go to YT
                    <Icon data={ArrowUpRightFromSquare} size={16} />
                </Button>
            </Flex>
        ),
        actions: (
            <Flex gap={1} alignItems="center">
                <Button view="flat-secondary" size="s" onClick={action('export')}>
                    <Icon data={ArrowUpFromLine} size={16} />
                    Export
                </Button>
                <Button view="flat-secondary" size="s" onClick={action('download')}>
                    <Icon data={ArrowDownToLine} size={16} />
                    Download
                </Button>
                <Button
                    view="flat-secondary"
                    size="s"
                    aria-label="Configure columns"
                    onClick={action('configure-columns')}
                >
                    <Icon data={LayoutColumns} size={16} />
                </Button>
                <Button
                    view="flat-secondary"
                    size="s"
                    aria-label="Settings"
                    onClick={action('settings')}
                >
                    <Icon data={Gear} size={16} />
                </Button>
            </Flex>
        ),
    },
};

const ControlledViewStory = () => {
    const [view, setView] = useState<QueryResultsView>('schema');

    return <QueryResults columns={columns} rows={rows} view={view} onViewChange={setView} />;
};

export const ControlledView: Story = {render: () => <ControlledViewStory />};

export const Loading: Story = {args: {columns, rows: [], loading: true}};

export const Error: Story = {
    args: {columns, rows: [], errorContent: 'Failed to load query results'},
};

export const CustomSchema: Story = {
    args: {
        columns,
        rows,
        renderSchema: ({columns: schemaColumns}) => (
            <div>{`The result contains ${schemaColumns.length} columns.`}</div>
        ),
    },
};
