import React, {FC} from 'react';
import {QueryStatus} from '../../types/history';
import {Label} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './QueryDuration.scss';
import {useQueryDuration} from './useQueryDuration';

type Props = {
    startTime: string | number;
    endTime?: string | number;
    status: QueryStatus;
    className?: string;
};

const block = cn('qp-query-duration');

export const QueryDuration: FC<Props> = ({startTime, endTime, status, className}) => {
    const duration = useQueryDuration(status, startTime, endTime);

    return <Label className={block(null, className)}>{duration}</Label>;
};
