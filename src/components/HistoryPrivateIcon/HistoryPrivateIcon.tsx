import LockOpenIcon from '@gravity-ui/icons/svgs/lock-open.svg';
import LockIcon from '@gravity-ui/icons/svgs/lock.svg';
import {Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import type {HistoryPrivateIconProps as Props} from '../../types/historyPrivateIconProps';
import './HistoryPrivateIcon.scss';
export type {HistoryPrivateIconProps as Props} from '../../types/historyPrivateIconProps';

const block = cn('qp-history-private-icon');

export const HistoryPrivateIcon: FC<Props> = ({isPrivate}) => {
    return (
        <Icon
            data={isPrivate ? LockIcon : LockOpenIcon}
            size={16}
            className={block({open: !isPrivate})}
        />
    );
};
