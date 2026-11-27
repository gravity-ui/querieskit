import type {ReactNode} from 'react';
import type {QueryListLinkRenderer} from './queryList';

export type SearchRowLayoutProps = {
    header: ReactNode;
    query?: string;
    /** 1-based line in the full query to include in the SQL preview. */
    previewLineNumber?: number;
    language: string;
    href?: string;
    disabled?: boolean;
    renderLink?: QueryListLinkRenderer;
    className?: string;
};
