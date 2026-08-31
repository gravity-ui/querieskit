import React from 'react';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import ArrowRightArrowLeftIcon from '@gravity-ui/icons/svgs/arrow-right-arrow-left.svg';
import ArrowRotateRightIcon from '@gravity-ui/icons/svgs/arrow-rotate-right.svg';
import {QueryListComparisonConfig, QueryListRow} from '../../types/queryList';
import cn from 'bem-cn-lite';
import './HistoryComparisonActions.scss';

export type HistoryComparisonActionsProps<T extends QueryListRow = QueryListRow> = {
    comparison: QueryListComparisonConfig<T>;
    className?: string;
};

const block = cn('qp-history-comparison-actions');

export const HistoryComparisonActions = <T extends QueryListRow>({
    comparison: {enabled, comparedRowIds, onCompare, onCancel},
    className,
}: HistoryComparisonActionsProps<T>) => {
    if (!enabled) return null;

    return (
        <Flex
            gap={3}
            alignItems="center"
            justifyContent="center"
            className={block(null, className)}
        >
            <Button onClick={onCancel} width="max">
                <Icon data={ArrowRotateRightIcon} size={16} />
            </Button>
            <Button
                view="action"
                onClick={onCompare}
                disabled={comparedRowIds.length < 2}
                width="max"
            >
                <Icon data={ArrowRightArrowLeftIcon} size={16} />
            </Button>
        </Flex>
    );
};
