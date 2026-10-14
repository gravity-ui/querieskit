import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import type {
    QueryComparisonItem,
    QueryComparisonProps,
    QueryComparisonVersionPair,
} from '../../types/queryComparison';
import {QueryComparison} from './QueryComparison';

const items: QueryComparisonItem[] = [
    {
        id: 'configuration',
        title: 'Configuration',
        language: 'json',
        original: '{\n  "environment": "production",\n  "timeout_ms": 30000\n}',
        modified: '{\n  "environment": "staging",\n  "timeout_ms": 60000\n}',
    },
    {
        id: 'query',
        title: 'query.sql',
        language: 'yql',
        original:
            'SELECT\n    user_id,\n    COUNT(*) AS orders\nFROM orders\nGROUP BY user_id\nLIMIT 100;',
        modified:
            'SELECT\n    user_id,\n    SUM(amount) AS revenue\nFROM orders\nWHERE status = "paid"\nGROUP BY user_id\nLIMIT 500;',
    },
    {id: 'added', title: 'new.sql', language: 'yql', original: null, modified: 'SELECT 42;'},
    {id: 'removed', title: 'old.sql', language: 'yql', original: 'SELECT 1;', modified: null},
];

function Example(props: QueryComparisonProps) {
    const [versions, setVersions] = useState(() => [
        {
            id: 'baseline',
            title: 'Query · version 1',
            values: props.items.map((item) => item.original),
        },
        {
            id: 'working',
            title: 'Query · version 2',
            values: props.items.map((item) => item.modified),
        },
        {
            id: 'latest',
            title: 'Query · version 3',
            values: props.items.map((item) =>
                item.language === 'yql' && item.modified !== null
                    ? `${item.modified}\n-- Latest version`
                    : item.modified,
            ),
        },
    ]);
    const [selection, setSelection] = useState<QueryComparisonVersionPair>({
        originalId: 'baseline',
        modifiedId: 'working',
    });
    const [draft, setDraft] = useState(() => props.items.map((item) => item.modified));
    const getVersion = (id: string) => {
        const version = versions.find((candidate) => candidate.id === id);
        if (!version) throw new Error(`Missing version ${id}`);
        return version;
    };
    const original = getVersion(selection.originalId);
    const modified = getVersion(selection.modifiedId);
    const selectVersions = (next: QueryComparisonVersionPair) => {
        setSelection(next);
        setDraft(getVersion(next.modifiedId).values);
    };
    const hasChanges = draft.some((value, index) => value !== modified.values[index]);
    return (
        <div style={{height: 800}}>
            <QueryComparison
                {...props}
                items={props.items.map((item, index) => ({
                    ...item,
                    original: original.values[index],
                    modified: draft[index],
                }))}
                onBlockChange={(id, value) =>
                    setDraft((current) =>
                        current.map((text, index) => (props.items[index].id === id ? value : text)),
                    )
                }
                versionSelection={{options: versions, ...selection, onChange: selectVersions}}
                actions={{
                    hasChanges,
                    disabled: props.readOnly,
                    onReset: () => setDraft(modified.values),
                    onSave: () =>
                        setVersions((current) =>
                            current.map((version) =>
                                version.id === selection.modifiedId
                                    ? {...version, values: [...draft]}
                                    : version,
                            ),
                        ),
                    onCreateQuery: () => {
                        const id = `created-${versions.length}`;
                        setVersions((current) => [
                            ...current,
                            {id, title: `New query ${versions.length - 2}`, values: [...draft]},
                        ]);
                        setSelection((current) => ({...current, modifiedId: id}));
                    },
                }}
            />
        </div>
    );
}

const meta: Meta<typeof QueryComparison> = {
    title: 'Modules/QueryComparison',
    component: QueryComparison,
    parameters: {layout: 'fullscreen'},
    args: {items},
    render: (args) => <Example {...args} />,
};
export default meta;
type Story = StoryObj<typeof QueryComparison>;

export const Default: Story = {};
export const Unified: Story = {args: {defaultMode: 'unified'}};
export const ReadOnly: Story = {args: {readOnly: true}};
export const QueryOnly: Story = {args: {items: [items[1]]}};
export const Empty: Story = {args: {items: []}};
export const IdenticalAndEmpty: Story = {
    args: {
        items: [
            {
                id: 'same',
                title: 'Identical',
                original: 'SELECT 1;',
                modified: 'SELECT 1;',
                language: 'yql',
            },
            {id: 'empty', title: 'Empty file', original: '', modified: ''},
        ],
    },
};
export const LongContent: Story = {
    args: {
        items: [
            {
                id: 'long',
                title: 'Long query',
                language: 'yql',
                original: Array.from({length: 300}, (_, index) => `SELECT ${index};`).join('\n'),
                modified: Array.from({length: 300}, (_, index) => `SELECT ${index * 2};`).join(
                    '\n',
                ),
            },
        ],
    },
};
