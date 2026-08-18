import type {NavigationDetailTab} from '../../../types/navigation';

export function getVisibleTabs(tabs: NavigationDetailTab[]): NavigationDetailTab[] {
    return tabs.filter((tab) => !tab.hidden);
}
