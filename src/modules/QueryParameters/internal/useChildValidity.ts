import {useCallback, useRef, useState} from 'react';
import type {ParameterValueProps as Props} from './parameterValueTypes';

export function useChildValidity(onValidityChange: Props['onValidityChange']) {
    const [pending, setPending] = useState<Set<string>>(() => new Set());
    const callback = useRef(onValidityChange);
    callback.current = onValidityChange;
    const childValidity = useCallback((childPath: string, invalid: boolean) => {
        setPending((current) => {
            if (current.has(childPath) === invalid) return current;
            const next = new Set(current);
            if (invalid) next.add(childPath);
            else next.delete(childPath);
            return next;
        });
        callback.current?.(childPath, invalid);
    }, []);
    const clearChildren = () => {
        pending.forEach((childPath) => callback.current?.(childPath, false));
        setPending(new Set());
    };
    return {pending, childValidity, clearChildren};
}
