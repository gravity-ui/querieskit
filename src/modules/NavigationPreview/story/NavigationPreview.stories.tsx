import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Icon, Label} from '@gravity-ui/uikit';
import LockIcon from '@gravity-ui/icons/svgs/lock.svg';
import {NavigationPreview} from '..';
import type {NavigationPreviewColumn, NavigationPreviewRow} from '../../../types/navigation';
import {PREVIEW_COLUMNS, PREVIEW_ROWS} from './mockData';

const meta: Meta<typeof NavigationPreview> = {
    title: 'Modules/NavigationPreview',
    component: NavigationPreview,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <div style={{width: 560}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof NavigationPreview>;

export const Default: Story = {
    args: {
        data: {columns: PREVIEW_COLUMNS, rows: PREVIEW_ROWS, loaded: true},
    },
};

const ControlledStory = () => {
    const [search, setSearch] = useState('');
    const [visibleColumns, setVisibleColumns] = useState<string[]>(['id', 'title', 'status']);

    return (
        <NavigationPreview
            data={{columns: PREVIEW_COLUMNS, rows: PREVIEW_ROWS, loaded: true}}
            search={search}
            onSearchUpdate={setSearch}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
        />
    );
};

export const ControlledSearchAndColumns: Story = {
    render: () => <ControlledStory />,
};

export const Loading: Story = {
    args: {
        data: {columns: [], rows: [], loading: true},
    },
};

export const Empty: Story = {
    args: {
        data: {columns: PREVIEW_COLUMNS, rows: [], loaded: true},
    },
};

export const Error: Story = {
    args: {
        data: {columns: [], rows: [], errorContent: 'Failed to load table preview'},
    },
};

const TYPED_COLUMNS: Array<NavigationPreviewColumn<NavigationPreviewRow>> = [
    {name: 'id', type: ['DataType', 'Uint64']},
    {name: 'tags', type: ['ListType', ['DataType', 'Utf8']]},
    {
        name: 'details',
        type: [
            'StructType',
            [
                ['name', ['DataType', 'Utf8']],
                ['score', ['DataType', 'Double']],
            ],
        ],
    },
];

const TYPED_ROWS: NavigationPreviewRow[] = [
    {id: 1, tags: ['primary', 'preview'], details: ['Result', 42.5]},
];

export const TypedValues: Story = {
    args: {
        data: {columns: TYPED_COLUMNS, rows: TYPED_ROWS, loaded: true},
    },
};

type CustomRow = NavigationPreviewRow & {lock?: string};

const CUSTOM_ROWS: CustomRow[] = PREVIEW_ROWS.map((row, index) => ({
    ...row,
    lock: index % 2 === 0 ? 'shared' : undefined,
}));

export const CustomColumns: Story = {
    args: {
        data: {columns: PREVIEW_COLUMNS, rows: CUSTOM_ROWS, loaded: true},
        view: {
            extraColumns: [
                {
                    name: 'lock',
                    header: 'Lock',
                    render: ({row}) =>
                        (row as CustomRow).lock ? (
                            <Label icon={<Icon data={LockIcon} size={12} />}>
                                {(row as CustomRow).lock}
                            </Label>
                        ) : (
                            '—'
                        ),
                },
            ],
        },
    },
};
