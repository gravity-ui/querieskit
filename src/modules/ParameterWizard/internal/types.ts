import type {ReactNode} from 'react';
import type {ParameterType, ParameterValue} from '../../../types/parameterWizard';

export interface EditorProps {
    type: ParameterType;
    value: ParameterValue;
    onChange: (value: ParameterValue) => void;
    name: string;
    readOnly?: boolean;
    disabled?: boolean;
    itemAction?: ReactNode;
    hideLabel?: boolean;
}
