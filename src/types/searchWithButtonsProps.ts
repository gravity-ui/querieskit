import type {FlexProps} from '@gravity-ui/uikit';
import type React from 'react';

export type SearchWithButtonsProps = {
    value?: string;
    placeholder?: string;
    hasClear?: boolean;
    innerButtons?: React.ReactNode[];
    endButtons?: React.ReactNode[];
    onUpdate?: (value: string) => void;
    className?: string;
    gap?: FlexProps['gap'];
};
