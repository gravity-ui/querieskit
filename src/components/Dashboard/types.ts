import type {ReactNode} from 'react';
import type {ConfigLayout, ReactGridLayoutProps} from '@gravity-ui/dashkit';

export type DashboardItemAppearance = 'card' | 'plain';

export type DashboardItem = {
    id: string;
    content: ReactNode;
};

export type DashboardProps = {
    items: DashboardItem[];
    layout?: ConfigLayout[];
    grid?: ReactGridLayoutProps;
    focusable?: boolean;
    className?: string;

    onLayoutChange?: (layout: ConfigLayout[]) => void;
    onItemFocus?: (item: ReactNode, index: number) => void;
    onItemBlur?: (item: ReactNode, index: number) => void;
};
