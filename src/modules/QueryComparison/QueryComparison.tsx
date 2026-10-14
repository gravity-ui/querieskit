import React, {useState} from 'react';
import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {QueryComparisonProps} from '../../types/queryComparison';
import type {CodeComparisonMode} from '../../types/monacoDiffEditor';
import {ComparisonBlock} from './internal/ComparisonBlock';
import i18n from './i18n';
import './QueryComparison.scss';

const block = cn('qp-query-comparison');

export function QueryComparison({
    items,
    onBlockChange,
    readOnly = !onBlockChange,
    mode: controlledMode,
    defaultMode = 'split',
    onModeChange,
    header,
    maxBlockHeight = 600,
    className,
}: QueryComparisonProps) {
    const [localMode, setLocalMode] = useState(defaultMode);
    const mode = controlledMode ?? localMode;
    return (
        <Flex direction="column" gap={3} className={block(null, className)}>
            <Flex gap={3} alignItems="center" wrap="wrap" className={block('toolbar')}>
                <Flex grow={1} gap={2} wrap="wrap" className={block('header')}>
                    {header}
                </Flex>
                <SegmentedRadioGroup
                    value={mode}
                    aria-label={i18n('title_mode')}
                    onUpdate={(value) => {
                        const next = value as CodeComparisonMode;
                        if (controlledMode === undefined) setLocalMode(next);
                        onModeChange?.(next);
                    }}
                >
                    <SegmentedRadioGroup.Option value="split">
                        {i18n('value_split')}
                    </SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="unified">
                        {i18n('value_unified')}
                    </SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
            </Flex>
            <Flex direction="column" gap={3} className={block('list')}>
                {items.length === 0 && <Text color="secondary">{i18n('value_empty')}</Text>}
                {items.map((item) => (
                    <ComparisonBlock
                        key={item.id}
                        item={item}
                        mode={mode}
                        readOnly={readOnly}
                        onChange={onBlockChange}
                        maxHeight={maxBlockHeight}
                    />
                ))}
            </Flex>
        </Flex>
    );
}
