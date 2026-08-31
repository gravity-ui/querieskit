import React from 'react';
import {QueryListRowRenderData} from '../../types/queryList';
import {TutorialHistoryRow} from '../../types/tutorial';
import {HistoryGroupHeader} from '../../components';
import {TutorialRow, TutorialSearchRow} from '../../modules';

export const TutorialRowContent = <T extends TutorialHistoryRow>({
    item,
    variant,
}: QueryListRowRenderData<T>) => {
    if ('header' in item) {
        return <HistoryGroupHeader title={item.header} />;
    }

    return variant === 'search' ? <TutorialSearchRow item={item} /> : <TutorialRow item={item} />;
};
