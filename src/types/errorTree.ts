import type React from 'react';

export type ErrorTreeSeverity = 'error' | 'warning' | 'info';

export type ErrorTreePosition = {
    row: number;
    column: number;
};

export type ErrorTreeItem = {
    id: string;
    severity: ErrorTreeSeverity;
    message: string;
    code?: string | number;
    position?: ErrorTreePosition;
    attributes?: Record<string, unknown>;
    children?: ErrorTreeItem[];
};

export type ErrorTreeProps = {
    root: ErrorTreeItem;
    className?: string;
    defaultExpanded?: boolean;
    defaultInfoExpanded?: boolean;
    renderAttributes?: (
        attributes: Record<string, unknown>,
        item: ErrorTreeItem,
    ) => React.ReactNode;
    onPositionClick?: (item: ErrorTreeItem, position: ErrorTreePosition) => void;
};
