export const omitKeys = <T extends Record<string, unknown>>(obj: T, keys: string[]) => {
    const omitKeysSet = new Set(keys);
    const newObj: Record<string, unknown> = {};

    for (const currKey in obj) {
        if (currKey in obj) {
            if (omitKeysSet.has(currKey)) {
                continue;
            }
            newObj[currKey] = obj[currKey];
        }
    }

    return newObj as T;
};
