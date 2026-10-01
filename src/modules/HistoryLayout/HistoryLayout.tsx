import React, {FC, ReactNode} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {HistoryPanelVariant} from '../../types/listPanel';
import './HistoryLayout.scss';

const block = cn('qp-history-layout');

export type HistoryLayoutProps = {
    title?: ReactNode;
    logo?: ReactNode;
    actions?: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    className?: string;
    variant?: HistoryPanelVariant;
    children: ReactNode;
};

export const HistoryLayout: FC<HistoryLayoutProps> = ({
    title,
    logo,
    actions,
    header,
    footer,
    className,
    children,
    variant = 'default',
}) => {
    const isPanel = variant !== 'default';
    return (
        <Flex direction="column" gap={isPanel ? 0 : 1} className={block({variant}, className)}>
            <Flex direction="column" gap={isPanel ? 0 : 1} className={block('header')}>
                {(logo || actions) && (
                    <Flex
                        className={block('service')}
                        alignItems="center"
                        justifyContent={logo ? 'space-between' : 'flex-end'}
                    >
                        {logo}
                        {actions}
                    </Flex>
                )}
                {title !== null && (
                    <Text className={block('title')} variant="subheader-1">
                        {title}
                    </Text>
                )}
                {isPanel && header ? <div className={block('controls')}>{header}</div> : header}
            </Flex>
            {children}
            {footer}
        </Flex>
    );
};
