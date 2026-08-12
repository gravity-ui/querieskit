import React, {FC, ReactNode} from 'react';
import cn from 'bem-cn-lite';
import './RowLink.scss';

const block = cn('qp-row-link');

export type RowLinkProps = {
    href?: string;
    disabled?: boolean;
    className?: string;
    children: ReactNode;
};

export const RowLink: FC<RowLinkProps> = ({href, disabled, className, children}) => {
    const isLink = Boolean(href) && !disabled;
    const Wrap = isLink ? 'a' : 'div';

    return (
        <Wrap href={isLink ? href : undefined} className={block(null, className)}>
            {children}
        </Wrap>
    );
};
