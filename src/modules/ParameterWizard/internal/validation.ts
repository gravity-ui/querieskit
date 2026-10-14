import {createContext, useContext, useEffect, useId} from 'react';

export const ValidationContext = createContext<(id: string, invalid: boolean) => void>(() => {});

export function useDraftValidation(invalid: boolean) {
    const report = useContext(ValidationContext);
    const id = useId();
    useEffect(() => {
        report(id, invalid);
        return () => report(id, false);
    }, [id, invalid, report]);
}
