import React from 'react';
import {QueryHistoryRow, QueryHistoryRowAction} from '../../../types/history';
import {Flex, Text} from '@gravity-ui/uikit';
import './HistoryRow.scss';
import cn from 'bem-cn-lite';
import {QueryStatusIcon} from './QueryStatusIcon';
import {HistoryRowMenu} from './HistoryRowMenu';
import {formatTime} from '../../../helpers/time';
import {HistoryDuration} from './HistoryDuration';

export type Props<T extends QueryHistoryRow> = {
    item: T;
    isActive: boolean;
    actions?: QueryHistoryRowAction<T>[];
};

const block = cn('qp-history-row');

export const HistoryRow = <T extends QueryHistoryRow>({item, actions, isActive}: Props<T>) => {
    const Wrap = item.href ? 'a' : 'div';

    return (
        <Wrap href={item.href} className={block({[item.status]: true})}>
            <QueryStatusIcon status={item.status} />
            <Flex direction="column" gap={1} gapRow={1} className={block('right-column')}>
                <Flex justifyContent="space-between" className={block('title')}>
                    <Text variant="subheader-1" ellipsis>
                        {item.title}
                    </Text>
                    {isActive && <HistoryRowMenu row={item} actions={actions} />}
                </Flex>
                <div className={block('data')}>
                    <HistoryDuration
                        className={block('duration')}
                        status={item.status}
                        startTime={item.startTime}
                        endTime={item.endTime}
                    />
                    <Text color="secondary" ellipsis>
                        {formatTime(item.startTime) || '-'} {item.engine}
                    </Text>
                </div>
            </Flex>
        </Wrap>
    );
};
