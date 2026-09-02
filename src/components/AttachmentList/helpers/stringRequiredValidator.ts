import i18n from '../i18n';

const DEFAULT_MAX_LENGTH = 256;

export type Validator = (value: unknown) => string | null;

export const stringRequiredValidator: Validator = (
    value: unknown,
    maxLength: number = DEFAULT_MAX_LENGTH,
) => {
    if (typeof value !== 'string') {
        return i18n('alert_value-must-be-string');
    }

    if (!value.trim()) {
        return i18n('alert_required-field');
    }

    if (value.length > maxLength) {
        return i18n('alert_max-length', {maxLength});
    }

    return null;
};
