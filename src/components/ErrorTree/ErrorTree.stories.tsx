import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Text} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';

import type {ErrorTreeItem} from '../../types/errorTree';
import {ErrorTree} from './ErrorTree';

const root: ErrorTreeItem = {
    id: 'root',
    severity: 'error',
    message: 'Missing value for parameter: $h',
    code: 2,
    attributes: {severity: 'Error', queryId: '7d1d'},
    children: [
        {
            id: 'nested-error',
            severity: 'error',
            message: 'Missing value for parameter: $h',
            code: 2,
            position: {row: 1, column: 0},
            attributes: {severity: 'Error'},
            children: [
                {
                    id: 'intermediate-1',
                    severity: 'warning',
                    message: 'Intermediate parser message',
                    children: [
                        {
                            id: 'intermediate-2',
                            severity: 'warning',
                            message: 'Intermediate optimizer message',
                            children: [
                                {
                                    id: 'terminal-error',
                                    severity: 'error',
                                    message:
                                        'At function: RemovePrefixMembers, At function: OrderedSqlProject',
                                    code: 2,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: 'warning',
            severity: 'warning',
            message: 'Query can be optimized further',
            code: 0,
            children: [
                {
                    id: 'info',
                    severity: 'info',
                    message: 'Consider adding a filter before the join',
                    position: {row: 47, column: 6},
                },
            ],
        },
    ],
};

const meta: Meta<typeof ErrorTree> = {
    title: 'Components/ErrorTree',
    component: ErrorTree,
    tags: ['autodocs'],
    parameters: {layout: 'padded'},
    args: {
        root,
        onPositionClick: action('onPositionClick'),
    },
};

export default meta;
type Story = StoryObj<typeof ErrorTree>;

export const Default: Story = {};

export const CustomAttributes: Story = {
    args: {
        renderAttributes: (attributes) => (
            <Text variant="body-2">{String(attributes.severity)}</Text>
        ),
    },
};

export const Narrow: Story = {
    render: (args) => (
        <div style={{width: 420}}>
            <ErrorTree {...args} />
        </div>
    ),
};
