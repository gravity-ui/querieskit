import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useState} from 'react';
import {EmptyContent} from '../../components/EmptyContent';
import {SearchWithButtons} from '../../components/SearchWithButtons';
import {SkeletonRows} from '../../components/SkeletonRows';
import type {NavigationViewRow} from '../../types/navigation';
import type {NavigationViewProps} from '../../types/navigationViewProps';
import i18n from './i18n';
import {NavigationViewSectionItem} from './internal/NavigationViewSectionItem';
import './NavigationView.scss';
export type {NavigationViewProps, NavigationViewViewConfig} from '../../types/navigationViewProps';

const block = cn('qp-navigation-view');

export function NavigationView<TRow extends NavigationViewRow = NavigationViewRow>({
    data,
    view,
    search: searchProp,
    onSearchUpdate,
    searchPlaceholder,
    className,
}: NavigationViewProps<TRow>) {
    const {sections, loading, loaded, errorContent} = data;
    const {tableColumns, extraColumns} = view ?? {};
    const [searchState, setSearchState] = useState('');
    const search = searchProp ?? searchState;

    const handleSearchUpdate = (value: string) => {
        if (searchProp === undefined) {
            setSearchState(value);
        }
        onSearchUpdate?.(value);
    };

    if (errorContent) {
        return (
            <Text color="danger" className={block('error')}>
                {errorContent}
            </Text>
        );
    }

    let content: React.ReactNode;
    if (loading && !loaded) {
        content = <SkeletonRows rowClassName={block('skeleton-row')} />;
    } else if (sections.length === 0) {
        content = <EmptyContent variant="no-data" className={block('empty')} />;
    } else {
        content = sections.map((section) => (
            <NavigationViewSectionItem<TRow>
                key={section.id}
                section={section}
                search={search}
                tableColumns={tableColumns}
                extraColumns={extraColumns}
            />
        ));
    }

    return (
        <Flex direction="column" gap={2} className={block(null, className)}>
            <SearchWithButtons
                value={search}
                onUpdate={handleSearchUpdate}
                placeholder={searchPlaceholder ?? i18n('field_search-placeholder')}
            />
            {content}
        </Flex>
    );
}
