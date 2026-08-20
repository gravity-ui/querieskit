import React, {type ReactNode, useMemo, useState} from 'react';
import {
    ChartAreaStacked,
    ChartBar,
    ChartColumn,
    ChartLine,
    ChartPie,
    Circles5Random,
    Plus,
    SquareBars,
} from '@gravity-ui/icons';
import {
    Button,
    type ButtonButtonProps,
    DropdownMenu,
    type DropdownMenuProps,
    Icon,
    type IconData,
} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import './AddChartButton.scss';

const block = cn('qp-add-chart-button');

export type AddChartButtonOption<TValue extends string = string> = {
    value: TValue;
    text: ReactNode;
    icon?: IconData;
    disabled?: boolean;
    hidden?: boolean;
};

export type DefaultAddChartButtonValue =
    'Area' | 'BarX' | 'BarY' | 'Line' | 'Pie' | 'Scatter' | 'Waterfall';

export const DEFAULT_ADD_CHART_BUTTON_OPTIONS: readonly AddChartButtonOption<DefaultAddChartButtonValue>[] =
    [
        {value: 'Area', text: 'Area', icon: ChartAreaStacked},
        {value: 'BarX', text: 'BarX', icon: ChartBar},
        {value: 'BarY', text: 'BarY', icon: ChartColumn},
        {value: 'Line', text: 'Line', icon: ChartLine},
        {value: 'Pie', text: 'Pie', icon: ChartPie},
        {value: 'Scatter', text: 'Scatter', icon: Circles5Random},
        {value: 'Waterfall', text: 'Waterfall', icon: SquareBars},
    ];

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

export const AddChartButton = <TValue extends string = DefaultAddChartButtonValue>({
    text = 'Add chart',
    options = DEFAULT_ADD_CHART_BUTTON_OPTIONS as readonly AddChartButtonOption<TValue>[],
    onSelect,
    open,
    onOpenToggle,
    disabled,
    className,
    buttonProps,
    menuProps,
    popupProps,
}: AddChartButtonProps<TValue>) => {
    const [innerOpen, setInnerOpen] = useState(false);
    const isOpen = open ?? innerOpen;

    const items = useMemo(
        () =>
            options.map(({value, text: optionText, icon, disabled: optionDisabled, hidden}) => ({
                text: optionText,
                iconStart: icon && <Icon data={icon} size={16} className={block('option-icon')} />,
                disabled: optionDisabled,
                hidden,
                action: () => onSelect(value),
            })),
        [onSelect, options],
    );

    const handleOpenToggle: React.Dispatch<React.SetStateAction<boolean>> = (nextOpen) => {
        const nextValue = typeof nextOpen === 'function' ? nextOpen(isOpen) : nextOpen;

        if (open === undefined) {
            setInnerOpen(nextValue);
        }

        onOpenToggle?.(nextValue);
    };

    return (
        <DropdownMenu
            items={items}
            open={isOpen}
            onOpenToggle={handleOpenToggle}
            disabled={disabled}
            size="s"
            switcherWrapperClassName={block(null, className)}
            renderSwitcher={(switcherProps) => (
                <Button
                    {...buttonProps}
                    {...switcherProps}
                    type={buttonProps?.type ?? 'button'}
                    view="flat-action"
                    size="m"
                    selected={isOpen}
                    disabled={disabled}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    className={block('button')}
                >
                    <Icon data={Plus} size={16} />
                    {text}
                </Button>
            )}
            menuProps={{
                ...menuProps,
                size: menuProps?.size ?? 's',
                className: block('menu', menuProps?.className),
            }}
            popupProps={{placement: 'bottom-start', ...popupProps}}
        />
    );
};
