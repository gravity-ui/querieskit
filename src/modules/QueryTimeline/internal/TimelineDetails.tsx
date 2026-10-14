import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {dateTimeParse} from '@gravity-ui/date-utils';
import cn from 'bem-cn-lite';
import type {QueryTimelineStatus} from '../../../types/queryTimeline';
import type {TimelineRow} from '../helpers/model';
import i18n from '../i18n';
import './TimelineDetails.scss';

const block = cn('qp-timeline-details');

export function TimelineDetails({
    row,
    status,
    formatDuration,
    timeZone,
}: {
    row: TimelineRow;
    status?: QueryTimelineStatus;
    formatDuration: (milliseconds: number) => string;
    timeZone?: string;
}) {
    const date = (value: number) =>
        dateTimeParse(value, {timeZone})?.format('YYYY-MM-DD HH:mm:ss.SSS');
    return (
        <Flex direction="column" gap={1} className={block()}>
            <Text variant="subheader-1">{row.stage?.label ?? row.item.label}</Text>
            <Text>
                {i18n('field_status')}: {status?.label ?? row.item.status ?? '—'}
            </Text>
            {row.interval && (
                <React.Fragment>
                    <Text>
                        {i18n('field_start')}: {date(row.interval.from)}
                    </Text>
                    <Text>
                        {i18n('field_end')}:{' '}
                        {row.open ? i18n('value_running') : date(row.interval.to)}
                    </Text>
                    <Text>
                        {i18n('field_duration')}:{' '}
                        {formatDuration(row.interval.to - row.interval.from)}
                    </Text>
                </React.Fragment>
            )}
        </Flex>
    );
}
