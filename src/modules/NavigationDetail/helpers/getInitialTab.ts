import type {NavigationDetailTab} from '../../../types/navigation';

export function getInitialTab(visibleTabs: NavigationDetailTab[], defaultTab?: string): string {
    const defaultTabConfig = defaultTab
        ? visibleTabs.find((tab) => tab.id === defaultTab)
        : undefined;
    const firstEnabled = visibleTabs.find((tab) => !tab.disabled);
    return (defaultTabConfig ?? firstEnabled ?? visibleTabs[0])?.id ?? '';
}
