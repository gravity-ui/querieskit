import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {LazyList} from './LazyList';

const meta: Meta<typeof LazyList> = {
    title: 'Components/LazyList',
    component: LazyList,
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{width: 400, height: 320}}>
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj<typeof LazyList>;

const items = [
    {id: 'first', title: 'First query'},
    {id: 'second', title: 'Second query'},
    {id: 'third', title: 'Third query'},
];
export const Default: Story = {
    args: {
        items,
        itemHeight: () => 40,
        renderItem: (item) => <span>{(item as {title: string}).title}</span>,
        selectedItemIndex: 1,
    },
};
export const Empty: Story = {
    args: {...Default.args, items: [], emptyContent: <span>No saved queries</span>},
};
export const Error: Story = {args: {...Default.args, error: <span>Could not load queries</span>}};
