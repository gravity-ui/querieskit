import type {ReactNode} from 'react';
import type {ConfigLayout, ReactGridLayoutProps} from '@gravity-ui/dashkit';

export type DashboardItemAppearance = 'card' | 'plain';

export type DashboardItem = {
    id: string;
    content: ReactNode;
};

export type DashboardProps = {
    /** Item ids must be unique and stable. Items are matched with layout entries by array index. */
    items: DashboardItem[];
    /** Omit to let Dashboard create and keep the layout itself. */
    layout?: ConfigLayout[];
    grid?: ReactGridLayoutProps;
    // appearance?: DashboardItemAppearance;
    // contentPadding?: boolean;
    focusable?: boolean;
    className?: string;
    onLayoutChange?: (layout: ConfigLayout[]) => void;
    onItemFocus?: (item: ReactNode, index: number) => void;
    onItemBlur?: (item: ReactNode, index: number) => void;
};
