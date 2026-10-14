import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Text} from '@gravity-ui/uikit';
import type {QueryComparisonItem, QueryComparisonProps} from '../../types/queryComparison';
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
    const [draft, setDraft] = useState(props.items);
    return (
        <div style={{height: 800}}>
            <QueryComparison
                {...props}
                items={draft}
                onBlockChange={(id, modified) =>
                    setDraft((current) =>
                        current.map((item) => (item.id === id ? {...item, modified} : item)),
                    )
                }
                header={
                    <>
                        <Text>Baseline → Working copy</Text>
                        <Button onClick={() => setDraft(props.items)}>Reset draft</Button>
                    </>
                }
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
