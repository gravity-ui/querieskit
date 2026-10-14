import React from 'react';
import {DashboardCharts} from '../../DashboardCharts';
import type {DashboardChartsProps} from '../../DashboardCharts/types';
import type {ErrorTreeProps} from '../../../types/errorTree';
import type {QueryExecutionTab} from '../../../types/queryExecutionPanel';
import type {QueryProgressProps} from '../../../types/queryGraph';
import type {QueryResultsProps} from '../../../types/queryResults';
import type {QueryStatisticsProps} from '../../../types/queryStatistics';
import type {NavigationMetaProps} from '../../../modules/NavigationMeta';

// Application example only. Backend responses are normalized before reaching this adapter.
export type ExampleQuery = {
    id: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED';
    error?: ErrorTreeProps;
    results: QueryResultsProps<Record<string, unknown>>[];
    progress?: QueryProgressProps;
    statistics?: QueryStatisticsProps;
    charts?: DashboardChartsProps[];
    meta: NavigationMetaProps;
};

export function createQueryTrackerPanel(query?: ExampleQuery): {
    tabs: QueryExecutionTab[];
    preferredActiveTab?: string;
} {
    if (!query) return {tabs: []};
    const tabs: QueryExecutionTab[] = [];
    if (query.status === 'FAILED') tabs.push({id: 'error', type: 'info', props: query.error});
    if (query.status === 'COMPLETED') {
        query.results.forEach((props, index) =>
            tabs.push({
                id: `result/${index}`,
                type: 'result',
                title: `Result ${index + 1}`,
                props,
            }),
        );
    }
    const plan = query.progress?.graphProps;
    if (query.progress && plan && (plan.nodes.length || plan.edges.length)) {
        tabs.push({id: 'progress', type: 'progress', props: query.progress});
    }
    if (query.status === 'COMPLETED') {
        if (query.results.length) {
            query.charts?.forEach((props, index) =>
                tabs.push({
                    id: `chart/${index}`,
                    type: 'charts',
                    title: `Charts ${index + 1}`,
                    renderContent: () => <DashboardCharts {...props} />,
                }),
            );
        }
        if (query.statistics)
            tabs.push({id: 'statistics', type: 'statistics', props: query.statistics});
    }
    tabs.push({id: 'meta', type: 'meta', props: query.meta});
    return {
        tabs,
        preferredActiveTab: ['error', 'result/0', 'progress', 'meta'].find((id) =>
            tabs.some((tab) => tab.id === id),
        ),
    };
}
