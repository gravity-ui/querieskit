import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';
import type {ChartFieldsFormProps} from '../../types/chartEditor';
import {
    fieldsEditorProps,
    getInitialFormValues,
} from '../../widgets/DashboardCharts/story/fieldsData';
import {ChartFieldsForm} from './index';

const ControlledForm = (props: ChartFieldsFormProps) => {
    const [formValues, setFormValues] = useState(props.formValues);
    return (
        <ChartFieldsForm
            {...props}
            formValues={formValues}
            onFormValuesChange={(values) => {
                setFormValues(values);
                props.onFormValuesChange?.(values);
            }}
        />
    );
};

const meta: Meta<typeof ChartFieldsForm> = {
    title: 'Components/ChartFieldsForm',
    component: ChartFieldsForm,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'A controlled chart binding form. Fields depend on chartType: XY charts use ' +
                    'dimensionFieldId, dimensionAxisType and ordered measureItems; pie uses category/value; ' +
                    'treemap uses ordered levels/value; sankey uses source/target/value. ' +
                    'getFieldOptions({chartType, role}) supplies allowed columns for each role. ' +
                    'Pass onFormValuesChange values back to the form, retaining stable row IDs. ' +
                    'Only available, complete bindings can be saved; disabled options are unavailable. ' +
                    'Chart-type changes reset incompatible bindings. Persist the full discriminated ' +
                    'form value alongside chart data to restore bindings on edit. ' +
                    'Aggregation and conversion into chart data belong to the application.',
            },
        },
    },
    decorators: [
        (Story) => (
            <div style={{width: 400, maxWidth: '100%', height: 820}}>
                <Story />
            </div>
        ),
    ],
    args: {
        chartTypeOptions: fieldsEditorProps.chartTypeOptions,
        getFieldOptions: fieldsEditorProps.getFieldOptions,
        formValues: {
            chartType: 'line',
            dimensionAxisType: 'category',
            measureItems: [{id: 'first-measure'}],
        },
        onFormValuesChange: fn(),
        onSubmit: fn(),
        onCancel: fn(),
    },
    render: (args) => <ControlledForm key={JSON.stringify(args.formValues)} {...args} />,
};
export default meta;
type Story = StoryObj<typeof ChartFieldsForm>;

export const Default: Story = {};
export const WithFilledValues: Story = {
    args: {
        formValues: {
            chartType: 'line',
            dimensionAxisType: 'datetime',
            dimensionFieldId: 'time',
            measureItems: [
                {id: 'requests', fieldId: 'requests'},
                {id: 'errors', fieldId: 'errors'},
            ],
            showLegend: true,
        },
    },
};
export const HorizontalBars: Story = {args: {formValues: getInitialFormValues('bar-y')}};
export const Scatter: Story = {args: {formValues: getInitialFormValues('scatter')}};
export const Area: Story = {args: {formValues: getInitialFormValues('area')}};
export const VerticalBars: Story = {args: {formValues: getInitialFormValues('bar-x')}};
export const Pie: Story = {args: {formValues: getInitialFormValues('pie')}};
export const Treemap: Story = {
    args: {formValues: getInitialFormValues('treemap')},
    parameters: {
        docs: {
            description: {
                story: 'Move Service above Region to change the hierarchy order; row IDs remain stable.',
            },
        },
    },
};
export const Sankey: Story = {args: {formValues: getInitialFormValues('sankey')}};
export const NoChartType: Story = {args: {formValues: {}}};
export const EmptyOptions: Story = {args: {chartTypeOptions: [], getFieldOptions: () => []}};
export const Disabled: Story = {
    args: {disabled: true, formValues: getInitialFormValues('treemap')},
};
export const AdditionalValidation: Story = {
    args: {submitDisabled: true, formValues: getInitialFormValues('pie')},
};
export const NoMeasures: Story = {
    args: {
        formValues: {
            chartType: 'line',
            dimensionFieldId: 'time',
            dimensionAxisType: 'datetime',
            measureItems: [],
        },
    },
};
export const UnavailableSelection: Story = {
    args: {
        formValues: getInitialFormValues('pie'),
        getFieldOptions: (context) =>
            fieldsEditorProps
                .getFieldOptions(context)
                .map((option) => ({...option, disabled: option.value === 'requests'})),
    },
};
export const CustomLabels: Story = {
    args: {
        formValues: getInitialFormValues('sankey'),
        labels: {
            formTitle: 'Configure flow chart',
            chartType: 'Visualization',
            source: 'From stage',
            target: 'To stage',
            flowValue: 'Request count',
            chartConfig: 'Appearance',
            selectItem: 'Choose a column',
            chartTitle: 'Chart name',
            showLegend: 'Display legend',
            closeLabel: 'Close editor',
            cancelLabel: 'Discard',
            submitLabel: 'Save chart',
        },
    },
};
export const ManyMeasures: Story = {
    args: {
        getFieldOptions: ({role}) =>
            role === 'dimension'
                ? [{value: 'time', content: 'Time'}]
                : Array.from({length: 12}, (_, index) => ({
                      value: `measure-${index}`,
                      content: `Measure ${index + 1}`,
                  })),
        formValues: {
            chartType: 'line',
            dimensionFieldId: 'time',
            dimensionAxisType: 'datetime',
            measureItems: Array.from({length: 12}, (_, index) => ({
                id: `series-${index}`,
                fieldId: `measure-${index}`,
            })),
        },
    },
};
