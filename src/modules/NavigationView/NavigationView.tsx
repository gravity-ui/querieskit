import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {type Column, EmptyContent, SkeletonRows} from '../../components';
import type {NavigationViewConfig, NavigationViewRow} from '../../types/navigation';
import {NavigationViewSectionItem} from './internal/NavigationViewSectionItem';
import './NavigationView.scss';

const block = cn('qp-navigation-view');

export type NavigationViewViewConfig<TRow extends NavigationViewRow = NavigationViewRow> = {
    tableColumns?: Array<Column<TRow>>;
    extraColumns?: Array<Column<TRow>>;
};

export type NavigationViewProps<TRow extends NavigationViewRow = NavigationViewRow> = {
    data: NavigationViewConfig<TRow>;
    view?: NavigationViewViewConfig<TRow>;
    className?: string;
};

export function NavigationView<TRow extends NavigationViewRow = NavigationViewRow>({
    data,
    view,
    className,
}: NavigationViewProps<TRow>) {
    const {sections, loading, loaded, errorContent} = data;
    const {tableColumns, extraColumns} = view ?? {};

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

    if (sections.length === 0) {
        return <EmptyContent variant="no-data" className={block('empty')} />;
    }

    return (
        <Flex direction="column" gap={2} className={block(null, className)}>
            {sections.map((section) => (
                <NavigationViewSectionItem<TRow>
                    key={section.id}
                    section={section}
                    tableColumns={tableColumns}
                    extraColumns={extraColumns}
                />
            ))}
        </Flex>
    );
}
