import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import type {RowLinkProps} from '../../types/rowLinkProps';
import './RowLink.scss';
export type {RowLinkProps} from '../../types/rowLinkProps';

const block = cn('qp-row-link');

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
