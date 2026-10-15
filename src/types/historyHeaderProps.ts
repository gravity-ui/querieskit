import type React from 'react';
import type {HistoryPanelVariant} from './listPanel';
import type {QueryListFilterConfig} from './queryList';

export type HistoryHeaderProps = {
    search?: string;
    fullSearch?: boolean;
    fullSearchAvailable?: boolean;
    hasClear?: boolean;
    filter?: QueryListFilterConfig;
    actions?: React.ReactNode;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
    className?: string;
    variant?: HistoryPanelVariant;
};
