import React from 'react';
import {Button, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronRight, SquareDashed} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';
import type {
    QueryTimelineEventContext,
    QueryTimelineProps,
    QueryTimelineStatus,
} from '../../../types/queryTimeline';
import {type TimelineRow, progressFraction} from '../helpers/model';
import {TimelineDetails} from './TimelineDetails';
import i18n from '../i18n';
import './TimelineItemRow.scss';

const block = cn('qp-timeline-item-row');

export function TimelineItemRow({
    row,
    status,
    expanded,
    onToggle,
    onFit,
    renderItemLabel,
    renderItemStatus,
    onItemClick,
    onEventClick,
    formatDuration,
    timeZone,
    className,
}: {
    row: TimelineRow;
    status?: QueryTimelineStatus;
    expanded: boolean;
    onToggle: () => void;
    onFit: () => void;
    formatDuration: (milliseconds: number) => string;
    className?: string;
} & Pick<
    QueryTimelineProps,
    'renderItemLabel' | 'renderItemStatus' | 'onItemClick' | 'onEventClick' | 'timeZone'
>) {
    const {item, stage} = row;
    const context = {item, stage};
    const fraction = progressFraction(item.progress);
    const statusContent = stage ? null : (
        <Flex alignItems="center" gap={1}>
            {status?.icon}
            <Text ellipsis>
                {status?.label ?? item.status ?? '—'}
                {fraction === undefined ? '' : `: ${Math.floor(fraction * 100)}%`}
            </Text>
        </Flex>
    );
    const label = stage?.label ?? item.label;
    const labelContent = (
        <TimelineItemLabel
            item={item}
            stage={stage}
            onItemClick={onItemClick}
            onEventClick={onEventClick}
        />
    );

    return (
        <Flex
            alignItems="center"
            gap={1}
            className={block({stage: Boolean(stage)}, className)}
            role="listitem"
            data-row-id={row.id}
        >
            <div className={block('status')}>
                {renderItemStatus
                    ? renderItemStatus({...context, defaultContent: statusContent})
                    : statusContent}
            </div>
            <div className={block('label')}>
                {renderItemLabel
                    ? renderItemLabel({...context, defaultContent: labelContent})
                    : labelContent}
            </div>
            <div className={block('accessible-details')}>
                <TimelineDetails
                    row={row}
                    status={status}
                    formatDuration={formatDuration}
                    timeZone={timeZone}
                />
            </div>
            <Button
                view="flat"
                size="s"
                disabled={!row.interval}
                title={i18n('action_fit-item')}
                aria-label={`${i18n('action_fit-item')}: ${label}`}
                onClick={onFit}
            >
                <Icon data={SquareDashed} size={16} />
            </Button>
            {!stage && Boolean(item.stages?.length) && (
                <Button
                    view="flat"
                    size="s"
                    aria-expanded={expanded}
                    title={i18n(expanded ? 'action_collapse' : 'action_expand')}
                    aria-label={`${i18n(expanded ? 'action_collapse' : 'action_expand')}: ${label}`}
                    onClick={onToggle}
                >
                    <Icon data={expanded ? ChevronDown : ChevronRight} size={16} />
                </Button>
            )}
        </Flex>
    );
}

function TimelineItemLabel({
    item,
    stage,
    onItemClick,
    onEventClick,
}: QueryTimelineEventContext & Pick<QueryTimelineProps, 'onItemClick' | 'onEventClick'>) {
    const context = {item, stage};
    const label = stage?.label ?? item.label;
    let labelContent: React.ReactNode = (
        <Text ellipsis title={label}>
            {label}
        </Text>
    );
    if ((!stage && onItemClick) || onEventClick) {
        labelContent = (
            <Button
                view="flat"
                size="s"
                onClick={(event) => {
                    if (!stage) onItemClick?.(item, event);
                    onEventClick?.(context);
                }}
            >
                {label}
            </Button>
        );
    }
    if (item.href && !stage) {
        labelContent = (
            <Link href={item.href} onClick={(event) => onItemClick?.(item, event)}>
                {label}
            </Link>
        );
    }

    return labelContent;
}
