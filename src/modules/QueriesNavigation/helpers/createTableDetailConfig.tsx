import type {
    BuiltinTableDetailTabId,
    CreateTableDetailConfigOptions,
} from '../../../types/navigationDetailResolvers';
import React from 'react';
import {NavigationMeta} from '../../../modules/NavigationMeta';
import {NavigationPreview} from '../../../modules/NavigationPreview';
import {NavigationSchema} from '../../../modules/NavigationSchema';
import {NavigationView} from '../../../modules/NavigationView';
import type {
    NavigationDetailConfig,
    NavigationDetailConfigFactory,
    NavigationDetailTab,
    NavigationItem,
    NavigationMetaItem,
    NavigationPreviewRow,
    NavigationSchemaColumn,
    NavigationViewRow,
} from '../../../types/navigation';
import i18n from '../i18n';

export const createTableDetailConfig = <
    TItem extends NavigationItem = NavigationItem,
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
    TRow extends NavigationPreviewRow = NavigationPreviewRow,
    TMetaItem extends NavigationMetaItem = NavigationMetaItem,
    TViewRow extends NavigationViewRow = NavigationViewRow,
>(
    options?: CreateTableDetailConfigOptions<TItem, TColumn, TRow, TMetaItem, TViewRow>,
): NavigationDetailConfigFactory<TItem> => {
    const {
        tabs: configuredTabs,
        resolveSchema,
        resolvePreview,
        resolvePreviewView,
        resolveMeta,
        renderMeta,
        resolveView,
    } = options ?? {};

    return (item): NavigationDetailConfig => {
        const standardTabs: Record<BuiltinTableDetailTabId, NavigationDetailTab> = {
            schema: {
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
            preview: {
                id: 'preview',
                title: i18n('tab_preview'),
                renderContent: ({search, onSearchUpdate, searchPlaceholder}) => {
                    const preview = resolvePreview?.(item);
                    return (
                        <NavigationPreview<TRow>
                            data={preview ?? {columns: [], rows: []}}
                            view={resolvePreviewView?.(item)}
                            search={search}
                            onSearchUpdate={onSearchUpdate}
                            searchPlaceholder={searchPlaceholder}
                        />
                    );
                },
            },
            meta: {
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
            view: {
                id: 'view',
                title: i18n('tab_view'),
                renderContent: ({search, onSearchUpdate, searchPlaceholder}) => {
                    const view = resolveView?.(item);
                    return (
                        <NavigationView<TViewRow>
                            data={view ?? {sections: []}}
                            search={search}
                            onSearchUpdate={onSearchUpdate}
                            searchPlaceholder={searchPlaceholder}
                        />
                    );
                },
            },
        };
        const requestedTabs =
            typeof configuredTabs === 'function' ? configuredTabs(item) : configuredTabs;
        const tabs = requestedTabs
            ? requestedTabs.map((tab): NavigationDetailTab => {
                  if (typeof tab === 'string') return standardTabs[tab];
                  const standard = Object.prototype.hasOwnProperty.call(standardTabs, tab.id)
                      ? standardTabs[tab.id as BuiltinTableDetailTabId]
                      : undefined;
                  if (!standard) return tab as NavigationDetailTab;
                  // A supplied content node replaces the preset renderer, including null.
                  return {
                      ...standard,
                      ...('content' in tab ? {renderContent: undefined} : {}),
                      ...tab,
                  };
              })
            : Object.values(standardTabs);
        return {
            tabs,
            defaultTab:
                requestedTabs === undefined
                    ? 'schema'
                    : tabs.find((tab) => !tab.hidden && !tab.disabled)?.id,
            hasSearch: false,
            searchPlaceholder: i18n('field_detail-search-placeholder'),
        };
    };
};
