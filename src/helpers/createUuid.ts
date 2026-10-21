export const createUuid = () => {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID().replace(/-/g, '');
    }

    // randomUUID is unavailable on HTTP origins that are not secure contexts.
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    // eslint-disable-next-line no-bitwise -- UUID v4 version bits.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // eslint-disable-next-line no-bitwise -- RFC 4122 variant bits.
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};
