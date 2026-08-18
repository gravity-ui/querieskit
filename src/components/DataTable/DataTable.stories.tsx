import type {Meta, StoryObj} from '@storybook/react';
import {DataTable} from './DataTable';
import type {Column} from './DataTable';

type Row = {
    id: number;
    name: string;
    status: string;
    size: number;
};

const columns: Array<Column<Row>> = [
    {name: 'id', header: 'ID', width: 60},
    {name: 'name', header: 'Name'},
    {name: 'status', header: 'Status'},
    {name: 'size', header: 'Size', align: 'right'},
];

const data: Row[] = [
    {id: 1, name: 'orders.csv', status: 'ready', size: 1024},
    {id: 2, name: 'users.json', status: 'ready', size: 2048},
    {id: 3, name: 'events.parquet', status: 'processing', size: 4096},
];

const meta: Meta<typeof DataTable> = {
    title: 'Components/DataTable',
    component: DataTable,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable<Row>>;

export const Default: Story = {
    args: {
        columns,
        data,
        loaded: true,
    },
};

export const Loading: Story = {
    args: {
        columns,
        data: [],
        loading: true,
    },
};

export const Empty: Story = {
    args: {
        columns,
        data: [],
        loaded: true,
    },
};

export const EmptyNothingFound: Story = {
    args: {
        columns,
        data: [],
        loaded: true,
        emptyVariant: 'nothing-found',
    },
};
