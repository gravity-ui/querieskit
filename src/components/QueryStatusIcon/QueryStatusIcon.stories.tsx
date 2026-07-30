import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueryStatusIcon} from './QueryStatusIcon';

const meta: Meta<typeof QueryStatusIcon> = {
    title: 'Components/QueryStatusIcon',
    component: QueryStatusIcon,
    tags: ['autodocs'],
    argTypes: {
        status: {
            control: 'select',
            options: ['completed', 'failed', 'aborted', 'draft', 'running'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof QueryStatusIcon>;

export const Completed: Story = {
    args: {status: 'completed'},
};

export const Failed: Story = {
    args: {status: 'failed'},
};

export const Aborted: Story = {
    args: {status: 'aborted'},
};

export const Draft: Story = {
    args: {status: 'draft'},
};

export const Running: Story = {
    args: {status: 'running'},
};

export const AllStatuses: Story = {
    render: () => (
        <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
            <QueryStatusIcon status="completed" />
            <QueryStatusIcon status="failed" />
            <QueryStatusIcon status="aborted" />
            <QueryStatusIcon status="draft" />
            <QueryStatusIcon status="running" />
        </div>
    ),
};
