import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    type ChartRef,
    Chart as GravityChart,
    type ChartProps as GravityChartProps,
} from '@gravity-ui/charts';
import {ChevronsCollapseUpRight, ChevronsExpandUpRight, Ellipsis, Pencil} from '@gravity-ui/icons';
import {Button, DropdownMenu, type DropdownMenuItem, Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import i18n from './i18n';

import './Chart.scss';

const block = cn('qp-chart');

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

export const Chart = React.forwardRef<ChartRef, ChartProps>(function ChartComponent(
    {actions, onPencilEdit, controlsVisibility = 'always', className, ...chartProps},
    ref,
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === containerRef.current);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleFullscreenToggle = useCallback(() => {
        if (document.fullscreenElement === containerRef.current) {
            document.exitFullscreen().catch(() => undefined);
            return;
        }

        containerRef.current?.requestFullscreen().catch(() => undefined);
    }, []);

    const menuItems = useMemo(
        () =>
            actions?.map<DropdownMenuItem>(({text, icon, hidden, disabled, onClick}) => ({
                text,
                iconStart: icon,
                hidden,
                disabled,
                action: onClick,
            })),
        [actions],
    );
    const hasVisibleActions = actions?.some(({hidden}) => !hidden) ?? false;
    const fullscreenLabel = isFullscreen
        ? i18n('action_exit-fullscreen')
        : i18n('action_enter-fullscreen');

    return (
        <div ref={containerRef} className={block(null, className)}>
            <div className={block('controls', {visibility: controlsVisibility})}>
                <Button
                    type="button"
                    view="flat-secondary"
                    size="s"
                    aria-label={fullscreenLabel}
                    title={fullscreenLabel}
                    onClick={handleFullscreenToggle}
                >
                    <Icon
                        data={isFullscreen ? ChevronsCollapseUpRight : ChevronsExpandUpRight}
                        size={16}
                    />
                </Button>

                {onPencilEdit && (
                    <Button
                        type="button"
                        view="flat-secondary"
                        size="s"
                        aria-label={i18n('action_edit-chart')}
                        title={i18n('action_edit-chart')}
                        onClick={onPencilEdit}
                    >
                        <Icon data={Pencil} size={16} />
                    </Button>
                )}

                {hasVisibleActions && (
                    <DropdownMenu
                        items={menuItems}
                        size="s"
                        popupProps={{
                            container: isFullscreen
                                ? (containerRef.current ?? undefined)
                                : undefined,
                        }}
                        renderSwitcher={(switcherProps) => (
                            <Button
                                {...switcherProps}
                                type="button"
                                view="flat"
                                size="s"
                                aria-label={i18n('action_open-chart-menu')}
                                title={i18n('action_open-chart-menu')}
                                aria-haspopup="menu"
                            >
                                <Icon data={Ellipsis} size={16} />
                            </Button>
                        )}
                    />
                )}
            </div>

            <GravityChart {...chartProps} ref={ref} />
        </div>
    );
});
