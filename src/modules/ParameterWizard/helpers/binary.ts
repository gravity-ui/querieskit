export function isValidHexString(hexStr: string) {
    if (hexStr === '') return true;
    return /^(?:[0-9a-fA-F]{2})+$/.test(hexStr);
}

export function hexToBase64(hexString: string) {
    if (hexString === '') return '';
    const bytesInHexFormat = hexString.match(/.{1,2}/g) as string[];
    const bytes = new Uint8Array(bytesInHexFormat.map((hexByte) => parseInt(hexByte, 16)));
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
}

export function base64ToHex(base64String: string) {
    const binaryString = atob(base64String);
    let hex = '';
    for (let i = 0; i < binaryString.length; i++) {
        const byte = binaryString.charCodeAt(i).toString(16);
        hex += byte.padStart(2, '0');
    }
    return hex;
}

export function reverseUuidBytes(hexUuid: string) {
    const reverseBytes = (bytes: string, start: number, length: number) => {
        let res = '';
        for (let i = 0; i < length; i++) {
            res += bytes.slice(start + (length - 1 - i) * 2, start + (length - 1 - i) * 2 + 2);
        }
        return res;
    };

    const leHex =
        reverseBytes(hexUuid, 0, 4) +
        reverseBytes(hexUuid, 8, 2) +
        reverseBytes(hexUuid, 12, 2) +
        hexUuid.slice(16, 32);

    return leHex;
}

export function isValidBase64String(str: string) {
    try {
        atob(str);
        return true;
    } catch {
        return false;
    }
}
