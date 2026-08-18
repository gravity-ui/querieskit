import React, {FC} from 'react';
import {Flex, Spin} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './ListSpinner.scss';

const block = cn('qp-list-spinner');

export type ListSpinnerProps = {
    className?: string;
};

/** Centered loading indicator for list-like modules (`ClustersList`, `NavigationItemsList`, etc). */
export const ListSpinner: FC<ListSpinnerProps> = ({className}) => {
    return (
        <Flex alignItems="center" justifyContent="center" className={block(null, className)}>
            <Spin size="m" />
        </Flex>
    );
};
