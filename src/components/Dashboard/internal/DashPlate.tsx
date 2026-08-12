import React from 'react';
import {GripHorizontal} from '@gravity-ui/icons';
import {Flex, Icon} from '@gravity-ui/uikit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {useDashboardContext} from './DashboardProvider';
import cn from 'bem-cn-lite';
import './DashPlate.scss';

const block = cn('qp-dashplate');

export const DRAG_HANDLE_CLASSNAME = 'DRAG_HANDLE_CLASSNAME';

export const DashPlate = ({id}: PluginWidgetProps) => {
    const {getItem} = useDashboardContext();
    const item = getItem(id);

    if (!item) return null;

    return (
        <Flex
            direction="column"
            position="relative"
            width="100%"
            height="100%"
            overflow="hidden"
            spacing={{p: 4}}
            className={block('item')}
        >
            <Icon data={GripHorizontal} className={block('drag-icon', DRAG_HANDLE_CLASSNAME)} />
            <Flex width="100%" height="100%" overflow="hidden" className={block('content')}>
                {item.content}
            </Flex>
        </Flex>
    );
};
