import React, {FC} from 'react';
import {Flex, Skeleton} from '@gravity-ui/uikit';

export type SkeletonRowsProps = {
    count?: number;
    className?: string;
    rowClassName?: string;
};

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
