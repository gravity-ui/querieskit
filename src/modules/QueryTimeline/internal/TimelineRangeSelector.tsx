import React from 'react';
import {RangeDateSelection} from '@gravity-ui/date-components';
import {dateTimeParse} from '@gravity-ui/date-utils';
import type {QueryTimelineRange} from '../../../types/queryTimeline';
import {MAX_RANGE, MIN_RANGE} from '../helpers/model';

export function TimelineRangeSelector({
    range,
    onChange,
    timeZone,
}: {
    range: QueryTimelineRange;
    onChange: (range: QueryTimelineRange) => void;
    timeZone?: string;
}) {
    const start = dateTimeParse(range.from, {timeZone});
    const end = dateTimeParse(range.to, {timeZone});
    if (!start?.isValid() || !end?.isValid()) return null;
    // Scale buttons live in the toolbar: the ruler and canvas must have equal widths.
    return (
        <RangeDateSelection
            value={{start, end}}
            timeZone={timeZone}
            numberOfIntervals={1}
            align={1}
            minDuration={MIN_RANGE}
            maxDuration={MAX_RANGE}
            displayNow
            onUpdate={(value) => onChange({from: value.start.valueOf(), to: value.end.valueOf()})}
        />
    );
}
