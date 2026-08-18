import React from 'react';
import {
    NavigationMeta,
    NavigationPreview,
    NavigationSchema,
    NavigationView,
} from '../../../modules';
import type {
    NavigationDetailConfig,
    NavigationDetailConfigFactory,
    NavigationItem,
    NavigationMetaConfig,
    NavigationMetaItem,
    NavigationPreviewConfig,
    NavigationPreviewRow,
    NavigationSchemaColumn,
    NavigationSchemaConfig,
    NavigationViewConfig,
} from '../../../types/navigation';
import i18n from '../i18n';

export type NavigationSchemaResolver<
    TItem extends NavigationItem = NavigationItem,
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
> = (item: TItem) => NavigationSchemaConfig<TColumn> | undefined;

export type NavigationPreviewResolver<
    TItem extends NavigationItem = NavigationItem,
    TRow extends NavigationPreviewRow = NavigationPreviewRow,
> = (item: TItem) => NavigationPreviewConfig<TRow> | undefined;

export type NavigationMetaResolver<
    TItem extends NavigationItem = NavigationItem,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = (item: TItem) => NavigationMetaConfig<TMetaItem> | undefined;

export type NavigationMetaRenderer<TMetaItem extends NavigationMetaItem = NavigationMetaItem> = (
    data: NavigationMetaConfig<TMetaItem>,
) => React.ReactNode;

export type NavigationViewResolver<
    TItem extends NavigationItem = NavigationItem,
    TRow extends NavigationPreviewRow = NavigationPreviewRow,
> = (item: TItem) => NavigationViewConfig<TRow> | undefined;

export type CreateTableDetailConfigOptions<
    TItem extends NavigationItem = NavigationItem,
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
    TRow extends NavigationPreviewRow = NavigationPreviewRow,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = {
    resolveSchema?: NavigationSchemaResolver<TItem, TColumn>;
    resolvePreview?: NavigationPreviewResolver<TItem, TRow>;
    resolveMeta?: NavigationMetaResolver<TItem, TMetaItem>;
    renderMeta?: NavigationMetaRenderer<TMetaItem>;
    resolveView?: NavigationViewResolver<TItem, TRow>;
};

export const createTableDetailConfig = <
    TItem extends NavigationItem = NavigationItem,
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
    TRow extends NavigationPreviewRow = NavigationPreviewRow,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
>(
    options?: CreateTableDetailConfigOptions<TItem, TColumn, TRow, TMetaItem>,
): NavigationDetailConfigFactory<TItem> => {
    const {resolveSchema, resolvePreview, resolveMeta, renderMeta, resolveView} = options ?? {};

    return (item): NavigationDetailConfig => ({
        tabs: [
            {
                id: 'schema',
                title: i18n('tab_schema'),
                renderContent: ({search, onSearchUpdate, searchPlaceholder}) => {
                    const schema = resolveSchema?.(item);
                    return (
                        <NavigationSchema<TColumn>
                            data={schema ?? {columns: []}}
                            search={search}
                            onSearchUpdate={onSearchUpdate}
                            searchPlaceholder={searchPlaceholder}
                        />
                    );
                },
            },
            {
                id: 'preview',
                title: i18n('tab_preview'),
                renderContent: ({search, onSearchUpdate, searchPlaceholder}) => {
                    const preview = resolvePreview?.(item);
                    return (
                        <NavigationPreview<TRow>
                            data={preview ?? {columns: [], rows: []}}
                            search={search}
                            onSearchUpdate={onSearchUpdate}
                            searchPlaceholder={searchPlaceholder}
                        />
                    );
                },
            },
            {
                id: 'meta',
                title: i18n('tab_meta'),
                renderContent: () => {
                    const meta = resolveMeta?.(item);
                    return (
                        <NavigationMeta<TMetaItem>
                            data={meta ?? {groups: []}}
                            view={renderMeta ? {render: renderMeta} : undefined}
                        />
                    );
                },
            },
            {
                id: 'view',
                title: i18n('tab_view'),
                renderContent: () => {
                    const view = resolveView?.(item);
                    return <NavigationView<TRow> data={view ?? {sections: []}} />;
                },
            },
        ],
        defaultTab: 'schema',
        hasSearch: false,
        searchPlaceholder: i18n('field_detail-search-placeholder'),
    });
};
