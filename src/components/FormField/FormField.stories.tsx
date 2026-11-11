import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TextInput} from '@gravity-ui/uikit';
import {FormField} from './FormField';

const meta: Meta<typeof FormField> = {
    title: 'Components/FormField',
    component: FormField,
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
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
    args: {label: 'Query name', children: <TextInput value="Revenue by region" readOnly />},
};
export const Disabled: Story = {
    args: {
        label: 'Unavailable query name',
        children: <TextInput value="Revenue by region" disabled />,
    },
};
