export const isObjectEqual = (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    const compareKeys = keys1.length > keys2.length ? keys1 : keys2;

    for (const key of compareKeys) {
        const v1 = obj1[key];
        const v2 = obj2[key];

        if (v1 !== v2) return false;
    }

    return true;
};
