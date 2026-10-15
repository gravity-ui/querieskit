import type React from 'react';
import type {QueryListLinkRenderer} from './queryList';

export type RowLinkProps = Omit<React.ComponentPropsWithoutRef<'a'>, 'href'> & {
    href?: string;
    disabled?: boolean;
    renderLink?: QueryListLinkRenderer;
};
