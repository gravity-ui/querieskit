import React, {FC} from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
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
        <SegmentedRadioGroup
            value={activeTab}
            onUpdate={onUpdate}
            width="max"
            className={className}
        >
            {tabs.map((tab) => (
                <SegmentedRadioGroup.Option key={tab.id} value={tab.id} disabled={tab.disabled}>
                    {tab.title}
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    );
};
