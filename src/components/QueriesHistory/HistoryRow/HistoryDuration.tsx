import React, {FC} from 'react';
import {QueryStatus} from '../../../types/history';
import {Label} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './HistoryDuration.scss';
import {useQueryDuration} from '../hooks/useQueryDuration';

type Props = {
    startTime: string | number;
    endTime?: string | number;
    status: QueryStatus;
    className?: string;
};

const block = cn('qp-query-history-duration');

export const HistoryDuration: FC<Props> = ({startTime, endTime, status, className}) => {
    const duration = useQueryDuration(status, startTime, endTime);

    return <Label className={block(null, className)}>{duration}</Label>;
};
