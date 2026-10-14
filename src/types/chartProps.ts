import type {ChartProps as GravityChartProps} from '@gravity-ui/charts';
import type React from 'react';

export type ChartAction = {
    text: React.ReactNode;
    icon?: React.ReactNode;
    hidden?: boolean;
    disabled?: boolean;
    onClick: () => void;
};

export type ChartProps = GravityChartProps & {
    actions?: readonly ChartAction[];
    onPencilEdit?: () => void;
    controlsVisibility?: 'always' | 'hover';
    className?: string;
};
