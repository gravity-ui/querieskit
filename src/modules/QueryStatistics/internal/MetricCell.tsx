import React from 'react';
import {
    ChartLine,
    ChevronDown,
    ChevronRight,
    CircleQuestion,
    FolderArrowRight,
} from '@gravity-ui/icons';
import {Button, Flex, Icon, Tooltip} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import type {QueryStatisticsItem} from '../../../types/queryStatistics';
import {type QueryStatisticsRow, isQueryStatisticsGroup} from '../helpers';
import i18n from '../i18n';

import './MetricCell.scss';

const block = cn('qp-query-statistics-metric-cell');

function MetricInfo({item}: {item: QueryStatisticsItem}) {
    const hasInfo = Boolean(item.description || item.unit);
    const content = (
        <span className={block('name')} tabIndex={hasInfo ? 0 : undefined}>
            {item.name}
            {hasInfo && <Icon data={CircleQuestion} size={14} className={block('info-icon')} />}
        </span>
    );

    if (!hasInfo) return content;

    return <Tooltip content={<MetricTooltip item={item} />}>{content}</Tooltip>;
}

function MetricTooltip({item}: {item: QueryStatisticsItem}) {
    return (
        <span className={block('tooltip')}>
            {item.description && (
                <span className={block('tooltip-row')}>
                    <span className={block('tooltip-label')}>{i18n('field_description')}</span>
                    <span>{item.description}</span>
                </span>
            )}
            {item.unit && (
                <span className={block('tooltip-row')}>
                    <span className={block('tooltip-label')}>{i18n('field_unit')}</span>
                    <span>{item.unit}</span>
                </span>
            )}
        </span>
    );
}

function Indent({level}: {level: number}) {
    if (!level) return null;
    return (
        <span className={block('indent')} aria-hidden="true">
            {Array.from({length: level}, (_, index) => (
                <span className={block('indent-step')} key={index} />
            ))}
        </span>
    );
}

export type MetricCellProps = {
    row: QueryStatisticsRow;
    expanded: boolean;
    onToggle: (id: string) => void;
};

export function MetricCell({row, expanded, onToggle}: MetricCellProps) {
    const {item, level} = row;
    const isGroup = isQueryStatisticsGroup(item);

    return (
        <Flex alignItems="center" gap={2} className={block()}>
            <Indent level={level} />
            {isGroup ? (
                <React.Fragment>
                    <Button
                        view="flat"
                        size="xs"
                        aria-label={
                            expanded ? i18n('action_collapse-group') : i18n('action_expand-group')
                        }
                        aria-expanded={expanded}
                        onClick={() => onToggle(item.id)}
                        className={block('row-button')}
                    >
                        <Icon data={expanded ? ChevronDown : ChevronRight} size={16} />
                    </Button>
                    <Icon data={FolderArrowRight} size={16} className={block('row-icon')} />
                </React.Fragment>
            ) : (
                <Icon data={ChartLine} size={16} className={block('row-icon')} />
            )}
            <MetricInfo item={item} />
        </Flex>
    );
}
