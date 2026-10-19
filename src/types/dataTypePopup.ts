import type {ReactNode} from 'react';
import type {ParameterType} from './dataTypes';

export interface DataTypePopupProps {
    children: ReactNode;
    type?: ParameterType;
    hideIcon?: boolean;
    className?: string;
}
