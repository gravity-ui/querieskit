import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ResizeHandle} from './ResizeHandle';

const meta: Meta<typeof ResizeHandle> = {
    title: 'Components/ResizeHandle',
    component: ResizeHandle,
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
type Story = StoryObj<typeof ResizeHandle>;

export const Vertical: Story = {
    args: {
        orientation: 'vertical',
        value: 240,
        min: 160,
        max: 480,
        label: 'Resize sidebar',
        onChange: () => {},
    },
    render: (args) => (
        <div style={{height: 160, display: 'grid', gridTemplateColumns: '1fr 8px 1fr'}}>
            <span>Sidebar</span>
            <ResizeHandle {...args} />
            <span>Content</span>
        </div>
    ),
};
export const Horizontal: Story = {
    args: {
        orientation: 'horizontal',
        value: 240,
        min: 160,
        max: 480,
        label: 'Resize results',
        onChange: () => {},
    },
    render: (args) => (
        <div style={{height: 160, display: 'grid', gridTemplateRows: '1fr 8px 1fr'}}>
            <span>Editor</span>
            <ResizeHandle {...args} />
            <span>Results</span>
        </div>
    ),
};
