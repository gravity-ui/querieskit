import {useMemo} from 'react';
import {NavigationItem} from '../../../types/navigation';
import {getParentPath} from '../../../helpers/getParentPath';

export function useParentRow(
    path: string | undefined,
    search: string | undefined,
): NavigationItem | undefined {
    const parentPath = path && !search ? getParentPath(path) : undefined;

    return useMemo<NavigationItem | undefined>(() => {
        if (!parentPath) {
            return undefined;
        }

        return {
            path: parentPath,
            title: '\u2026',
            kind: 'folder',
            hasChildren: true,
        };
    }, [parentPath]);
}
