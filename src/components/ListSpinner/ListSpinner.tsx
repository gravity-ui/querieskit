import {Flex, Spin} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import type {ListSpinnerProps} from '../../types/listSpinnerProps';
import './ListSpinner.scss';
export type {ListSpinnerProps} from '../../types/listSpinnerProps';

const block = cn('qp-list-spinner');

export const ListSpinner: FC<ListSpinnerProps> = ({className}) => {
    return (
        <Flex alignItems="center" justifyContent="center" className={block(null, className)}>
            <Spin size="m" />
        </Flex>
    );
};
