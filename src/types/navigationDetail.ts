import type {
    GetNavigationBreadcrumbHref,
    NavigationDetailConfig,
    NavigationHeaderAction,
    NavigationLocation,
    RenderNavigationHeaderActions,
} from './navigation';
import type {LoadPathSuggestions} from './pathEditor';

export type NavigationDetailProps = {
    config: NavigationDetailConfig;
    location: NavigationLocation;
    onUpdate: (location: NavigationLocation) => void;
    onLoadSuggestions?: LoadPathSuggestions;
    actions?: NavigationHeaderAction[];
    renderActions?: RenderNavigationHeaderActions;
    getBreadcrumbHref?: GetNavigationBreadcrumbHref;
    activeTab?: string;
    onTabUpdate?: (tab: string) => void;
    search?: string;
    onSearchUpdate?: (value: string) => void;
    className?: string;
};
