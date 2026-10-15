import type {ReactNode} from 'react';
import type {QueryListLinkRenderer} from './queryList';

export type SearchRowLayoutProps = {
    header: ReactNode;
    query?: string;
    language: string;
    href?: string;
    disabled?: boolean;
    renderLink?: QueryListLinkRenderer;
    className?: string;
};
