import {useState} from 'react';

export type UseVisibleColumnsOptions = {
    value?: string[];
    onChange?: (value: string[]) => void;
    defaultValue?: string[];
};

export function useVisibleColumns(
    allColumns: string[],
    {value, onChange, defaultValue}: UseVisibleColumnsOptions,
): [string[], (value: string[]) => void] {
    const isControlled = value !== undefined;
    const [state, setState] = useState<string[]>(() => defaultValue ?? allColumns);

    const activeColumns = isControlled ? value : state;

    const handleChange = (next: string[]) => {
        if (!isControlled) {
            setState(next);
        }
        onChange?.(next);
    };

    return [activeColumns, handleChange];
}
