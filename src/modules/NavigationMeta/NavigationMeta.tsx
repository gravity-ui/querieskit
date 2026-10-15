import {DefinitionList, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useMemo} from 'react';
import {EmptyContent} from '../../components/EmptyContent';
import {SkeletonRows} from '../../components/SkeletonRows';
import type {NavigationMetaItem} from '../../types/navigation';
import type {NavigationMetaProps} from '../../types/navigationMetaProps';
import {buildMetaGroups} from './helpers/buildMetaGroups';
import i18n from './i18n';
import './NavigationMeta.scss';
export type {NavigationMetaProps, NavigationMetaViewConfig} from '../../types/navigationMetaProps';

const block = cn('qp-navigation-meta');

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
                        <DefinitionList nameMaxWidth={200} className={block('group-body')}>
                            {group.items.map(({name, value}, itemIndex) => (
                                <DefinitionList.Item key={itemIndex} name={name}>
                                    {value}
                                </DefinitionList.Item>
                            ))}
                        </DefinitionList>
                    </div>
                ),
            )}
            {extraContent}
        </Flex>
    );
}
