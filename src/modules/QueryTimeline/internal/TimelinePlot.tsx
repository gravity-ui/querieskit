import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import type {QueryTimelineRange} from '../../../types/queryTimeline';
import {TimelineCanvasView} from './TimelineCanvasView';
import i18n from '../i18n';

type Props = Omit<React.ComponentProps<typeof TimelineCanvasView>, 'range'> & {
    range?: QueryTimelineRange;
    active: boolean;
    height: number;
    hasIntervals: boolean;
};

export function TimelinePlot({range, active, height, hasIntervals, ...props}: Props) {
    if (!hasIntervals) {
        return (
            <Flex alignItems="center" justifyContent="center" style={{height: '100%'}}>
                <Text color="secondary">{i18n('context_no-intervals')}</Text>
            </Flex>
        );
    }
    if (!active || height <= 0 || !range) return null;
    return <TimelineCanvasView {...props} range={range} />;
}
