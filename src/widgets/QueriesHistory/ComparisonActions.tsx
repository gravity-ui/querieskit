import React from 'react';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import {QueryHistoryComparisonConfig, QueryHistoryRow} from '../../types/history';
import ArrowRotateRightIcon from '@gravity-ui/icons/svgs/arrow-rotate-right.svg';
import ArrowRightArrowLeftIcon from '@gravity-ui/icons/svgs/arrow-right-arrow-left.svg';
import './ComparisonActions.scss';
import cn from 'bem-cn-lite';

type Props<T extends QueryHistoryRow> = {
    comparison: QueryHistoryComparisonConfig<T>;
    className?: string;
};

const block = cn('qp-query-history-comparison-action');

export const ComparisonActions = <T extends QueryHistoryRow>({
    comparison: {enabled, comparedRowIds, onCompare, onCancel},
    className,
}: Props<T>) => {
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
