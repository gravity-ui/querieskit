import type {GetNavigationBreadcrumbHref, NavigationLocation} from './navigation';
import type {LoadPathSuggestions} from './pathEditor';

export type BreadcrumbsProps = {
    location: NavigationLocation;
    hideResetButton?: boolean;
    className?: string;
    onUpdate: (location: NavigationLocation) => void;
    getBreadcrumbHref?: GetNavigationBreadcrumbHref;
    onLoadSuggestions?: LoadPathSuggestions;
};
