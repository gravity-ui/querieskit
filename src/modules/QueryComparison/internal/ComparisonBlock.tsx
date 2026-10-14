import React, {useId, useState} from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp, FileCode} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';
import {MonacoDiffEditor} from '../../../components/MonacoDiffEditor';
import type {CodeComparisonMode, CodeComparisonStats} from '../../../types/monacoDiffEditor';
import type {QueryComparisonItem} from '../../../types/queryComparison';
import i18n from '../i18n';
import './ComparisonBlock.scss';

const block = cn('qp-comparison-block');

type Props = {
    item: QueryComparisonItem;
    mode: CodeComparisonMode;
    readOnly: boolean;
    onChange?: (id: string, value: string | null) => void;
    maxHeight: number;
};

function fileStats(item: QueryComparisonItem, stats: CodeComparisonStats): CodeComparisonStats {
    if (!stats) return null;
    // Monaco represents an empty model with one line; an absent file has no lines.
    return {
        added: item.modified === null ? 0 : stats.added,
        removed: item.original === null ? 0 : stats.removed,
    };
}

export function ComparisonBlock({item, mode, readOnly, onChange, maxHeight}: Props) {
    const [collapsed, setCollapsed] = useState(false);
    const [diffStats, setStats] = useState<CodeComparisonStats>(null);
    const stats = fileStats(item, diffStats);
    const contentId = useId();
    const titleId = useId();
    const missingOriginal = item.original === null;
    const missingModified = item.modified === null;
    const missingSides = (['original', 'modified'] as const).filter((side) => item[side] === null);
    const canRestore = missingModified && !missingOriginal;
    const canRemove = missingOriginal && !missingModified;

    return (
        <section className={block()} aria-labelledby={titleId}>
            <Flex alignItems="center" gap={2} className={block('header')}>
                <Icon data={FileCode} size={16} />
                <Text id={titleId} ellipsis className={block('title')}>
                    {item.title}
                </Text>
                <Flex gap={1} shrink={0} className={block('stats')}>
                    {stats ? (
                        <>
                            <span className={block('added')}>+{stats.added}</span>
                            <span className={block('removed')}>−{stats.removed}</span>
                        </>
                    ) : (
                        <span title={i18n('value_pending')}>…</span>
                    )}
                </Flex>
                {!readOnly && onChange && (canRestore || canRemove) && (
                    <Button
                        view="flat-secondary"
                        size="s"
                        onClick={() => onChange(item.id, item.original)}
                    >
                        {i18n(canRestore ? 'action_restore' : 'action_remove')}
                    </Button>
                )}
                <Button
                    view="flat-secondary"
                    size="s"
                    aria-label={`${i18n(collapsed ? 'action_expand' : 'action_collapse')} ${item.title}`}
                    aria-expanded={!collapsed}
                    aria-controls={contentId}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <Icon data={collapsed ? ChevronDown : ChevronUp} size={16} />
                </Button>
            </Flex>
            <div id={contentId} hidden={collapsed}>
                <div className={block('content')}>
                    {mode === 'unified' &&
                        missingSides.map((side) => (
                            <Text key={side} color="secondary" className={block('notice')}>
                                {i18n(`value_missing-${side}`)}
                            </Text>
                        ))}
                    <MonacoDiffEditor
                        original={item.original ?? ''}
                        modified={item.modified ?? ''}
                        language={item.language}
                        mode={mode}
                        readOnly={readOnly || missingModified}
                        onChange={(value) => onChange?.(item.id, value)}
                        onDiffChange={setStats}
                        maxHeight={maxHeight}
                    />
                    {mode === 'split' &&
                        missingSides.map((side) => (
                            <Flex
                                key={side}
                                alignItems="center"
                                justifyContent="center"
                                className={block('missing', {side})}
                            >
                                <Text color="secondary">{i18n(`value_missing-${side}`)}</Text>
                            </Flex>
                        ))}
                </div>
            </div>
        </section>
    );
}
