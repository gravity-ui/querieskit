import type {LoadPathSuggestionsParams, PathEditorSuggestion} from '../../types/pathEditor';
import type {NavigationItemKind} from '../../types/navigation';

type MockNode = {
    name: string;
    kind: NavigationItemKind;
    children?: MockNode[];
};

const TREE: MockNode = {
    name: '',
    kind: 'folder',
    children: [
        {
            name: 'home',
            kind: 'folder',
            children: [
                {
                    name: 'user',
                    kind: 'folder',
                    children: [
                        {
                            name: 'projects',
                            kind: 'folder',
                            children: [
                                {name: 'favorites', kind: 'folder'},
                                {name: 'query.sql', kind: 'file'},
                            ],
                        },
                        {name: 'tmp', kind: 'folder'},
                        {name: 'events', kind: 'table'},
                        {name: 'events_dyn', kind: 'table'},
                    ],
                },
                {
                    name: 'my-projects',
                    kind: 'folder',
                    children: [
                        {name: 'favorites', kind: 'folder'},
                        {
                            name: 'very',
                            kind: 'folder',
                            children: [
                                {
                                    name: 'long',
                                    kind: 'folder',
                                    children: [
                                        {
                                            name: 'nested',
                                            kind: 'folder',
                                            children: [
                                                {
                                                    name: 'directory',
                                                    kind: 'folder',
                                                    children: [{name: 'structure', kind: 'folder'}],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {name: 'tmp', kind: 'folder'},
        {name: 'sys', kind: 'unknown'},
    ],
};

function getParentPath(path: string): string {
    if (!path || path === '/') {
        return '/';
    }

    const normalized = path.endsWith('/') ? path.slice(0, -1) : path;
    const index = normalized.lastIndexOf('/');
    return index <= 0 ? '/' : normalized.slice(0, index);
}

function findNode(path: string): MockNode | undefined {
    if (path === '/' || path === '') {
        return TREE;
    }

    const parts = path.split('/').filter(Boolean);
    let current: MockNode | undefined = TREE;

    for (const part of parts) {
        current = current.children?.find((child) => child.name === part);
        if (!current) {
            return undefined;
        }
    }

    return current;
}

export async function mockLoadPathSuggestions({
    path,
}: LoadPathSuggestionsParams): Promise<PathEditorSuggestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const parentPath = getParentPath(path);
    const parent = findNode(parentPath);
    const children = parent?.children ?? [];
    const prefix = parentPath === '/' ? '' : parentPath;

    return children
        .map((child) => ({
            parentPath,
            childPath: `/${child.name}`,
            path: `${prefix}/${child.name}`,
            kind: child.kind,
        }))
        .sort((a, b) => a.childPath.localeCompare(b.childPath));
}
