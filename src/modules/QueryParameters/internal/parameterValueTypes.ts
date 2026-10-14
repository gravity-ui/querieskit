import type React from 'react';
import type {QueryParameterType, QueryParameterValue} from '../../../types/queryParameters';

export type ParameterValueProps = {
    type: QueryParameterType;
    value: QueryParameterValue;
    initialValue?: QueryParameterValue;
    header?: React.ReactNode;
    horizontal?: boolean;
    nullActive?: boolean;
    onChange: (value: QueryParameterValue) => void;
    onReset?: () => void;
    editing: boolean;
    disabled?: boolean;
    label: string;
    path?: string;
    errors?: Record<string, string>;
    onValidityChange?: (path: string, invalid: boolean) => void;
    className?: string;
};

// Pass the stable recursive component down instead of importing the dispatcher back into
// its renderers. This keeps the dependency graph acyclic and preserves child component identity.
export type RecursiveValueProps = ParameterValueProps & {
    ValueComponent: React.ComponentType<ParameterValueProps>;
};
