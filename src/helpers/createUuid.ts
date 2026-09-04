export const createUuid = () => {
    return crypto.randomUUID().replace(/-/g, '');
};
