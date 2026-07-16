import React, {FC} from 'react';
import {Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './HistoryGroupHeader.scss';

type Props = {
    title: string;
};

const block = cn('qp-history-list-header');

export const HistoryGroupHeader: FC<Props> = ({title}) => {
    return (
        <Text as="div" color="secondary" className={block()}>
            {title}
        </Text>
    );
};
