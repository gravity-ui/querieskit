import React, {Suspense, useCallback, useMemo, useState} from 'react';
import {
    Circle,
    CircleCheck,
    CircleDashed,
    CircleMinus,
    CirclePlay,
    CircleXmark,
} from '@gravity-ui/icons';
import {Flex, Icon, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import type {
    QueryGraphNodeStatus,
    QueryProgressProps,
    QueryProgressView,
} from '../../types/queryGraph';
import i18n from './i18n';

import './QueryProgress.scss';

const QueryGraph = React.lazy(() =>
    import('../../components/QueryGraph/QueryGraph').then((module) => ({
        default: module.QueryGraph,
    })),
);
const block = cn('qp-query-progress');
const statuses: QueryGraphNodeStatus[] = [
    'not-started',
    'waiting',
    'running',
    'completed',
    'failed',
    'aborted',
];
const statusIcons = {
    'not-started': CircleDashed,
    waiting: Circle,
    running: CirclePlay,
    completed: CircleCheck,
    failed: CircleXmark,
    aborted: CircleMinus,
} satisfies Record<QueryGraphNodeStatus, typeof Circle>;

export function QueryProgress({
    graphProps,
    view: controlledView,
    defaultView = 'graph',
    onViewChange,
    className,
}: QueryProgressProps) {
    const [uncontrolledView, setUncontrolledView] = useState(defaultView);
    const view = controlledView ?? uncontrolledView;
    const [hasOpenedGraph, setHasOpenedGraph] = useState(view === 'graph');
    const counts = useMemo(() => {
        const result = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<
            QueryGraphNodeStatus,
            number
        >;
        graphProps.nodes.forEach((node) => {
            if (node.kind === 'operation') result[node.status ?? 'not-started']++;
        });
        return result;
    }, [graphProps.nodes]);

    const updateView = useCallback(
        (value: string) => {
            const nextView = value as QueryProgressView;
            if (controlledView === undefined) setUncontrolledView(nextView);
            if (nextView === 'graph') setHasOpenedGraph(true);
            onViewChange?.(nextView);
        },
        [controlledView, onViewChange],
    );

    return (
        <Flex direction="column" gap={3} className={block(null, className)}>
            <Flex alignItems="center" gap={4} className={block('toolbar')}>
                <SegmentedRadioGroup size="m" value={view} onUpdate={updateView}>
                    <SegmentedRadioGroup.Option value="graph">
                        {i18n('tab_graph')}
                    </SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="timeline">
                        {i18n('tab_timeline')}
                    </SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
                <Flex gap={2} wrap className={block('statuses')}>
                    {statuses.map((status) => (
                        <span key={status} className={block('status', {status})}>
                            <Icon data={statusIcons[status]} size={14} />
                            {i18n(`status_${status}`)}: {counts[status]}
                        </span>
                    ))}
                </Flex>
            </Flex>
            <div className={block('content')}>
                {hasOpenedGraph && (
                    <div className={block('view', {hidden: view !== 'graph'})}>
                        <Suspense fallback={<Loader size="m" />}>
                            <QueryGraph {...graphProps} active={view === 'graph'} />
                        </Suspense>
                    </div>
                )}
                {view === 'timeline' && (
                    <div className={block('timeline')}>
                        <Text color="secondary">{i18n('context_timeline-unavailable')}</Text>
                    </div>
                )}
            </div>
        </Flex>
    );
}
