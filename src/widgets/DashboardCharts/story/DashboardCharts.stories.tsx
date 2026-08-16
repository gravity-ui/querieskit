import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';

import {DashboardCharts} from '../DashboardCharts';
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
        chartsLayout: commonChartsLayout,
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
        chartsLayout: advancedChartsLayout,
        dashboardProps: {
            grid: {cols: 8, rowHeight: 72, gap: 12, compactType: 'vertical'},
            focusable: true,
        },
    },
};
