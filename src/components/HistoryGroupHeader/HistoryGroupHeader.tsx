import {Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import type {HistoryGroupHeaderProps as Props} from '../../types/historyGroupHeaderProps';
import './HistoryGroupHeader.scss';
export type {HistoryGroupHeaderProps as Props} from '../../types/historyGroupHeaderProps';

const block = cn('qp-history-list-header');

export const HistoryGroupHeader: FC<Props> = ({title}) => {
    return (
        <Text as="div" color="secondary" className={block()}>
            {title}
        </Text>
    );
};
