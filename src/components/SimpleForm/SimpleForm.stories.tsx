import type {Meta, StoryObj} from '@storybook/react';
import {FormField, SimpleForm} from './SimpleForm';

const meta: Meta<typeof SimpleForm> = {
    title: 'Components/SimpleForm',
    component: SimpleForm,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof SimpleForm>;

const fields: FormField[] = [
    {id: 'onlyMine', type: 'switch', title: 'My queries only', initialValue: true},
    {id: 'range', type: 'rangeDatePicker', title: 'Period'},
    {
        id: 'dialect',
        type: 'checkboxGroup',
        title: 'Dialect',
        initialValue: [],
        items: [
            {id: 'yql', title: 'YQL'},
            {id: 'sql', title: 'SQL'},
        ],
    },
    {
        id: 'author',
        type: 'select',
        title: 'Author',
        initialValue: [],
        options: [
            {value: 'alice', content: 'Alice'},
            {value: 'bob', content: 'Bob'},
        ],
    },
];

/** Basic set of form fields (uncontrolled mode with default values from each field's initialValue) */
export const Default: Story = {
    args: {
        fields,
        onValuesChange: (values) => console.info('onValuesChange', values),
    },
};

/** Form with explicit initial values (initialValues), overriding fields' initialValue */
export const WithInitialValues: Story = {
    args: {
        fields,
        initialValues: {onlyMine: false, dialect: ['sql']},
        onValuesChange: (values) => console.info('onValuesChange', values),
    },
};

/** Controlled mode: values are fully managed from outside via values */
export const Controlled: Story = {
    args: {
        fields,
        values: {onlyMine: true, dialect: ['yql', 'sql']},
        onValuesChange: (values) => console.info('onValuesChange', values),
    },
};

/** Only a single switch field */
export const SwitchOnly: Story = {
    args: {
        fields: [{id: 'onlyMine', type: 'switch', title: 'My queries only', initialValue: true}],
    },
};

/** Only a date range picker */
export const RangeDatePickerOnly: Story = {
    args: {
        fields: [{id: 'range', type: 'rangeDatePicker', title: 'Period'}],
    },
};

/** Only a checkbox group */
export const CheckboxGroupOnly: Story = {
    args: {
        fields: [
            {
                id: 'dialect',
                type: 'checkboxGroup',
                title: 'Dialect',
                initialValue: ['yql'],
                items: [
                    {id: 'yql', title: 'YQL'},
                    {id: 'sql', title: 'SQL'},
                ],
            },
        ],
    },
};

/** Only a select field */
export const SelectOnly: Story = {
    args: {
        fields: [
            {
                id: 'author',
                type: 'select',
                title: 'Author',
                initialValue: ['alice'],
                options: [
                    {value: 'alice', content: 'Alice'},
                    {value: 'bob', content: 'Bob'},
                ],
            },
        ],
    },
};
