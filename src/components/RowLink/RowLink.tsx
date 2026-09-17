import React, {FC} from 'react';
import cn from 'bem-cn-lite';
import {QueryListLinkRenderer} from '../../types/queryList';
import './RowLink.scss';

const block = cn('qp-row-link');

export type RowLinkProps = Omit<React.ComponentPropsWithoutRef<'a'>, 'href'> & {
    href?: string;
    disabled?: boolean;
    renderLink?: QueryListLinkRenderer;
};

export const RowLink: FC<RowLinkProps> = ({
    href,
    disabled,
    renderLink,
    className,
    children,
    ...linkProps
}) => {
    const isLink = Boolean(href) && !disabled;

    if (!isLink) {
        return <div className={block(null, className)}>{children}</div>;
    }

    const props: React.ComponentPropsWithoutRef<'a'> = {
        ...linkProps,
        href,
        className: block(null, className),
        children,
    };

    return renderLink ? renderLink(props) : <a {...props} />;
};
