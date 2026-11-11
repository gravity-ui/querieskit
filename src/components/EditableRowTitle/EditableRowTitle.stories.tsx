import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {EditableRowTitle} from './EditableRowTitle';

const meta: Meta<typeof EditableRowTitle> = {
    title: 'Components/EditableRowTitle',
    component: EditableRowTitle,
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
type Story = StoryObj<typeof EditableRowTitle>;

export const Default: Story = {args: {item: {id: 'query', height: 40, title: 'Revenue by region'}}};
export const Editing: Story = {
    args: {item: {id: 'query', height: 40, title: 'Revenue by region'}, editing: {enabled: true}},
};
export const EmptyTitle: Story = {
    args: {item: {id: 'query', height: 40, title: ''}, editing: {enabled: true}},
};
