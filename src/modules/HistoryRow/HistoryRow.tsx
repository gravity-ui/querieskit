import React from 'react';
import {QueryListRowRenderData} from '../../types/queryList';
import {QueryHistoryRow} from '../../types/history';
import {Flex, Text} from '@gravity-ui/uikit';
import './HistoryRow.scss';
import cn from 'bem-cn-lite';
import {
    EditableRowTitle,
    HistoryPrivateIcon,
    QueryDuration,
    QueryStatusIcon,
    RowActionsMenu,
    RowLink,
} from '../../components';
import {formatTime} from '../../helpers/time';
import {isFieldVisible} from '../../helpers/isFieldVisible';

export type Props<T extends QueryHistoryRow> = {
    item: T;
} & Omit<QueryListRowRenderData<T>, 'item' | 'variant'>;

const block = cn('qp-history-row');

export const HistoryRow = <T extends QueryHistoryRow>({
    item,
    actions,
    isActive,
    comparison,
    editing,
    visibleFields,
}: Props<T>) => {
    const {href, status, mode, startTime, endTime, engine, isPrivate} = item;
    const isEditing = Boolean(editing?.enabled);
    const isComparisonMode = Boolean(comparison?.enabled);
    const isChecked = Boolean(comparison?.checked);
    const showMenu = isActive && Boolean(actions?.length) && !isComparisonMode;

    return (
        <RowLink
            href={href}
            disabled={isEditing || isComparisonMode}
            className={block({[status]: true, compared: isChecked})}
        >
            <QueryStatusIcon status={status} />
            <Flex direction="column" gap={1} className={block('right-column')}>
                <Flex justifyContent="space-between" className={block('header')}>
                    <EditableRowTitle item={item} editing={editing} />
                    {showMenu && <RowActionsMenu item={item} actions={actions} />}
                </Flex>
                <div className={block('data')}>
                    {isFieldVisible(visibleFields, 'duration') && startTime && (
                        <QueryDuration
                            className={block('duration')}
                            status={status}
                            startTime={startTime}
                            endTime={endTime}
                        />
                    )}
                    <Flex gap={2}>
                        {isFieldVisible(visibleFields, 'mode') && mode && (
                            <Text color="complementary">{mode}</Text>
                        )}
                        {isFieldVisible(visibleFields, 'startTime') && startTime && (
                            <Text color="complementary">{formatTime(startTime)}</Text>
                        )}
                        {isFieldVisible(visibleFields, 'engine') && engine && (
                            <Text color="complementary">{engine}</Text>
                        )}
                        {isFieldVisible(visibleFields, 'isPrivate') && (
                            <HistoryPrivateIcon isPrivate={isPrivate} />
                        )}
                    </Flex>
                </div>
            </Flex>
        </RowLink>
    );
};
