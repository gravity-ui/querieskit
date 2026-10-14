import React, {useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowUpRightFromSquare,
    DatabaseArrowRight,
    Gear,
    LayoutColumns,
} from '@gravity-ui/icons';
import {Button, Dialog, Flex, Icon, Link} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {QueryResults} from './QueryResults';
import type {
    QueryResultCellPreviewContext,
    QueryResultColumn,
    QueryResultsView,
} from '../../types/queryResults';

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
    title: 'Modules/QueryResults',
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

// All parity examples intentionally use the standard cell renderer.
type CellDemoRow = {id: string; value: unknown; loaded?: boolean};
const listColumn: Array<QueryResultColumn<CellDemoRow>> = [
    {name: 'id', type: ['DataType', 'Utf8'], width: 220},
    {name: 'value', type: ['ListType', ['DataType', 'Int32']], width: 500},
];
const ytSettings = {maxVisibleLines: 5, collapseAfterLines: 8, maxInlineTextLength: 10000};
const fullList = Array.from({length: 60}, (_, index) => index);

export const StandardCellTypes: Story = {
    render: () => (
        <QueryResults
            {...ytSettings}
            formatterSettings={{treatValAsData: true, binaryAsHex: true, maxListSize: 50}}
            columns={[
                {name: 'optional', type: ['OptionalType', ['DataType', 'Utf8']]},
                {name: 'binary', type: ['DataType', 'String']},
                {name: 'list', type: ['ListType', ['DataType', 'Int32']]},
                {name: 'url', type: ['TaggedType', 'url', ['DataType', 'Utf8']]},
                {name: 'image', type: ['TaggedType', 'image/png', ['DataType', 'String']]},
            ]}
            rows={[
                {
                    optional: ['Present'],
                    binary: {val: 'AP8=', b64: true},
                    list: [1, 2, 3],
                    url: 'https://ytsaurus.tech/',
                    image: {val: '', inc: true},
                },
                {
                    optional: [],
                    binary: {val: 'Partial string', inc: true},
                    list: 'Malformed list: conversion error stays in this cell',
                    url: 'https://gravity-ui.com/',
                    image: {val: '', inc: true},
                },
            ]}
        />
    ),
};

export const CollapseBoundaries: Story = {
    render: () => (
        <QueryResults
            {...ytSettings}
            columns={listColumn}
            rows={[3, 6, 7].map((length) => ({
                id: `${length + 2} formatted lines`,
                value: Array.from({length}, (_, index) => index),
            }))}
        />
    ),
};

const InlinePreviewStory = () => {
    const [demoRows, setDemoRows] = useState<CellDemoRow[]>([
        {id: 'Load full list', value: fullList},
        {id: 'Fails once; retry', value: fullList},
    ]);
    const attempts = useRef(new Set<string>());
    return (
        <QueryResults
            {...ytSettings}
            columns={listColumn}
            rows={demoRows}
            rowKey={(row) => row.id}
            formatterSettings={{maxListSize: 50, maxStringSize: 1000}}
            getCellOptions={({row, column}) =>
                column.name === 'value' && row.loaded
                    ? {
                          isIncomplete: false,
                          formatterSettings: {maxListSize: undefined, maxStringSize: undefined},
                      }
                    : {}
            }
            onCellPreview={async ({row}) => {
                await new Promise((resolve) => setTimeout(resolve, 800));
                if (row.id === 'Fails once; retry' && !attempts.current.has(row.id)) {
                    attempts.current.add(row.id);
                    throw new globalThis.Error('Demo request failed. Preview again to retry.');
                }
                setDemoRows((current) =>
                    current.map((item) =>
                        item.id === row.id ? {...item, value: [...fullList], loaded: true} : item,
                    ),
                );
            }}
        />
    );
};

export const InlinePreviewAndRetry: Story = {render: () => <InlinePreviewStory />};

const ModalPreviewStory = () => {
    const [preview, setPreview] = useState<QueryResultCellPreviewContext<CellDemoRow>>();
    return (
        <>
            <QueryResults<CellDemoRow>
                {...ytSettings}
                columns={[
                    {name: 'id', type: ['DataType', 'Utf8'], width: 240},
                    {name: 'value', type: ['DataType', 'Utf8'], width: 500},
                ]}
                rows={[
                    {id: 'Large complete value', value: 'x'.repeat(10000)},
                    {id: 'Incomplete tagged value', value: 'Partial payload'},
                ]}
                getCellOptions={({row, column}) =>
                    column.name === 'value' && row.id === 'Incomplete tagged value'
                        ? {isIncomplete: true, tag: 'document'}
                        : {}
                }
                onCellPreview={setPreview}
            />
            <Dialog
                open={Boolean(preview)}
                onClose={() => setPreview(undefined)}
                aria-labelledby="query-results-preview-title"
                contentOverflow="auto"
            >
                <Dialog.Header id="query-results-preview-title" caption="Application preview" />
                <Dialog.Body>
                    <Flex direction="column" gap={3}>
                        <span>
                            {preview?.isIncomplete
                                ? 'The application can fetch the remaining data here.'
                                : 'This value is complete; the inline HTML limit does not truncate it.'}
                        </span>
                        <div style={{overflowWrap: 'anywhere'}}>{String(preview?.value ?? '')}</div>
                    </Flex>
                </Dialog.Body>
            </Dialog>
        </>
    );
};

export const ExternalModalPreview: Story = {render: () => <ModalPreviewStory />};

// Local media fixtures: a 32px PNG and a short silent WAV. No network is needed.
const imageFixture =
    'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGMI6LlDU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULAE1S4Fuc1eAmAAAAAElFTkSuQmCC';
const audioFixture =
    'UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
type MediaDemoRow = {image: string; audio: string};
const InlineMediaPreviewStory = () => {
    const [mediaRows, setMediaRows] = useState<MediaDemoRow[]>([{image: '', audio: ''}]);
    return (
        <QueryResults
            {...ytSettings}
            columns={[
                {
                    name: 'image',
                    type: ['TaggedType', 'image/png', ['DataType', 'String']],
                    width: 300,
                },
                {
                    name: 'audio',
                    type: ['TaggedType', 'audio/wav', ['DataType', 'String']],
                    width: 360,
                },
            ]}
            rows={mediaRows}
            formatterSettings={{maxListSize: 50, maxStringSize: 1000}}
            getCellOptions={({value}) => ({
                isIncomplete: value === '',
                ...(value === ''
                    ? {}
                    : {formatterSettings: {maxListSize: undefined, maxStringSize: undefined}}),
            })}
            onCellPreview={async ({column}) => {
                await new Promise((resolve) => setTimeout(resolve, 800));
                const value = column.name === 'image' ? imageFixture : audioFixture;
                setMediaRows((current) => [{...current[0], [column.name]: value}]);
            }}
        />
    );
};

export const InlineMediaPreview: Story = {render: () => <InlineMediaPreviewStory />};

const schemaAcceptanceColumns: Array<QueryResultColumn<Record<string, unknown>>> = [
    {name: 'name', type: ['OptionalType', ['DataType', 'String']]},
    {name: 'count', type: ['OptionalType', ['DataType', 'Int64']]},
    {name: 'weight', type: ['OptionalType', ['DataType', 'Float']]},
    {
        name: 'details',
        type: [
            'TaggedType',
            'record',
            [
                'OptionalType',
                [
                    'StructType',
                    [
                        [
                            'title',
                            ['TaggedType', 'display', ['OptionalType', ['DataType', 'String']]],
                        ],
                        ['items', ['ListType', ['OptionalType', ['DataType', 'Int64']]]],
                        ['optionalItems', ['OptionalType', ['ListType', ['DataType', 'Int64']]]],
                    ],
                ],
            ],
        ],
    },
];

export const SchemaAcceptance: Story = {
    render: () => <QueryResults columns={schemaAcceptanceColumns} rows={[]} defaultView="schema" />,
};

const schemaFamilyColumns: Array<QueryResultColumn<Record<string, unknown>>> = [
    {name: 'decimal', type: ['DataType', 'Decimal', '10', '2']},
    {
        name: 'modifiers',
        type: [
            'TaggedType',
            'outer',
            [
                'OptionalType',
                ['OptionalType', ['OptionalType', ['TaggedType', 'inner', ['DataType', 'String']]]],
            ],
        ],
    },
    {name: 'stream', type: ['StreamType', ['DataType', 'Int64']]},
    {
        name: 'tuple',
        type: [
            'TupleType',
            [
                ['DataType', 'String'],
                ['DataType', 'Int64'],
            ],
        ],
    },
    {name: 'dict', type: ['DictType', ['DataType', 'String'], ['DataType', 'Int64']]},
    {name: 'set', type: ['DictType', ['DataType', 'String'], ['VoidType']]},
    {
        name: 'variant',
        type: [
            'VariantType',
            [
                'StructType',
                [
                    ['text', ['DataType', 'String']],
                    ['number', ['DataType', 'Int64']],
                ],
            ],
        ],
    },
    {
        name: 'indexedVariant',
        type: [
            'VariantType',
            [
                'TupleType',
                [
                    ['DataType', 'String'],
                    ['DataType', 'Int64'],
                ],
            ],
        ],
    },
    {
        name: 'enum',
        type: [
            'VariantType',
            [
                'StructType',
                [
                    ['yes', ['VoidType']],
                    ['no', ['VoidType']],
                ],
            ],
        ],
    },
    {name: 'indexedEnum', type: ['VariantType', ['TupleType', [['VoidType'], ['VoidType']]]]},
    ...['Void', 'Null', 'EmptyList', 'EmptyDict'].map((name) => ({
        name,
        type: [`${name}Type`] as const,
    })),
    ...['int4', '_int4', 'pgint4', '_pgint4'].map((name) => ({
        name,
        type: ['PgType', name] as const,
    })),
    {
        name: 'fieldNames',
        type: [
            'StructType',
            [
                ['DataType', ['DataType', 'String']],
                ['OptionalType', ['DataType', 'Int64']],
            ],
        ],
    },
    {name: 'unknownType', type: ['FutureType', '<safe text>']},
    {
        name: 'damagedChild',
        type: [
            'StructType',
            [
                ['broken', ['OptionalType']],
                ['healthy', ['DataType', 'String']],
            ],
        ],
    },
    {
        name: 'neutralType',
        type: ['DataType', 'String'],
        schemaType: {
            name: 'Vector',
            parameters: [3, true, null],
            tags: ['spatial'],
            children: [{label: 'coordinates', type: {name: 'Real', optionalDepth: 1}}],
        },
    },
];

export const SchemaTypeFamilies: Story = {
    render: () => <QueryResults columns={schemaFamilyColumns} rows={[]} defaultView="schema" />,
};

const deepSchemaColumns: Array<QueryResultColumn<Record<string, unknown>>> = [
    {
        name: 'a_very_long_column_name_that_should_be_truncated_and_available_in_a_title',
        type: [
            'StructType',
            [
                [
                    'events',
                    [
                        'ListType',
                        ['StructType', [['payload', ['ListType', ['DataType', 'String']]]]],
                    ],
                ],
            ],
        ],
    },
    ...schemaAcceptanceColumns,
    ...schemaFamilyColumns,
];

export const SchemaResizeAndScroll: Story = {
    render: () => (
        <div style={{width: 480, maxWidth: '100%', height: 400, resize: 'both', overflow: 'auto'}}>
            <QueryResults
                columns={deepSchemaColumns}
                rows={[]}
                defaultView="schema"
                toolbarContent="Drag the bottom-right corner; expand nested types and scroll."
            />
        </div>
    ),
};

const SchemaUpdatesStory = () => {
    const [revision, setRevision] = useState(0);
    const [replacement, setReplacement] = useState(false);
    const updatedColumns = deepSchemaColumns.map((column, index) => ({
        ...column,
        type:
            index === 0 && replacement
                ? (['ListType', ['DataType', 'Float']] as const)
                : column.type,
    }));
    return (
        <QueryResults
            columns={updatedColumns}
            rows={[]}
            defaultView="schema"
            actions={
                <Flex gap={2}>
                    <Button onClick={() => setRevision(revision + 1)}>Rerender ({revision})</Button>
                    <Button onClick={() => setReplacement(!replacement)}>
                        Replace first schema
                    </Button>
                </Flex>
            }
        />
    );
};

export const SchemaUpdates: Story = {render: () => <SchemaUpdatesStory />};

export const SchemaWithoutTableDecorations: Story = {
    render: () => (
        <QueryResults
            columns={schemaAcceptanceColumns}
            rows={[]}
            defaultView="schema"
            displayIndices={false}
            stripedRows={false}
            stickyHead={false}
        />
    ),
};
