import React from 'react';
import {Button, Flex, Select, Text, TextInput} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react';
import {FormField} from '../SimpleForm';
import {HistoryFilter} from './HistoryFilter';
import {createHistoryFilter} from './createHistoryFilter';

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

function ExternalUpdatesExample() {
    const [values, setValues] = React.useState<Record<string, unknown>>({onlyMine: false});
    const [applied, setApplied] = React.useState<Record<string, unknown>>({});
    return (
        <Flex direction="column" gap={3} alignItems="flex-start">
            <HistoryFilter
                fields={fields}
                values={{...values}}
                onApply={setApplied}
                onReset={() => setApplied({})}
            />
            <Flex gap={2}>
                <Button onClick={() => setValues({onlyMine: true, checkobxGroup: ['yql']})}>
                    Load saved filters
                </Button>
                <Button onClick={() => setValues({...values})}>Rerender equivalent values</Button>
            </Flex>
            <Text>Applied: {JSON.stringify(applied)}</Text>
        </Flex>
    );
}

/** Edit multiple fields, Apply or Reset, and replace the values externally. */
export const ExternalUpdates: Story = {render: () => <ExternalUpdatesExample />};

type CustomFilterValues = {
    period: {from: string; to: string};
    owner: string;
    statuses: string[];
    engines: string[];
};

const customDefaults: CustomFilterValues = {
    period: {from: '', to: ''},
    owner: '',
    statuses: [],
    engines: [],
};

function CustomFieldsExample() {
    const [applied, setApplied] = React.useState(customDefaults);
    const filter = createHistoryFilter({
        initialValues: customDefaults,
        values: applied,
        isChanged: JSON.stringify(applied) !== JSON.stringify(customDefaults),
        onApply: setApplied,
        onReset: () => setApplied(customDefaults),
        renderFields: ({value, onChange}) => (
            <Flex direction="column" gap={3}>
                <TextInput
                    label="From"
                    placeholder="YYYY-MM-DD"
                    value={value.period.from}
                    onUpdate={(from) => onChange({...value, period: {...value.period, from}})}
                />
                <TextInput
                    label="To"
                    placeholder="YYYY-MM-DD"
                    value={value.period.to}
                    onUpdate={(to) => onChange({...value, period: {...value.period, to}})}
                />
                <TextInput
                    label="User"
                    value={value.owner}
                    onUpdate={(owner) => onChange({...value, owner})}
                />
                <Select
                    label="Status"
                    multiple
                    value={value.statuses}
                    options={[
                        {value: 'running', content: 'Running'},
                        {value: 'completed', content: 'Completed'},
                    ]}
                    onUpdate={(statuses) => onChange({...value, statuses})}
                />
                <Select
                    label="Engine"
                    multiple
                    value={value.engines}
                    options={[
                        {value: 'sql', content: 'SQL'},
                        {value: 'custom', content: 'Custom engine'},
                    ]}
                    onUpdate={(engines) => onChange({...value, engines})}
                />
            </Flex>
        ),
    });
    return (
        <Flex direction="column" gap={3} alignItems="flex-start">
            <HistoryFilter {...filter} />
            <Text>Applied: {JSON.stringify(applied)}</Text>
        </Flex>
    );
}

/** Typed application fields share the standard draft, Apply/Reset actions and popup. */
export const CustomFields: Story = {render: () => <CustomFieldsExample />};
