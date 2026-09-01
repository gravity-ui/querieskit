import {useEffect, useState} from 'react';

/** Delays a changing value without duplicating timer lifecycle handling in consumers. */
export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeoutId = setTimeout(() => setDebouncedValue(value), delay);

        return () => clearTimeout(timeoutId);
    }, [delay, value]);

    return debouncedValue;
}
