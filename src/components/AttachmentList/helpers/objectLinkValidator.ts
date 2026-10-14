import type {EditLinkErrors} from '../../../types/attachmentsEditor';
import {stringRequiredValidator} from './stringRequiredValidator';

export const objectLinkValidator = (values: Record<string, unknown>, isTokenRequired?: boolean) => {
    const patchErrors: Partial<EditLinkErrors> = {};

    const linkError = stringRequiredValidator(values.link);

    if (linkError) {
        patchErrors['link'] = linkError;
    }

    const tokenError = isTokenRequired ? stringRequiredValidator(values.token) : null;

    if (tokenError) {
        patchErrors['token'] = tokenError;
    }

    const nameError = stringRequiredValidator(values.name);

    if (nameError) {
        patchErrors['name'] = nameError;
    }

    if (Object.keys(patchErrors).length === 0) {
        return null;
    }

    return patchErrors;
};
