import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';

import {ChartEditor} from '..';
import {
    cartesianAxisVariants,
    donutSeriesMap,
    emptySeriesMap,
    groupedColumnsSeriesMap,
    horizontalBarsSeriesMap,
    lineSeriesMap,
    logarithmicAxisVariants,
    logarithmicSeriesMap,
    mixedSeriesMap,
    multiLineSeriesMap,
    pieAxisVariants,
    scatterSeriesMap,
    stackedAreaSeriesMap,
    timeAxisVariants,
    timeSeriesMap,
} from './mockData';

const meta = {
    title: 'Modules/ChartEditor',
    component: ChartEditor,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{height: 620, minWidth: 760}}>
                <Story />
            </div>
        ),
    ],
    parameters: {
        layout: 'padded',
    },
    args: {
        axisVariants: cartesianAxisVariants,
        onCancel: fn(),
        onSubmit: fn(),
    },
} satisfies Meta<typeof ChartEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
    args: {
        chartSeriesMap: lineSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'A minimal editor configuration with one numeric line series.',
            },
        },
    },
};

export const MultipleLines: Story = {
    args: {
        chartSeriesMap: multiLineSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'Select additional data rows to compare the current week, previous week, and target.',
            },
        },
    },
};

export const TimeSeries: Story = {
    args: {
        axisVariants: timeAxisVariants,
        chartSeriesMap: timeSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'An area time series backed by UTC timestamps. Switch the axis type to datetime to format the X axis as dates.',
            },
        },
    },
};

export const StackedArea: Story = {
    args: {
        chartSeriesMap: stackedAreaSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'A stacked traffic breakdown. Select all three data rows to build the complete stack.',
            },
        },
    },
};

export const GroupedColumns: Story = {
    args: {
        chartSeriesMap: groupedColumnsSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'Vertical columns with values rendered on the bars. Add Mobile to compare device groups.',
            },
        },
    },
};

export const HorizontalBars: Story = {
    args: {
        chartSeriesMap: horizontalBarsSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'A horizontal ranking chart using the bar-y series type.',
            },
        },
    },
};

export const ScatterPlot: Story = {
    args: {
        chartSeriesMap: scatterSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'A scatter plot for investigating the relationship between input size and query duration. Select both data rows to compare cached and uncached queries.',
            },
        },
    },
};

export const Donut: Story = {
    args: {
        axisVariants: pieAxisVariants,
        chartSeriesMap: donutSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'A pie series with an inner radius and percentage labels, rendered as a donut chart.',
            },
        },
    },
};

export const MixedSeries: Story = {
    args: {
        chartSeriesMap: mixedSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'A combined column-and-line chart. Select Plan together with Orders to compare actual values against the target.',
            },
        },
    },
};

export const LogarithmicScale: Story = {
    args: {
        axisVariants: logarithmicAxisVariants,
        chartSeriesMap: logarithmicSeriesMap,
    },
    parameters: {
        docs: {
            description: {
                story: 'Values spanning five orders of magnitude. Switch the X axis to logarithmic to make the distribution readable.',
            },
        },
    },
};

export const EmptyState: Story = {
    args: {
        chartSeriesMap: emptySeriesMap,
        emptyDataLabel: 'Run a query or select a result column to preview a chart',
    },
};
