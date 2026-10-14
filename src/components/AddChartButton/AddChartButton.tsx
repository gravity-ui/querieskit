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
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useState} from 'react';
import type {
    AddChartButtonOption,
    AddChartButtonProps,
    DefaultAddChartButtonValue,
} from '../../types/addChartButton';
export type {
    AddChartButtonOption,
    AddChartButtonProps,
    DefaultAddChartButtonValue,
} from '../../types/addChartButton';

import {getChartTypeLabel} from '../../helpers/chartLabels';
import './AddChartButton.scss';
import i18n from './i18n';

const block = cn('qp-add-chart-button');

export const DEFAULT_ADD_CHART_BUTTON_OPTIONS: readonly AddChartButtonOption<DefaultAddChartButtonValue>[] =
    [
        {
            value: 'Area',
            get text() {
                return getChartTypeLabel('area');
            },
            icon: ChartAreaStacked,
        },
        {
            value: 'BarX',
            get text() {
                return getChartTypeLabel('bar-y');
            },
            icon: ChartBar,
        },
        {
            value: 'BarY',
            get text() {
                return getChartTypeLabel('bar-x');
            },
            icon: ChartColumn,
        },
        {
            value: 'Line',
            get text() {
                return getChartTypeLabel('line');
            },
            icon: ChartLine,
        },
        {
            value: 'Pie',
            get text() {
                return getChartTypeLabel('pie');
            },
            icon: ChartPie,
        },
        {
            value: 'Scatter',
            get text() {
                return getChartTypeLabel('scatter');
            },
            icon: Circles5Random,
        },
        {
            value: 'Waterfall',
            get text() {
                return getChartTypeLabel('waterfall');
            },
            icon: SquareBars,
        },
    ];

export const AddChartButton = <TValue extends string = DefaultAddChartButtonValue>({
    text = i18n('action_add-chart'),
    options,
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

    const items = (
        options ?? (DEFAULT_ADD_CHART_BUTTON_OPTIONS as readonly AddChartButtonOption<TValue>[])
    ).map(({value, text: optionText, icon, disabled: optionDisabled, hidden}) => ({
        text: optionText,
        iconStart: icon && <Icon data={icon} size={16} className={block('option-icon')} />,
        disabled: optionDisabled,
        hidden,
        action: () => onSelect(value),
    }));

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
