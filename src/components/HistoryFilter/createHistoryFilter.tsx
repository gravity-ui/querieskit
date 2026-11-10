import React from 'react';
import type {
    CustomHistoryFilterConfig,
    CustomHistoryFilterOptions,
} from '../../types/historyFilter';
import {HistoryFilterForm} from './HistoryFilter';

/** Create a typed field adapter without adding form-data generics to every history widget. */
export function createHistoryFilter<T extends object>(
    options: CustomHistoryFilterOptions<T>,
): CustomHistoryFilterConfig {
    return {
        isChanged: options.isChanged,
        customFilter: {
            render: (context) => (
                <HistoryFilterForm key="custom-fields" {...options} {...context} />
            ),
        },
    };
}
