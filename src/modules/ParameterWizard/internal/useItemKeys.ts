import {useState} from 'react';

/** Keep sibling input drafts attached to their rows when an item is deleted. */
export function useItemKeys(length: number) {
    const [state, setState] = useState(() => ({
        keys: Array.from({length}, (_, index) => index),
        next: length,
    }));
    let keys = state.keys;
    if (keys.length !== length) {
        const added = Math.max(0, length - keys.length);
        keys = [...keys.slice(0, length), ...Array.from({length: added}, (_, i) => state.next + i)];
        setState({keys, next: state.next + added});
    }
    return {
        keys,
        removeKey: (index: number) =>
            setState((current) => ({
                ...current,
                keys: current.keys.filter((_, i) => i !== index),
            })),
    };
}
