import React from 'react';
import {QueryHistoryRow, QueryHistoryRowRenderData} from '../../types/history';
import {Checkbox, Flex, Text} from '@gravity-ui/uikit';
import './HistoryRow.scss';
import cn from 'bem-cn-lite';
import {HistoryPrivateIcon, QueryDuration, QueryStatusIcon} from '../../components';
import {HistoryRowHeader} from './HistoryRowHeader';
import {formatTime} from '../../helpers/time';
import {isFieldVisible} from '../../helpers/isFieldVisible';

export type Props<T extends QueryHistoryRow> = {
    item: T;
} & Omit<QueryHistoryRowRenderData<T>, 'item'>;

const block = cn('qp-history-row');

export const HistoryRow = <T extends QueryHistoryRow>({
    item,
    actions,
    isActive,
    editing,
    selection,
    visibleFields,
}: Props<T>) => {
    const {href, status, mode, startTime, endTime, engine, isPrivate} = item;
    const isSelectMode = Boolean(selection?.enabled);
    const isSelected = Boolean(isSelectMode && selection?.checked);
    const isEditing = Boolean(editing?.enabled);
    const linkMode = Boolean(item.href && !isEditing && !isSelectMode);

    const handleToggleSelect = (value: boolean) => {
        selection?.onChange?.(item, value);
    };

    const Wrap = linkMode ? 'a' : 'div';
    return (
        <Wrap href={href} className={block({[status]: true})}>
            {isSelectMode ? (
                <div
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <Checkbox checked={isSelected} onUpdate={handleToggleSelect} />
                </div>
            ) : (
                <QueryStatusIcon status={status} />
            )}
            <Flex
                direction="column"
                gap={isEditing ? undefined : 1}
                className={block('right-column')}
            >
                <HistoryRowHeader
                    item={item}
                    actions={actions}
                    isActive={isActive}
                    editing={editing}
                />
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
        </Wrap>
    );
};
