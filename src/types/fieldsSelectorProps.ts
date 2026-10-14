import type {ButtonProps} from '@gravity-ui/uikit';
import type {ReactNode} from 'react';

export type FieldsSelectorOption<K extends string = string> = {
    id: K;
    title: ReactNode;
};

export type FieldsSelectorProps<K extends string = string> = {
    fields: FieldsSelectorOption<K>[];
    value: K[];
    onChange: (value: K[]) => void;
    buttonLabel?: string;
    buttonView?: ButtonProps['view'];
};
