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
    {id: 'onlyMine', type: 'switch', title: 'My queries only', initialValue: true},
    {id: 'range', type: 'rangeDatePicker', title: 'Period'},
    {
        id: 'checkobxGroup',
        type: 'checkboxGroup',
        title: 'Dialect',
        initialValue: [],
        items: [
            {id: 'yql', title: 'YQL'},
            {id: 'sql', title: 'SQL'},
        ],
    },
];

/** Basic filter with a set of fields and Apply/Reset handlers */
export const Default: Story = {
    args: {
        fields,
        onApply: (values) => alert(JSON.stringify(values)),
        onReset: () => alert('Reset'),
    },
};

/** Filter with a "changed" state — the popup toggle button is highlighted (view="action") */
export const Changed: Story = {
    args: {
        fields,
        isChanged: true,
        onApply: (values) => alert(JSON.stringify(values)),
        onReset: () => alert('Reset'),
    },
};

/** Filter in controlled mode with provided values */
export const Controlled: Story = {
    args: {
        fields,
        values: {onlyMine: false},
        onApply: (values) => alert(JSON.stringify(values)),
        onReset: () => alert('Reset'),
    },
};

/** Filter with initial values (uncontrolled mode) */
export const WithInitialValues: Story = {
    args: {
        fields,
        initialValues: {onlyMine: true},
        onApply: (values) => alert(JSON.stringify(values)),
        onReset: () => alert('Reset'),
    },
};
