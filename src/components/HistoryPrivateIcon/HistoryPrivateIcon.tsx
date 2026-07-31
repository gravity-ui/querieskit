import React, {FC} from 'react';
import {Icon} from '@gravity-ui/uikit';
import LockIcon from '@gravity-ui/icons/svgs/lock.svg';
import LockOpenIcon from '@gravity-ui/icons/svgs/lock-open.svg';
import './HistoryPrivateIcon.scss';
import cn from 'bem-cn-lite';

type Props = {
    isPrivate?: boolean;
};

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
