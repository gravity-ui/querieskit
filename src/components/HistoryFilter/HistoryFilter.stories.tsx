import type {Meta, StoryObj} from '@storybook/react';
import {FormField} from '../SimpleForm';
import {HistoryFilter} from './HistoryFilter';

const meta: Meta<typeof HistoryFilter> = {
    title: 'Components/HistoryFilter',
    component: HistoryFilter,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof HistoryFilter>;

const fields: FormField[] = [
    {id: 'onlyMine', type: 'switch', title: 'Только мои запросы', initialValue: true},
    {id: 'range', type: 'rangeDatePicker', title: 'Период'},
    {
        id: 'checkobxGroup',
        type: 'checkboxGroup',
        title: 'Диалект',
        initialValue: [],
        items: [
            {id: 'yql', title: 'YQL'},
            {id: 'sql', title: 'SQL'},
        ],
    },
];

/** Базовый фильтр с набором полей и обработчиками Apply и Reset */
export const Default: Story = {
    args: {
        fields,
        onApply: (values) => alert(JSON.stringify(values)),
        onReset: () => alert('Reset'),
    },
};

/** Фильтр с признаком изменённого состояния — кнопка раскрытия попапа подсвечена (view="action") */
export const Changed: Story = {
    args: {
        fields,
        isChanged: true,
        onApply: (values) => alert(JSON.stringify(values)),
        onReset: () => alert('Reset'),
    },
};

/** Фильтр в controlled-режиме с переданными values */
export const Controlled: Story = {
    args: {
        fields,
        values: {onlyMine: false},
        onApply: (values) => alert(JSON.stringify(values)),
        onReset: () => alert('Reset'),
    },
};

/** Фильтр с начальными значениями (uncontrolled-режим) */
export const WithInitialValues: Story = {
    args: {
        fields,
        initialValues: {onlyMine: true},
        onApply: (values) => alert(JSON.stringify(values)),
        onReset: () => alert('Reset'),
    },
};
