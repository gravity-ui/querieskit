import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';
import {Text} from '@gravity-ui/uikit';

import {QueriesHistory, Props as QueriesHistoryProps} from './QueriesHistory';

const Wrap = (props: QueriesHistoryProps) => (
    <div style={{width: '200px'}}>
        <QueriesHistory {...props} />
    </div>
);

const meta: Meta<typeof QueriesHistory> = {
    title: 'Components/QueriesHistory',
    component: Wrap,
};

export default meta;

type Story = StoryObj<typeof QueriesHistory>;

const onDelete = fn().mockName('onDelete');
const onRename = fn().mockName('onRename');
const onEditingCancel = fn().mockName('editing.onCancel');
const onEditingSubmit = fn().mockName('editing.onSubmit');
const onSelectionChange = fn().mockName('selection.onChange');
const onSearchChange = fn().mockName('search.onChange');

export const Default: Story = {
    args: {
        items: [
            {header: '7 october 2025', height: 34},
            {
                id: 1,
                title: 'Query 1',
                engine: 'SQL',
                status: 'running',
                startTime: '2026-07-06T11:22:45.977564Z',
                href: 'https://gravity-ui.com/ru',
                height: 52,
            },
            {
                id: 2,
                title: 'This is my favorite query',
                engine: 'YQL',
                status: 'completed',
                startTime: '2026-07-01T11:10:52.792107Z',
                endTime: '2026-07-01T11:10:58.846245Z',
                height: 52,
            },
            {
                id: 3,
                title: 'Very long query name. Very long query name. Very long query name',
                engine: 'YT QL',
                status: 'draft',
                startTime: '2026-07-01T11:09:49.293567Z',
                height: 52,
            },
            {header: '8 october 2025', height: 34},
            {
                id: 4,
                title: 'Query 4',
                engine: 'CHYT',
                status: 'aborted',
                startTime: '2026-07-01T11:08:07.155039Z',
                endTime: '2026-07-01T11:08:12.190339Z',
                height: 52,
            },
            {
                id: 5,
                title: 'Query 5',
                engine: 'SQL',
                status: 'failed',
                startTime: '2026-07-01T09:09:33.300767Z',
                endTime: '2026-07-01T09:09:59.929879Z',
                height: 52,
            },
            {
                id: 6,
                title: 'Query 6',
                engine: 'SQL',
                status: 'failed',
                startTime: '2026-07-01T09:09:33.300767Z',
                endTime: '2026-07-01T09:09:59.929879Z',
                height: 52,
            },
        ],
        search: {
            value: '',
            onUpdate: onSearchChange,
        },
        getRowActions: (item) => {
            if (item.id === 1)
                return [
                    {
                        text: 'Rename',
                        onClick: onRename,
                    },
                ];

            return [
                {
                    text: <Text color="danger">Delete</Text>,
                    onClick: onDelete,
                },
            ];
        },
    },
};

export const WithEditing: Story = {
    args: {
        ...Default.args,
        editing: {
            rowId: 6,
            onCancel: onEditingCancel,
            onSubmit: onEditingSubmit,
        },
    },
};

export const WithSelection: Story = {
    args: {
        ...Default.args,
        selection: {
            enabled: true,
            selectedRowIds: [2],
            onChange: onSelectionChange,
        },
    },
};
