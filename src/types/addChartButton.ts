import type {ReactNode} from 'react';
import type {ButtonButtonProps, DropdownMenuProps, IconData} from '@gravity-ui/uikit';

export type AddChartButtonOption<TValue extends string = string> = {
    value: TValue;
    text: ReactNode;
    icon?: IconData;
    disabled?: boolean;
    hidden?: boolean;
};

export type DefaultAddChartButtonValue =
    'Area' | 'BarX' | 'BarY' | 'Line' | 'Pie' | 'Scatter' | 'Waterfall';

type SwitcherButtonProps = Omit<
    ButtonButtonProps,
    'children' | 'className' | 'disabled' | 'onClick' | 'onKeyDown' | 'selected' | 'size' | 'view'
>;

type MenuProps = NonNullable<DropdownMenuProps<unknown>['menuProps']>;

type PopupProps = NonNullable<DropdownMenuProps<unknown>['popupProps']>;

export type AddChartButtonProps<TValue extends string = DefaultAddChartButtonValue> = {
    text?: ReactNode;
    options?: readonly AddChartButtonOption<TValue>[];
    onSelect: (value: TValue) => void;
    open?: boolean;
    onOpenToggle?: (open: boolean) => void;
    disabled?: boolean;
    className?: string;
    buttonProps?: SwitcherButtonProps;
    menuProps?: MenuProps;
    popupProps?: PopupProps;
};
