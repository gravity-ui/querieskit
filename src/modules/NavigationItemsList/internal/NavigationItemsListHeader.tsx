import React, {FC} from 'react';
import {Flex, Icon, Text} from '@gravity-ui/uikit';
import ArrowUpIcon from '@gravity-ui/icons/svgs/arrow-up.svg';
import ArrowDownIcon from '@gravity-ui/icons/svgs/arrow-down.svg';
import ArrowUpArrowDownIcon from '@gravity-ui/icons/svgs/arrow-up-arrow-down.svg';
import cn from 'bem-cn-lite';
import {NavigationSortOrder} from '../../../types/navigation';
import './NavigationItemsListHeader.scss';

const block = cn('qp-navigation-items-list-header');

const SORT_ICONS: Record<NavigationSortOrder, typeof ArrowUpIcon> = {
    asc: ArrowUpIcon,
    desc: ArrowDownIcon,
};

export type NavigationItemsListHeaderProps = {
    titleLabel: string;
    sort?: NavigationSortOrder;
    onSortUpdate?: (sort: NavigationSortOrder) => void;
    className?: string;
};

export const NavigationItemsListHeader: FC<NavigationItemsListHeaderProps> = ({
    titleLabel,
    sort,
    onSortUpdate,
    className,
}) => {
    if (!onSortUpdate) {
        return (
            <Flex alignItems="center" className={block(null, className)}>
                <Text>{titleLabel}</Text>
            </Flex>
        );
    }

    const handleClick = () => {
        onSortUpdate(sort === 'asc' ? 'desc' : 'asc');
    };

    const icon = sort ? SORT_ICONS[sort] : ArrowUpArrowDownIcon;

    return (
        <Flex alignItems="center" className={block(null, className)}>
            <Flex
                inline
                gap={2}
                alignItems="center"
                className={block('sort')}
                onClick={handleClick}
            >
                <Text>{titleLabel}</Text>
                <Icon data={icon} size={16} />
            </Flex>
        </Flex>
    );
};
