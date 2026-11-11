import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {FieldsSearchToolbar} from './FieldsSearchToolbar';

const meta: Meta<typeof FieldsSearchToolbar> = {
    title: 'Components/FieldsSearchToolbar',
    component: FieldsSearchToolbar,
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
type Story = StoryObj<typeof FieldsSearchToolbar>;

export const Default: Story = {
    args: {
        search: '',
        searchPlaceholder: 'Search columns',
        fields: [
            {id: 'name', title: 'Name'},
            {id: 'type', title: 'Type'},
        ],
        visibleFields: ['name'],
        onVisibleFieldsChange: () => {},
    },
};
export const SearchOnly: Story = {
    args: {...Default.args, search: 'customer', hideFieldsSelector: true},
};
