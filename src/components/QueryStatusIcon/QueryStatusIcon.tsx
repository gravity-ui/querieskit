import React, {FC} from 'react';
import {Icon, IconData, Spin} from '@gravity-ui/uikit';
import CircleCheckIcon from '@gravity-ui/icons/svgs/circle-check.svg';
import CircleExclamationIcon from '@gravity-ui/icons/svgs/circle-exclamation.svg';
import FileIcon from '@gravity-ui/icons/svgs/file.svg';
import CircleStopIcon from '@gravity-ui/icons/svgs/circle-stop.svg';
import CirclePlayIcon from '@gravity-ui/icons/svgs/circle-play.svg';
import {QueryStatus} from '../../types/history';
import cn from 'bem-cn-lite';
import './QueryStatusIcon.scss';
import {ProgressQueryStatuses} from '../../constants/query';

type Props = {
    status: QueryStatus;
};

const STATUS_ICONS: Record<QueryStatus, IconData> = {
    completed: CircleCheckIcon,
    failed: CircleExclamationIcon,
    draft: FileIcon,
    aborted: CircleStopIcon,
    running: CirclePlayIcon,
};

const block = cn('qp-query-status-icon');

export const QueryStatusIcon: FC<Props> = ({status}) => {
    if (ProgressQueryStatuses.includes(status)) {
        return <Spin size="xs" />;
    }

    const statusIcon = STATUS_ICONS[status];
    if (!statusIcon) return <>{status}</>;

    return <Icon data={statusIcon} size={16} className={block({[status]: true})} />;
};
