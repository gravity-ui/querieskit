import React from 'react';
import {QueryHistoryRow, QueryHistoryRowRenderData} from '../../../types/history';
import {Checkbox, Flex, Text} from '@gravity-ui/uikit';
import './HistoryRow.scss';
import cn from 'bem-cn-lite';
import {QueryStatusIcon} from './QueryStatusIcon';
import {formatTime} from '../../../helpers/time';
import {HistoryDuration} from './HistoryDuration';
import {HistoryRowHeader} from './HistoryRowHeader';

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
}: Props<T>) => {
    const isSelectMode = Boolean(selection?.enabled);
    const isSelected = Boolean(isSelectMode && selection?.checked);
    const isEditing = Boolean(editing?.enabled);
    const linkMode = Boolean(item.href && !isEditing && !isSelectMode);

    const handleToggleSelect = (value: boolean) => {
        selection?.onChange?.(item, value);
    };

    const Wrap = linkMode ? 'a' : 'div';
    return (
        <Wrap href={item.href} className={block({[item.status]: true})}>
            {isSelectMode ? (
                <div
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <Checkbox checked={isSelected} onUpdate={handleToggleSelect} />
                </div>
            ) : (
                <QueryStatusIcon status={item.status} />
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
