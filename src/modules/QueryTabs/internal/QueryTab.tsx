import React, {useId} from 'react';
import {Button, Flex, Icon, Tab, type TabComponentProps} from '@gravity-ui/uikit';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import ArrowRightArrowLeftIcon from '@gravity-ui/icons/svgs/arrow-right-arrow-left.svg';
import cn from 'bem-cn-lite';
import {QueryStatusIcon} from '../../../components/QueryStatusIcon';
import type {QueryTabItem} from '../../../types/queryTabs';
import {QueryTabButton} from './QueryTabButton';
import i18n from '../i18n';
import './QueryTab.scss';

const block = cn('qp-query-tab');

// UIKit's forwardRef declaration loses the generic for its public component override.
const StripTab = Tab as unknown as React.ComponentType<TabComponentProps<typeof QueryTabButton>>;

type Props = {
    item: QueryTabItem;
    active: boolean;
    closable: boolean;
    onSelect: (id: string) => void;
    onClose: (id: string) => void;
};

export function QueryTab({item, active, closable, onSelect, onClose}: Props) {
    const descriptionId = useId();
    const modified = item.type === 'query' && item.isModified;
    const replaceClose = modified && !active && closable;
    const title =
        item.type === 'query'
            ? item.title
            : i18n('title_comparison', {leftTitle: item.leftTitle, rightTitle: item.rightTitle});
    const description =
        item.type === 'query' ? i18n(`value_${item.status}`) : i18n('context_comparison');

    return (
        <Flex
            role="presentation"
            alignItems="center"
            gap={2}
            shrink={0}
            className={block({active, 'replace-close': replaceClose})}
            data-query-tab-id={item.id}
        >
            <StripTab
                component={QueryTabButton}
                value={item.id}
                title={title}
                aria-label={title}
                aria-describedby={descriptionId}
                className={block('select')}
                onKeyDown={(event) => {
                    // UIKit also selects on keydown. Suppress its handler and the native click
                    // so keyboard activation emits exactly one change.
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        if (!event.repeat) onSelect(item.id);
                    }
                }}
            >
                <Flex alignItems="center" gap={2} className={block('heading')}>
                    {item.type === 'comparison' ? (
                        <>
                            <span className={block('title')} title={item.leftTitle}>
                                {item.leftTitle}
                            </span>
                            <span aria-hidden="true" className={block('icon')}>
                                <Icon data={ArrowRightArrowLeftIcon} size={16} />
                            </span>
                            <span className={block('title')} title={item.rightTitle}>
                                {item.rightTitle}
                            </span>
                        </>
                    ) : (
                        <>
                            {item.status !== 'draft' && (
                                <span aria-hidden="true" className={block('icon')}>
                                    <QueryStatusIcon status={item.status} />
                                </span>
                            )}
                            <span className={block('title')}>{item.title}</span>
                        </>
                    )}
                </Flex>
            </StripTab>
            <span id={descriptionId} className={block('description')}>
                {description}
                {modified ? `. ${i18n('context_modified')}` : ''}
            </span>
            {(modified || closable) && (
                <Flex alignItems="center" gap={2} shrink={0} className={block('trailing')}>
                    {modified && (
                        <span
                            aria-hidden="true"
                            title={i18n('context_modified')}
                            className={block('modified')}
                        />
                    )}
                    {closable && (
                        <Button
                            view="flat-secondary"
                            size="xs"
                            className={block('close')}
                            aria-label={i18n('action_close-tab', {title})}
                            title={i18n('action_close-tab', {title})}
                            onClick={(event) => {
                                event.stopPropagation();
                                onClose(item.id);
                            }}
                            // The TabList keyboard handler must only receive events from tabs.
                            onKeyDown={(event) => event.stopPropagation()}
                        >
                            <Icon data={XmarkIcon} size={12} />
                        </Button>
                    )}
                </Flex>
            )}
        </Flex>
    );
}
