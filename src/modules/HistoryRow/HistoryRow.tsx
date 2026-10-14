import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {EditableRowTitle} from '../../components/EditableRowTitle';
import {HistoryPrivateIcon} from '../../components/HistoryPrivateIcon';
import {QueryDuration} from '../../components/QueryDuration';
import {QueryStatusIcon} from '../../components/QueryStatusIcon';
import {RowActionsMenu} from '../../components/RowActionsMenu';
import {RowLink} from '../../components/RowLink';
import {isFieldVisible} from '../../helpers/isFieldVisible';
import {formatTime} from '../../helpers/time';
import type {QueryHistoryRow} from '../../types/history';
import type {HistoryRowProps as Props} from '../../types/historyRowProps';
import './HistoryRow.scss';
export type {HistoryRowProps as Props} from '../../types/historyRowProps';

const block = cn('qp-history-row');

export const HistoryRow = <T extends QueryHistoryRow>({
    item,
    actions,
    isActive,
    comparison,
    editing,
    visibleFields,
    renderLink,
}: Props<T>) => {
    const {href, status, mode, startTime, endTime, engine, isPrivate} = item;
    const isEditing = Boolean(editing?.enabled);
    const isComparisonMode = Boolean(comparison?.enabled);
    const isChecked = Boolean(comparison?.checked);
    const hasMenu = Boolean(actions?.length) && !isComparisonMode;

    return (
        <RowLink
            href={href}
            disabled={isEditing || isComparisonMode}
            renderLink={renderLink}
            className={block({[status]: true, compared: isChecked})}
        >
            <QueryStatusIcon status={status} />
            <Flex direction="column" gap={1} className={block('right-column')}>
                <Flex gap={1} className={block('header')}>
                    <Flex className={block('title')}>
                        <EditableRowTitle item={item} editing={editing} />
                    </Flex>
                    {hasMenu && (
                        <div className={block('actions')}>
                            {isActive && <RowActionsMenu item={item} actions={actions} />}
                        </div>
                    )}
                </Flex>
                <div className={block('data')}>
                    {isFieldVisible<QueryHistoryRow>(visibleFields, 'duration') &&
                        startTime !== undefined && (
                            <QueryDuration
                                className={block('duration')}
                                status={status}
                                startTime={startTime}
                                endTime={endTime}
                            />
                        )}
                    <Flex gap={2}>
                        {isFieldVisible<QueryHistoryRow>(visibleFields, 'mode') && mode && (
                            <Text color="complementary">{mode}</Text>
                        )}
                        {isFieldVisible<QueryHistoryRow>(visibleFields, 'startTime') &&
                            startTime !== undefined && (
                                <Text color="complementary">{formatTime(startTime)}</Text>
                            )}
                        {isFieldVisible<QueryHistoryRow>(visibleFields, 'engine') && engine && (
                            <Text color="complementary">{engine}</Text>
                        )}
                        {isFieldVisible<QueryHistoryRow>(visibleFields, 'isPrivate') && (
                            <HistoryPrivateIcon isPrivate={isPrivate} />
                        )}
                    </Flex>
                </div>
            </Flex>
        </RowLink>
    );
};
