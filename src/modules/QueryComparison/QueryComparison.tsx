import React, {useState} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {QueryComparisonProps} from '../../types/queryComparison';
import {ComparisonBlock} from './internal/ComparisonBlock';
import {ComparisonToolbar} from './internal/ComparisonToolbar';
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
    versionSelection,
    actions,
    maxBlockHeight = 600,
    className,
}: QueryComparisonProps) {
    const [localMode, setLocalMode] = useState(defaultMode);
    const mode = controlledMode ?? localMode;
    return (
        <Flex direction="column" gap={3} className={block(null, className)}>
            <ComparisonToolbar
                className={block('toolbar')}
                header={header}
                versionSelection={versionSelection}
                actions={actions}
                mode={mode}
                onModeChange={(next) => {
                    if (controlledMode === undefined) setLocalMode(next);
                    onModeChange?.(next);
                }}
            />
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
