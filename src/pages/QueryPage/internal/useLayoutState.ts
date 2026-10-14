import {useEffect, useRef, useState} from 'react';

export function useLayoutState<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
    const [internal, setInternal] = useState(initial);
    const current = value === undefined ? internal : value;
    const change = (next: T) => {
        if (next === current) return;
        if (value === undefined) setInternal(next);
        onChange?.(next);
    };
    return [current, change] as const;
}

export function useElementSize() {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({width: 0, height: 0});
    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        const measure = () => {
            const {clientWidth: width, clientHeight: height} = element;
            setSize((previous) =>
                previous.width === width && previous.height === height ? previous : {width, height},
            );
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    return [ref, size] as const;
}
