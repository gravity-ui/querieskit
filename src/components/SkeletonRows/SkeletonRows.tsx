import {Flex, Skeleton} from '@gravity-ui/uikit';
import React, {FC} from 'react';
import type {SkeletonRowsProps} from '../../types/skeletonRowsProps';
export type {SkeletonRowsProps} from '../../types/skeletonRowsProps';

const DEFAULT_ROWS_COUNT = 4;

export const SkeletonRows: FC<SkeletonRowsProps> = ({
    count = DEFAULT_ROWS_COUNT,
    className,
    rowClassName,
}) => {
    return (
        <Flex direction="column" gap={2} className={className}>
            {Array.from({length: count}, (_, index) => (
                <Skeleton key={index} className={rowClassName} />
            ))}
        </Flex>
    );
};
