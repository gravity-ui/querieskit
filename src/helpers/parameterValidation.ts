const decimalPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
const specialNumberPattern = /^[+-]?(?:inf|nan)$/i;

function validateInteger(value: string, name: string, bits: bigint) {
    const unsigned = name.startsWith('Uint');
    if (!/^[+-]?\d+$/.test(value)) return false;
    const min = unsigned ? 0n : -(2n ** (bits - 1n));
    const max = unsigned ? 2n ** bits - 1n : 2n ** (bits - 1n) - 1n;
    const integer = BigInt(value);
    return integer >= min && integer <= max;
}

function validateDecimal(value: string, params?: readonly unknown[]) {
    if (specialNumberPattern.test(value)) return true;
    const match = /^[+-]?(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:e([+-]?\d+))?$/i.exec(value);
    if (!match) return false;
    const [precision, scale] = params?.map(Number) || [];
    if (!Number.isInteger(precision) || !Number.isInteger(scale)) return true;
    const fraction = match[2] || match[3] || '';
    const digits = ((match[1] || '') + fraction).replace(/^0+/, '');
    if (!digits) return true;
    const significantDigits = digits.replace(/0+$/, '');
    const trailingZeros = digits.length - significantDigits.length;
    // Count decimal places without materializing the exponent or losing numeric precision.
    const decimalPlaces = BigInt(fraction.length - trailingZeros) - BigInt(match[4] || '0');
    const integerDigits = BigInt(significantDigits.length) - decimalPlaces;
    return integerDigits <= BigInt(precision - scale) && decimalPlaces <= BigInt(scale);
}

/** Validates numeric parameter strings without losing integer precision through JS Number. */
export function validateNumericValue(
    value: unknown,
    name: string,
    params?: readonly unknown[],
): boolean {
    if (typeof value !== 'string') return false;
    const integer = /^(?:Uint|Int)(8|16|32|64)$/.exec(name);
    if (integer) return validateInteger(value, name, BigInt(integer[1]));
    switch (name) {
        case 'Decimal':
            return validateDecimal(value, params);
        case 'Float':
        case 'Double':
            return specialNumberPattern.test(value) || decimalPattern.test(value);
        case 'DyNumber':
        case 'Number':
            return decimalPattern.test(value);
        default:
            return false;
    }
}
