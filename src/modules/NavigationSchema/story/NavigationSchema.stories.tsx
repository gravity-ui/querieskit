import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Icon, Label} from '@gravity-ui/uikit';
import LockIcon from '@gravity-ui/icons/svgs/lock.svg';
import {NavigationSchema} from '..';
import type {NavigationSchemaColumn} from '../../../types/navigation';
import {SCHEMA_COLUMNS} from './mockData';

const meta: Meta<typeof NavigationSchema> = {
    title: 'Modules/NavigationSchema',
    component: NavigationSchema,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <div style={{width: 480}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof NavigationSchema>;

export const Default: Story = {
    args: {
        data: {columns: SCHEMA_COLUMNS, loaded: true},
    },
};

export const Loading: Story = {
    args: {
        data: {columns: [], loading: true},
    },
};

export const Empty: Story = {
    args: {
        data: {columns: [], loaded: true},
    },
};

const NothingFoundStory = () => {
    const [search, setSearch] = useState('no-such-field');

    return (
        <NavigationSchema
            data={{columns: SCHEMA_COLUMNS, loaded: true}}
            search={search}
            onSearchUpdate={setSearch}
        />
    );
};

export const NothingFound: Story = {render: () => <NothingFoundStory />};

const ControlledVisibleColumnsStory = () => {
    const [search, setSearch] = useState('');
    const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'type']);

    return (
        <NavigationSchema
            data={{columns: SCHEMA_COLUMNS, loaded: true}}
            search={search}
            onSearchUpdate={setSearch}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
        />
    );
};

export const ControlledVisibleColumns: Story = {
    render: () => <ControlledVisibleColumnsStory />,
};

export const Error: Story = {
    args: {
        data: {columns: [], errorContent: 'Failed to load table schema'},
    },
};

type CustomColumn = NavigationSchemaColumn & {lock?: string};

const CUSTOM_COLUMNS: CustomColumn[] = SCHEMA_COLUMNS.map((column, index) => ({
    ...column,
    lock: index % 2 === 0 ? 'shared' : undefined,
}));

export const CustomColumns: Story = {
    args: {
        data: {columns: CUSTOM_COLUMNS, loaded: true},
        view: {
            extraColumns: [
                {
                    name: 'lock',
                    header: 'Lock',
                    render: ({row}) =>
                        (row as CustomColumn).lock ? (
                            <Label icon={<Icon data={LockIcon} size={12} />}>
                                {(row as CustomColumn).lock}
                            </Label>
                        ) : (
                            '—'
                        ),
                },
            ],
        },
    },
};
