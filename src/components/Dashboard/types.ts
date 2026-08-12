import type {ReactNode} from 'react';
import type {ReactGridLayoutProps} from '@gravity-ui/dashkit';

export type DashboardItemRenderProps = {
    id: string;
    width?: number;
    height?: number;
};

export type DashboardItemContent = ReactNode | ((props: DashboardItemRenderProps) => ReactNode);

export type DashboardItemAppearance = 'card' | 'plain';

export type DashboardItem = {
    id: string;
    x: number;
    y: number;
    width?: number;
    height: number;
    content: DashboardItemContent;
    title?: ReactNode;
    actions?: ReactNode;
    appearance?: DashboardItemAppearance;
    contentPadding?: boolean;
    ariaLabel?: string;
    className?: string;
    contentClassName?: string;
};

export type DashboardLayoutItem = Pick<DashboardItem, 'id' | 'x' | 'y' | 'width' | 'height'>;

export type DashboardProps = {
    items: readonly DashboardItem[];
    grid?: ReactGridLayoutProps;
    focusable?: boolean;
    ariaLabel?: string;
    className?: string;
    onItemsChange?: (items: DashboardItem[]) => void;
    onLayoutChange?: (layout: DashboardLayoutItem[]) => void;
    onItemFocus?: (item: DashboardItem) => void;
    onItemBlur?: (item: DashboardItem) => void;
};
