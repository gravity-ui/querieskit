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

/** Change previewLineNumber in Controls to move the preview through the full query. */
export const TargetLine: Story = {
    args: {
        ...Multiline.args,
        query: 'SELECT\n  region,\n  category,\n  SUM(revenue) AS total\nFROM events\nWHERE active = true\nGROUP BY region, category\nORDER BY total DESC;',
        previewLineNumber: 6,
    },
    argTypes: {
        previewLineNumber: {control: {type: 'number', step: 1}},
    },
};
