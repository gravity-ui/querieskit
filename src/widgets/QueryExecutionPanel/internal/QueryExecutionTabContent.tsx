import React, {Suspense, lazy, useState} from 'react';
import {Text} from '@gravity-ui/uikit';
import {ErrorTree} from '../../../components/ErrorTree';
import {NavigationMeta} from '../../../modules/NavigationMeta';
import {QueryProgress} from '../../../modules/QueryProgress';
import {QueryResults} from '../../../modules/QueryResults';
import {QueryStatistics} from '../../../modules/QueryStatistics';
import type {NavigationMetaItem} from '../../../types/navigation';
import type {QueryExecutionTab} from '../../../types/queryExecutionPanel';
import i18n from '../i18n';

const DashboardCharts = lazy(() =>
    import('../../DashboardCharts').then((module) => ({default: module.DashboardCharts})),
);

export function QueryExecutionTabContent<
    TRow extends Record<string, unknown>,
    TMetaItem extends NavigationMetaItem,
>({tab, active}: {tab: QueryExecutionTab<TRow, TMetaItem>; active: boolean}) {
    const [visited, setVisited] = useState(active);
    if (active && !visited) setVisited(true);
    if (!active && !visited) return null;

    switch (tab.type) {
        case 'result':
            return <QueryResults {...tab.props} />;
        case 'progress':
            return <QueryProgress {...tab.props} active={active && tab.props.active !== false} />;
        case 'statistics':
            return <QueryStatistics {...tab.props} />;
        case 'meta':
            return <NavigationMeta {...tab.props} />;
        case 'info':
            return tab.props ? (
                <ErrorTree {...tab.props} />
            ) : (
                <Text color="secondary">{i18n('context_no-messages')}</Text>
            );
        case 'charts':
            return tab.props ? (
                <Suspense fallback={null}>
                    <DashboardCharts {...tab.props} active={active && tab.props.active !== false} />
                </Suspense>
            ) : (
                tab.renderContent({active})
            );
        case 'custom':
            return tab.renderContent({active});
    }
}
