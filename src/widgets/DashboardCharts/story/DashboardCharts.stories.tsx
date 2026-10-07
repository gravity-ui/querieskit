import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';

import {DashboardCharts} from '../DashboardCharts';
import type {DashboardChartsProps} from '../../../types/dashboardCharts';
import {fieldsChartItems, fieldsEditorProps} from './fieldsData';
import {
    advancedChartItems,
    advancedChartsDataSource,
    advancedChartsLayout,
    allChartTypesDataSource,
    commonChartItems,
    commonChartsDataSource,
    commonChartsLayout,
} from './mockData';

import './DashboardCharts.stories.scss';

const meta: Meta<typeof DashboardCharts> = {
    title: 'Widgets/DashboardCharts',
    component: DashboardCharts,
    tags: ['autodocs'],
    parameters: {layout: 'fullscreen'},
    args: {
        onItemsChange: action('onItemsChange'),
        onLayoutChange: action('onLayoutChange'),
    },
    render: (args) => (
        <div className="qp-dashboard-charts-story">
            <DashboardCharts {...args} />
        </div>
    ),
};

export default meta;
type Story = StoryObj<typeof DashboardCharts>;

/**
 * Start with an empty dashboard and use the Add chart menu to create any chart type
 * supported by `@gravity-ui/charts`.
 */
export const Default: Story = {
    args: {
        dataSource: allChartTypesDataSource,
    },
};

/**
 * A practical monitoring dashboard with the most common cartesian and circular charts.
 * Every card can be dragged, resized and opened in the chart editor.
 */
export const CommonCharts: Story = {
    args: {
        dataSource: commonChartsDataSource,
        chartItems: commonChartItems,
        defaultLayout: commonChartsLayout,
        dashboardProps: {
            grid: {cols: 6, rowHeight: 72, gap: 12, compactType: 'vertical'},
            focusable: true,
        },
    },
};

/**
 * Less common visualizations for hierarchy, flow, changes, profiles, density,
 * conversion and execution intervals.
 */
export const AdvancedCharts: Story = {
    args: {
        dataSource: advancedChartsDataSource,
        chartItems: advancedChartItems,
        defaultLayout: advancedChartsLayout,
        dashboardProps: {
            grid: {cols: 8, rowHeight: 72, gap: 12, compactType: 'vertical'},
            focusable: true,
        },
    },
};

export const FieldsEditor: Story = {
    args: {
        editorMode: 'fields',
        chartFieldsEditorProps: fieldsEditorProps,
    },
    parameters: {
        docs: {
            description: {
                story:
                    'All eight binding types are available: XY, pie, treemap and sankey families. ' +
                    'chartFieldsEditorProps.getChartData converts complete selections to chart data. ' +
                    'The demo adapter aggregates categories, hierarchy paths and flows; bar-y places the dimension on Y. Save each returned ' +
                    'DashboardItem including fieldsFormValues to restore the mapping on edit.',
            },
        },
    },
};

function SavedFieldsDashboard(args: DashboardChartsProps) {
    const [items, setItems] = useState(args.chartItems);
    return (
        <div className="qp-dashboard-charts-story">
            <DashboardCharts
                {...args}
                chartItems={items}
                onItemsChange={(nextItems) => {
                    setItems(nextItems);
                    args.onItemsChange?.(nextItems);
                }}
            />
        </div>
    );
}

export const FieldsEditorWithSavedChart: Story = {
    args: {
        editorMode: 'fields',
        chartFieldsEditorProps: fieldsEditorProps,
        chartItems: fieldsChartItems,
    },
    render: (args) => <SavedFieldsDashboard {...args} />,
};

export const FieldsEditorSavedNonXY: Story = {
    args: {
        editorMode: 'fields',
        chartFieldsEditorProps: fieldsEditorProps,
        chartItems: fieldsChartItems.filter((item) =>
            ['saved-pie', 'saved-treemap', 'saved-sankey'].includes(item.id),
        ),
    },
    render: (args) => <SavedFieldsDashboard {...args} />,
    parameters: {
        docs: {
            description: {
                story: 'Edit the saved pie, treemap and sankey to restore their type-specific bindings. Duplicate rows are aggregated by the example adapter.',
            },
        },
    },
};
