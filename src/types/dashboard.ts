import type {ReactNode} from 'react';
import type {ConfigLayout, ReactGridLayoutProps} from '@gravity-ui/dashkit';

export type DashboardItemAppearance = 'card' | 'plain';

export type DashboardRenderItem = {
    id: string;
    content: ReactNode;
};

export type DashboardProps = {
    items: DashboardRenderItem[];
    /** Controlled layout, matched by item ID. */
    layout?: ConfigLayout[];
    /** Initial layout for uncontrolled mode only. */
    defaultLayout?: ConfigLayout[];
    grid?: ReactGridLayoutProps;
    focusable?: boolean;
    className?: string;

    onLayoutChange?: (layout: ConfigLayout[]) => void;
    onItemFocus?: (item: ReactNode, index: number) => void;
    onItemBlur?: (item: ReactNode, index: number) => void;
};
