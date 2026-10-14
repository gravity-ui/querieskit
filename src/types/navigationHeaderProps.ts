import type {
    GetNavigationBreadcrumbHref,
    NavigationHeaderAction,
    NavigationLocation,
    RenderNavigationHeaderActions,
} from './navigation';
import type {LoadPathSuggestions} from './pathEditor';

export type NavigationHeaderProps = {
    location: NavigationLocation;
    actions?: NavigationHeaderAction[];
    renderActions?: RenderNavigationHeaderActions;
    getBreadcrumbHref?: GetNavigationBreadcrumbHref;
    onUpdate: (location: NavigationLocation) => void;
    onLoadSuggestions?: LoadPathSuggestions;
    className?: string;
};
