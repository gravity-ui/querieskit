import type {NavigationDetailConfig, NavigationItem} from '../../../types/navigation';
import i18n from '../i18n';

export const createTableDetailConfig = (_item: NavigationItem): NavigationDetailConfig => ({
    tabs: [
        {id: 'schema', title: i18n('tab_schema'), content: null},
        {id: 'preview', title: i18n('tab_preview'), content: null},
        {id: 'meta', title: i18n('tab_meta'), content: null},
        {id: 'view', title: i18n('tab_view'), content: null},
    ],
    defaultTab: 'schema',
    hasSearch: true,
    searchPlaceholder: i18n('field_detail-search-placeholder'),
});
