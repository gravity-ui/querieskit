import React, {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Icon, Label} from '@gravity-ui/uikit';
import LockIcon from '@gravity-ui/icons/svgs/lock.svg';
import {NavigationPreview} from '..';
import type {NavigationPreviewRow} from '../../../types/navigation';
import type {QueryResultColumn} from '../../../types/queryResults';
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

const TYPED_COLUMNS: Array<QueryResultColumn<NavigationPreviewRow>> = [
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

const CUSTOM_COLUMNS: Array<QueryResultColumn<CustomRow>> = [
    ...PREVIEW_COLUMNS,
    {
        name: 'lock',
        type: ['OptionalType', ['DataType', 'Utf8']],
        header: 'Lock',
        render: ({row}) =>
            row.lock ? <Label icon={<Icon data={LockIcon} size={12} />}>{row.lock}</Label> : '—',
    },
];

export const CustomColumns: Story = {
    render: () => (
        <NavigationPreview<CustomRow>
            data={{columns: CUSTOM_COLUMNS, rows: CUSTOM_ROWS, loaded: true}}
        />
    ),
};

type PreviewRow = {id: string; value: unknown; loaded?: boolean};
const PREVIEW_VALUE_COLUMNS: Array<QueryResultColumn<PreviewRow>> = [
    {name: 'id', type: ['DataType', 'Utf8']},
    {name: 'value', type: ['ListType', ['DataType', 'Int32']]},
];
const FULL_VALUE = Array.from({length: 12}, (_, index) => index);

const InlinePreviewStory = () => {
    const [rows, setRows] = useState<PreviewRow[]>([
        {id: 'Load full list', value: {val: [0, 1, 2], inc: true}},
        {id: 'Fails once; retry', value: {val: [0, 1, 2], inc: true}},
        {id: 'Expand locally', value: FULL_VALUE},
    ]);
    const attempts = useRef(new Set<string>());

    return (
        <NavigationPreview<PreviewRow>
            data={{columns: PREVIEW_VALUE_COLUMNS, rows, loaded: true}}
            view={{
                rowKey: (row) => row.id,
                displayIndices: true,
                stripedRows: true,
                formatterSettings: {treatValAsData: true, maxListSize: 5},
                maxVisibleLines: 3,
                collapseAfterLines: 5,
                getCellOptions: ({row, column}) =>
                    column.name === 'value' && (row.loaded || row.id === 'Expand locally')
                        ? {
                              isIncomplete: false,
                              formatterSettings: {maxListSize: undefined},
                          }
                        : {},
                onCellPreview: async ({row}) => {
                    await new Promise((resolve) => setTimeout(resolve, 800));
                    if (row.id === 'Fails once; retry' && !attempts.current.has(row.id)) {
                        attempts.current.add(row.id);
                        throw new globalThis.Error('Demo request failed. Preview again to retry.');
                    }
                    setRows((current) =>
                        current.map((item) =>
                            item.id === row.id
                                ? {...item, value: [...FULL_VALUE], loaded: true}
                                : item,
                        ),
                    );
                },
            }}
        />
    );
};

export const InlinePreviewAndRetry: Story = {render: () => <InlinePreviewStory />};
