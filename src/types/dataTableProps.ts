import type {DataTableProps as BaseDataTableProps} from '@gravity-ui/react-data-table';
import type {EmptyContentVariant} from './emptyContentProps';

export type DataTableProps<T> = {
    loading?: boolean;
    loaded?: boolean;
    className?: string;
    emptyVariant?: EmptyContentVariant;
} & Omit<BaseDataTableProps<T>, 'theme'>;
