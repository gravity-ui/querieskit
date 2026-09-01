const DEFAULT_MAX_LENGTH = 256;

export type Validator = (value: unknown) => string | null;

export const stringRequiredValidator: Validator = (
    value: unknown,
    maxLength: number = DEFAULT_MAX_LENGTH,
) => {
    if (typeof value !== 'string') {
        return 'Value must be string';
    }

    if (!value.trim()) {
        return 'Required field';
    }

    if (value.length > maxLength) {
        return `Max length is ${maxLength}`;
    }

    return null;
};
