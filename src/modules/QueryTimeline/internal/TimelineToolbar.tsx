import React from 'react';
import {Button, Flex, Icon, Select, TextInput} from '@gravity-ui/uikit';
import {MagnifierMinus, MagnifierPlus} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';
import type {QueryTimelineRange} from '../../../types/queryTimeline';
import i18n from '../i18n';
import './TimelineToolbar.scss';

const block = cn('qp-timeline-toolbar');

export function TimelineToolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    options,
    range,
    fullRange,
    onRangeChange,
    canExpand,
    allExpanded,
    onToggleAll,
    showSearch = true,
    showStatusFilter = true,
    showRangeSelector = true,
}: {
    search: string;
    onSearchChange: (value: string) => void;
    status?: string;
    onStatusChange: (value: string | undefined) => void;
    options: {value: string; content: string}[];
    range?: QueryTimelineRange;
    fullRange?: QueryTimelineRange;
    onRangeChange: (value: QueryTimelineRange) => void;
    canExpand: boolean;
    allExpanded: boolean;
    onToggleAll: () => void;
    showSearch?: boolean;
    showStatusFilter?: boolean;
    showRangeSelector?: boolean;
}) {
    return (
        <Flex gap={2} wrap alignItems="center" className={block()}>
            {showSearch && (
                <TextInput
                    className={block('search')}
                    value={search}
                    onUpdate={onSearchChange}
                    hasClear
                    placeholder={i18n('field_search')}
                    aria-label={i18n('field_search')}
                />
            )}
            {showStatusFilter && (
                <Select
                    value={status === undefined ? [] : [status]}
                    options={options}
                    onUpdate={(values) => onStatusChange(values[0])}
                    hasClear
                    placeholder={i18n('field_status')}
                    aria-label={i18n('field_status')}
                    width={230}
                />
            )}
            <Button
                disabled={!fullRange}
                onClick={() => {
                    if (fullRange) onRangeChange(fullRange);
                }}
            >
                {i18n('action_fit-all')}
            </Button>
            {showRangeSelector &&
                [0.5, 2].map((factor) => (
                    <Button
                        key={factor}
                        disabled={!range}
                        view="flat"
                        aria-label={i18n(factor < 1 ? 'action_zoom-in' : 'action_zoom-out')}
                        title={i18n(factor < 1 ? 'action_zoom-in' : 'action_zoom-out')}
                        onClick={() => {
                            if (!range) return;
                            const middle = (range.from + range.to) / 2;
                            const half = ((range.to - range.from) * factor) / 2;
                            onRangeChange({from: middle - half, to: middle + half});
                        }}
                    >
                        <Icon data={factor < 1 ? MagnifierPlus : MagnifierMinus} size={16} />
                    </Button>
                ))}
            <Button disabled={!canExpand} onClick={onToggleAll}>
                {i18n(allExpanded ? 'action_collapse-all' : 'action_expand-all')}
            </Button>
        </Flex>
    );
}
