import React, {useMemo} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {EmptyContent, SkeletonRows} from '../../components';
import type {NavigationMetaConfig, NavigationMetaItem} from '../../types/navigation';
import {buildMetaGroups} from './helpers/buildMetaGroups';
import i18n from './i18n';
import './NavigationMeta.scss';

const block = cn('qp-navigation-meta');

export type NavigationMetaViewConfig<TItem extends NavigationMetaItem = NavigationMetaItem> = {
    render?: (data: NavigationMetaConfig<TItem>) => React.ReactNode;
    extraContent?: React.ReactNode;
};

export type NavigationMetaProps<TItem extends NavigationMetaItem = NavigationMetaItem> = {
    data: NavigationMetaConfig<TItem>;
    view?: NavigationMetaViewConfig<TItem>;
    className?: string;
};

export function NavigationMeta<TItem extends NavigationMetaItem = NavigationMetaItem>({
    data,
    view,
    className,
}: NavigationMetaProps<TItem>) {
    const {groups, loading, loaded, errorContent} = data;
    const {render, extraContent} = view ?? {};

    const preparedGroups = useMemo(() => buildMetaGroups(groups, i18n), [groups]);

    if (render) {
        return <div className={block(null, className)}>{render(data)}</div>;
    }

    if (errorContent) {
        return (
            <Text color="danger" className={block('error')}>
                {errorContent}
            </Text>
        );
    }

    if (loading && !loaded) {
        return (
            <SkeletonRows className={block(null, className)} rowClassName={block('skeleton-row')} />
        );
    }

    const isEmpty = preparedGroups.every((group) => group.items.length === 0);

    if (isEmpty && !extraContent) {
        return <EmptyContent variant="no-data" className={block('empty')} />;
    }

    return (
        <Flex direction="column" gap={4} className={block(null, className)}>
            {preparedGroups.map((group, groupIndex) =>
                group.items.length === 0 ? null : (
                    <div key={groupIndex} className={block('group')}>
                        {group.title ? (
                            <Text variant="subheader-1" className={block('group-title')}>
                                {group.title}
                            </Text>
                        ) : null}
                        <div className={block('group-body')}>
                            {group.items.map(({name, value}) => (
                                <>
                                    <Text color="secondary">{name}</Text>
                                    <div>{value}</div>
                                </>
                            ))}
                        </div>
                    </div>
                ),
            )}
            {extraContent}
        </Flex>
    );
}
