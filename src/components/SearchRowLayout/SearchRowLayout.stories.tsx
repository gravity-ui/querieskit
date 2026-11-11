import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {SearchRowLayout} from './SearchRowLayout';

const meta: Meta<typeof SearchRowLayout> = {
    title: 'Components/SearchRowLayout',
    component: SearchRowLayout,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 400}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof SearchRowLayout>;

export const Default: Story = {
    args: {
        header: 'Revenue query',
        query: 'SELECT revenue FROM events;',
        language: 'sql',
        href: '#query',
    },
};
export const Multiline: Story = {
    args: {
        header: 'Grouped revenue',
        query: 'SELECT region,\n  SUM(revenue) AS total\nFROM events\nGROUP BY region\nORDER BY total DESC;',
        language: 'sql',
        href: '#query',
    },
};
