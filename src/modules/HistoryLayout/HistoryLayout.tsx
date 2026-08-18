import React, {FC, ReactNode} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './HistoryLayout.scss';

const block = cn('qp-history-layout');

export type HistoryLayoutProps = {
    title: ReactNode;
    logo?: ReactNode;
    actions?: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    className?: string;
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
}) => {
    return (
        <Flex direction="column" gap={1} className={block(null, className)}>
            <Flex direction="column" gap={1} className={block('header')}>
                {(logo || actions) && (
                    <Flex alignItems="center" justifyContent={logo ? 'space-between' : 'flex-end'}>
                        {logo}
                        {actions}
                    </Flex>
                )}
                <Text variant="subheader-1">{title}</Text>
                {header}
            </Flex>
            {children}
            {footer}
        </Flex>
    );
};
