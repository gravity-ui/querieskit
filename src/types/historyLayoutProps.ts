import type {ReactNode} from 'react';
import type {HistoryPanelVariant} from './listPanel';

export type HistoryLayoutProps = {
    title?: ReactNode;
    logo?: ReactNode;
    actions?: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    className?: string;
    variant?: HistoryPanelVariant;
    children: ReactNode;
};
