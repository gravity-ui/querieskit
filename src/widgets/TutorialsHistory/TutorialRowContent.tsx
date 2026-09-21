import React from 'react';
import type {QueryListRowRenderData} from '../../types/queryList';
import type {TutorialHistoryRow} from '../../types/tutorial';
import {HistoryGroupHeader} from '../../components/HistoryGroupHeader';
import {TutorialRow} from '../../modules/TutorialRow';
import {TutorialSearchRow} from '../../modules/TutorialSearchRow';

export const TutorialRowContent = <T extends TutorialHistoryRow>({
    item,
    variant,
}: QueryListRowRenderData<T>) => {
    if ('header' in item) {
        return <HistoryGroupHeader title={item.header} />;
    }

    return variant === 'search' ? <TutorialSearchRow item={item} /> : <TutorialRow item={item} />;
};
