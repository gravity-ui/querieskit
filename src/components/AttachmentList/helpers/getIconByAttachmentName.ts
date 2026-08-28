import {AbbrQl, AbbrSql, FileCode, LayoutList, LogoNodejs, LogoPython} from '@gravity-ui/icons';
import {LogoCPlusPlus} from '../../Icons';

const iconMatcher = {
    js: LogoNodejs,
    ql: AbbrQl,
    sql: AbbrSql,
    yql: AbbrSql,
    py: LogoPython,
    csv: LayoutList,
    xls: LayoutList,
    xlsx: LayoutList,
    cpp: LogoCPlusPlus,
    unknown: FileCode,
} as const;

export const getAttachmentExtension = (attachmentName: string) => {
    const name = attachmentName.split('/').pop();

    if (name === undefined) return 'unknown';

    const index = name?.lastIndexOf('.');

    if (index === undefined) return 'unknown';

    const extension = index > 0 ? name.slice(index + 1) : '';

    if (extension in iconMatcher) return extension as keyof typeof iconMatcher;

    return 'unknown';
};

export const getAttachmentIcon = (attachmentName: string) => {
    const extension = getAttachmentExtension(attachmentName);
    return iconMatcher[extension];
};
