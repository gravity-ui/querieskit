import type {Column} from '@gravity-ui/react-data-table';
import type {FieldsSelectorProps} from './fieldsSelectorProps';
import type {NavigationSchemaColumn, NavigationSchemaConfig} from './navigation';

export type NavigationSchemaViewConfig<
    TColumn extends NavigationSchemaColumn = NavigationSchemaColumn,
> = {
    tableColumns?: Array<Column<TColumn>>;
    extraColumns?: Array<Column<TColumn>>;
};

export type NavigationSchemaProps<TColumn extends NavigationSchemaColumn = NavigationSchemaColumn> =
    {
        data: NavigationSchemaConfig<TColumn>;
        view?: NavigationSchemaViewConfig<TColumn>;
        search?: string;
        onSearchUpdate?: (value: string) => void;
        searchPlaceholder?: string;
        visibleColumns?: string[];
        onVisibleColumnsChange?: (value: string[]) => void;
        defaultVisibleColumns?: string[];
        hideToolbar?: boolean;
        hideFieldsSelector?: boolean;
        fieldsSelectorProps?: Omit<FieldsSelectorProps<string>, 'fields' | 'value' | 'onChange'>;
        className?: string;
    };
