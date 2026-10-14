import type {FieldsSelectorOption} from './fieldsSelectorProps';

export type FieldsSearchToolbarProps<K extends string = string> = {
    search?: string;
    onSearchUpdate?: (value: string) => void;
    searchPlaceholder?: string;
    fields: FieldsSelectorOption<K>[];
    visibleFields: K[];
    onVisibleFieldsChange: (value: K[]) => void;
    hideFieldsSelector?: boolean;
    className?: string;
};
