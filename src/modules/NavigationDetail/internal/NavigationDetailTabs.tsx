import React, {FC} from 'react';
import {Tab, TabList, TabProvider} from '@gravity-ui/uikit';
import {NavigationDetailTab} from '../../../types/navigation';

export type NavigationDetailTabsProps = {
    tabs: NavigationDetailTab[];
    activeTab: string;
    onUpdate: (tab: string) => void;
    className?: string;
};

export const NavigationDetailTabs: FC<NavigationDetailTabsProps> = ({
    tabs,
    activeTab,
    onUpdate,
    className,
}) => {
    return (
        <TabProvider value={activeTab} onUpdate={onUpdate}>
            <TabList className={className}>
                {tabs.map((tab) => (
                    <Tab key={tab.id} value={tab.id} disabled={tab.disabled}>
                        {tab.title}
                    </Tab>
                ))}
            </TabList>
        </TabProvider>
    );
};
