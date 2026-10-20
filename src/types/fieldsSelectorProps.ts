import type {ButtonProps} from '@gravity-ui/uikit';
import type {ReactNode} from 'react';

export type FieldsSelectorOption<K extends string = string> = {
    id: K;
    title: ReactNode;
    /** Searchable and accessible text for non-string titles; defaults to the field ID. */
    searchText?: string;
};

export type FieldsSelectorProps<K extends string = string> = {
    fields: FieldsSelectorOption<K>[];
    value: K[];
    onChange: (value: K[]) => void;
    buttonLabel?: string;
    buttonView?: ButtonProps['view'];
    buttonContent?: ReactNode;
    /** Immediate changes remain the default. Explicit changes are emitted only on Apply. */
    applyMode?: 'immediate' | 'explicit';
    searchable?: boolean;
    showSelectedCount?: boolean;
};
