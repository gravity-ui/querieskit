import {Label} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import type {QueryDurationProps as Props} from '../../types/queryDurationProps';
import './QueryDuration.scss';
import {useQueryDuration} from './useQueryDuration';
export type {QueryDurationProps as Props} from '../../types/queryDurationProps';

const block = cn('qp-query-duration');

export const QueryDuration: FC<Props> = ({startTime, endTime, status, className}) => {
    const duration = useQueryDuration(status, startTime, endTime);

    return <Label className={block(null, className)}>{duration}</Label>;
};
