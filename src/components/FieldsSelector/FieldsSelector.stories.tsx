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

export const ExplicitWideTable: Story = {
    render: function WideTableFields() {
        const [values, setValues] = useState<string[]>(['column-0', 'column-1']);
        return (
            <FieldsSelector
                fields={Array.from({length: 500}, (_, index) => ({
                    id: `column-${index}`,
                    title: `Column ${index}`,
                }))}
                value={values}
                onChange={(next) => {
                    logOnChange(next);
                    setValues(next);
                }}
                applyMode="explicit"
                searchable
                showSelectedCount
                buttonContent="Columns"
            />
        );
    },
};

export const Empty: Story = {
    args: {fields: [], value: [], onChange: logOnChange, searchable: true, applyMode: 'explicit'},
};

export const LongTitles: Story = {
    args: {
        fields: [
            {
                id: 'long',
                title: 'A very long column title that needs to fit inside a narrow panel without hiding the controls',
            },
        ],
        value: [],
        onChange: logOnChange,
        applyMode: 'explicit',
        searchable: true,
    },
};
