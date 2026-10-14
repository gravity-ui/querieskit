import CircleCheckIcon from '@gravity-ui/icons/svgs/circle-check.svg';
import CircleExclamationIcon from '@gravity-ui/icons/svgs/circle-exclamation.svg';
import CirclePlayIcon from '@gravity-ui/icons/svgs/circle-play.svg';
import CircleStopIcon from '@gravity-ui/icons/svgs/circle-stop.svg';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import {Icon, IconData, Spin} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import {ProgressQueryStatuses} from '../../constants/query';
import {QueryStatus} from '../../types/history';
import type {QueryStatusIconProps as Props} from '../../types/queryStatusIconProps';
import './QueryStatusIcon.scss';
export type {QueryStatusIconProps as Props} from '../../types/queryStatusIconProps';

const STATUS_ICONS: Record<QueryStatus, IconData> = {
    completed: CircleCheckIcon,
    failed: CircleExclamationIcon,
    draft: FileIcon,
    aborted: CircleStopIcon,
    running: CirclePlayIcon,
};

const block = cn('qp-query-status-icon');

export const QueryStatusIcon: FC<Props> = ({status, className}) => {
    if (ProgressQueryStatuses.includes(status)) {
        return <Spin size="xs" />;
    }

    const statusIcon = STATUS_ICONS[status];
    if (!statusIcon) return <>{status}</>;

    return <Icon data={statusIcon} size={16} className={block({[status]: true}, className)} />;
};
