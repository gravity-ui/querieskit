import React from 'react';
import {GripHorizontal} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import type {DashboardItem, DashboardItemRenderProps} from './types';
import cn from 'bem-cn-lite';

type DashPlateProps = PluginWidgetProps & {
    context: {
        dashboardItems: ReadonlyMap<string, DashboardItem>;
    };
};

const block = cn('qp-dashboard');

export const DashPlate = ({id, width, height, context}: DashPlateProps) => {
    const item = context.dashboardItems.get(id);

    if (!item) return null;

    const appearance = item.appearance ?? 'card';
    const contentPadding = item.contentPadding ?? true;
    const renderProps: DashboardItemRenderProps = {id, width, height};

    return (
        <section
            aria-label={item.ariaLabel}
            className={block(
                'item',
                {appearance, 'content-padding': contentPadding},
                item.className,
            )}
        >
            <Icon data={GripHorizontal} className={block('draggable-handle')} />

            <div className={block('header')}>
                {item.actions && <div className={block('actions')}>{item.actions}</div>}
            </div>

            <div className={block('content', item.contentClassName)}>
                {typeof item.content === 'function' ? item.content(renderProps) : item.content}
            </div>
        </section>
    );
};
