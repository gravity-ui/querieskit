import React, {FC} from 'react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {NavigationItem} from '../../types/navigation';
import {getDefaultNavigationIcon} from '../../helpers/getDefaultNavigationIcon';

const block = cn('qp-navigation-item-row');

export type NavigationItemRowProps = {
    item: NavigationItem;
};

export const NavigationItemRow: FC<NavigationItemRowProps> = ({item}) => {
    return (
        <Flex gap={2} alignItems="center" className={block({disabled: item.disabled})}>
            {item.icon ?? (
                <Icon data={getDefaultNavigationIcon(item.kind, item.targetPathBroken)} size={16} />
            )}
            <Text
                className={block('title')}
                color={item.disabled ? 'secondary' : undefined}
                ellipsis
            >
                {item.title}
            </Text>
        </Flex>
    );
};
