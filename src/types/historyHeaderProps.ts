import type {HistoryFilterConfig} from './historyFilter';
import type React from 'react';
import type {HistoryPanelVariant} from './listPanel';

export type HistoryHeaderProps = {
    search?: string;
    fullSearch?: boolean;
    fullSearchAvailable?: boolean;
    hasClear?: boolean;
    filter?: HistoryFilterConfig;
    actions?: React.ReactNode;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
    className?: string;
    variant?: HistoryPanelVariant;
};
