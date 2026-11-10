import type React from 'react';
import type {
    NavigationDetailTab,
    NavigationItem,
    NavigationMetaConfig,
    NavigationMetaItem,
    NavigationPreviewConfig,
    NavigationPreviewRow,
    NavigationPreviewViewConfig,
    NavigationSchemaColumn,
    NavigationSchemaConfig,
    NavigationViewConfig,
    NavigationViewRow,
} from './navigation';
export type NavigationSchemaResolver<
    TItem extends NavigationItem = NavigationItem,
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
> = (item: TItem) => NavigationSchemaConfig<TColumn> | undefined;

export type NavigationPreviewResolver<
    TItem extends NavigationItem = NavigationItem,
    TRow extends NavigationPreviewRow = NavigationPreviewRow,
> = (item: TItem) => NavigationPreviewConfig<TRow> | undefined;

export type NavigationPreviewViewResolver<
    TItem extends NavigationItem = NavigationItem,
    TRow extends NavigationPreviewRow = NavigationPreviewRow,
> = (item: TItem) => NavigationPreviewViewConfig<TRow> | undefined;

export type NavigationMetaResolver<
    TItem extends NavigationItem = NavigationItem,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
> = (item: TItem) => NavigationMetaConfig<TMetaItem> | undefined;

export type NavigationMetaRenderer<TMetaItem extends NavigationMetaItem = NavigationMetaItem> = (
    data: NavigationMetaConfig<TMetaItem>,
) => React.ReactNode;

export type NavigationViewResolver<
    TItem extends NavigationItem = NavigationItem,
    TRow extends NavigationViewRow = NavigationViewRow,
> = (item: TItem) => NavigationViewConfig<TRow> | undefined;

export type BuiltinTableDetailTabId = 'schema' | 'preview' | 'meta' | 'view';

/** A standard tab, a partial standard-tab override, or a complete custom tab. */
export type TableDetailTab =
    | BuiltinTableDetailTabId
    | ({id: BuiltinTableDetailTabId} & Partial<Omit<NavigationDetailTab, 'id'>>)
    | NavigationDetailTab;

export type CreateTableDetailConfigOptions<
    TItem extends NavigationItem = NavigationItem,
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
    TRow extends NavigationPreviewRow = NavigationPreviewRow,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
    TViewRow extends NavigationViewRow = NavigationViewRow,
> = {
    /** Ordered tabs. Omit for schema, preview, meta, view. A callback receives the opened item. */
    tabs?: readonly TableDetailTab[] | ((item: TItem) => readonly TableDetailTab[]);
    resolveSchema?: NavigationSchemaResolver<TItem, TColumn>;
    resolvePreview?: NavigationPreviewResolver<TItem, TRow>;
    resolvePreviewView?: NavigationPreviewViewResolver<TItem, TRow>;
    resolveMeta?: NavigationMetaResolver<TItem, TMetaItem>;
    renderMeta?: NavigationMetaRenderer<TMetaItem>;
    resolveView?: NavigationViewResolver<TItem, TViewRow>;
};
