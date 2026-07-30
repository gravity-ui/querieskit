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
    {id: 'onlyMine', type: 'switch', title: 'Только мои запросы', initialValue: true},
    {id: 'range', type: 'rangeDatePicker', title: 'Период'},
    {
        id: 'dialect',
        type: 'checkboxGroup',
        title: 'Диалект',
        initialValue: [],
        items: [
            {id: 'yql', title: 'YQL'},
            {id: 'sql', title: 'SQL'},
        ],
    },
    {
        id: 'author',
        type: 'select',
        title: 'Автор',
        initialValue: [],
        options: [
            {value: 'alice', content: 'Alice'},
            {value: 'bob', content: 'Bob'},
        ],
    },
];

/** Базовый набор полей формы (uncontrolled-режим со значениями по умолчанию из initialValue каждого поля) */
export const Default: Story = {
    args: {
        fields,
        onValuesChange: (values) => console.info('onValuesChange', values),
    },
};

/** Форма с явными начальными значениями (initialValues), переопределяющими initialValue полей */
export const WithInitialValues: Story = {
    args: {
        fields,
        initialValues: {onlyMine: false, dialect: ['sql']},
        onValuesChange: (values) => console.info('onValuesChange', values),
    },
};

/** Controlled-режим: значения полностью управляются снаружи через values */
export const Controlled: Story = {
    args: {
        fields,
        values: {onlyMine: true, dialect: ['yql', 'sql']},
        onValuesChange: (values) => console.info('onValuesChange', values),
    },
};

/** Только одно поле-переключатель */
export const SwitchOnly: Story = {
    args: {
        fields: [{id: 'onlyMine', type: 'switch', title: 'Только мои запросы', initialValue: true}],
    },
};

/** Только выбор диапазона дат */
export const RangeDatePickerOnly: Story = {
    args: {
        fields: [{id: 'range', type: 'rangeDatePicker', title: 'Период'}],
    },
};

/** Только группа чекбоксов */
export const CheckboxGroupOnly: Story = {
    args: {
        fields: [
            {
                id: 'dialect',
                type: 'checkboxGroup',
                title: 'Диалект',
                initialValue: ['yql'],
                items: [
                    {id: 'yql', title: 'YQL'},
                    {id: 'sql', title: 'SQL'},
                ],
            },
        ],
    },
};

/** Только выбор из списка (select) */
export const SelectOnly: Story = {
    args: {
        fields: [
            {
                id: 'author',
                type: 'select',
                title: 'Автор',
                initialValue: ['alice'],
                options: [
                    {value: 'alice', content: 'Alice'},
                    {value: 'bob', content: 'Bob'},
                ],
            },
        ],
    },
};
