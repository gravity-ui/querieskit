import React, {useState} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {Column} from '../../components/DataTable';
import {EmptyContent} from '../../components/EmptyContent';
import {SkeletonRows} from '../../components/SkeletonRows';
import {SearchWithButtons} from '../../components/SearchWithButtons';
import type {NavigationViewConfig, NavigationViewRow} from '../../types/navigation';
import {NavigationViewSectionItem} from './internal/NavigationViewSectionItem';
import i18n from './i18n';
import './NavigationView.scss';

const block = cn('qp-navigation-view');

export type NavigationViewViewConfig<TRow extends NavigationViewRow = NavigationViewRow> = {
    tableColumns?: Array<Column<TRow>>;
    extraColumns?: Array<Column<TRow>>;
};

export type NavigationViewProps<TRow extends NavigationViewRow = NavigationViewRow> = {
    data: NavigationViewConfig<TRow>;
    view?: NavigationViewViewConfig<TRow>;
    search?: string;
    onSearchUpdate?: (value: string) => void;
    searchPlaceholder?: string;
    className?: string;
};

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
