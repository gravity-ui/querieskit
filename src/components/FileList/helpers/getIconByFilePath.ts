import {AbbrQl, AbbrSql, FileCode, LogoNodejs, LogoPython} from '@gravity-ui/icons';
import {LogoCPlusPlus, TableIcon} from '../../Icons';

const iconMatcher = {
    js: LogoNodejs,
    ql: AbbrQl,
    sql: AbbrSql,
    yql: AbbrSql,
    py: LogoPython,
    csv: TableIcon,
    xls: TableIcon,
    xlsx: TableIcon,
    cpp: LogoCPlusPlus,
    unknown: FileCode,
} as const;

export const getFileExtension = (filePath: string) => {
    const name = filePath.split('/').pop();

    if (name === undefined) return 'unknown';

    const index = name?.lastIndexOf('.');

    if (index === undefined) return 'unknown';

    const extension = index > 0 ? name.slice(index + 1) : '';

    if (extension in iconMatcher) return extension as keyof typeof iconMatcher;

    return 'unknown';
};

export const getFileIcon = (filePath: string) => {
    const extension = getFileExtension(filePath);
    return iconMatcher[extension];
};
