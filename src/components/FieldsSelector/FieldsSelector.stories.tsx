import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';
import {FieldsSelector} from './FieldsSelector';

const meta: Meta<typeof FieldsSelector> = {
    title: 'Components/FieldsSelector',
    component: FieldsSelector,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    argTypes: {
        onChange: {action: true},
    },
};

export default meta;
type Story = StoryObj<typeof FieldsSelector>;

const fields = [
    {id: 'id', title: 'Id'},
    {id: 'title', title: 'Title'},
    {id: 'author', title: 'Author'},
    {id: 'status', title: 'Status'},
    {id: 'createdAt', title: 'Created at'},
    {id: 'updatedAt', title: 'Updated at'},
];

const logOnChange = action('onChange');

/** Fully controlled example: selected fields persist between openings of the popup */
export const Controlled: Story = {
    render: function ControlledFieldsSelector() {
        const [values, setValues] = useState<string[]>(['id', 'status']);

        return (
            <FieldsSelector
                fields={fields}
                value={values}
                onChange={(newValue) => {
                    logOnChange(newValue);
                    setValues(newValue);
                }}
            />
        );
    },
};
