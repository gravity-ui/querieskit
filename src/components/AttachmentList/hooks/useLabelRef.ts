import {useLayoutEffect, useRef, useState} from 'react';

export const useLabelRef = (labelText: string) => {
    const labelRef = useRef<HTMLLabelElement>(null);
    const [labelWidth, setLabelWidth] = useState(0);

    useLayoutEffect(() => {
        const label = labelRef.current;

        if (!label) return undefined;

        const updateLabelWidth = () => setLabelWidth(label.offsetWidth);

        updateLabelWidth();

        if (typeof ResizeObserver === 'undefined') return undefined;

        const observer = new ResizeObserver(updateLabelWidth);
        observer.observe(label);

        return () => observer.disconnect();
    }, [labelText]);

    return {labelRef, labelWidth};
};
