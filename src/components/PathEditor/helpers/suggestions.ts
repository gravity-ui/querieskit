import type {PathEditorSuggestion} from '../../../types/pathEditor';

export function filterByCurrentPath(
    currentPath: string,
    suggestions: PathEditorSuggestion[],
): PathEditorSuggestion[] {
    const path = currentPath.toLowerCase();

    return suggestions.filter((child) => {
        const hasPartOfPath = child.path.toLowerCase().startsWith(path);
        const isShowCurrentChild = child.path.toLowerCase() !== path || child.kind === 'folder';

        return hasPartOfPath && isShowCurrentChild;
    });
}

export function getNextSelectedIndex(suggestions: PathEditorSuggestion[], selectedIndex: number) {
    if (selectedIndex === -1 || selectedIndex === suggestions.length - 1) {
        return 0;
    }

    return selectedIndex + 1;
}

export function getPrevSelectedIndex(suggestions: PathEditorSuggestion[], selectedIndex: number) {
    if (selectedIndex === -1 || selectedIndex === 0) {
        return suggestions.length - 1;
    }

    return selectedIndex - 1;
}

export function getCompletedPath(suggestion: PathEditorSuggestion) {
    return suggestion.kind === 'folder' ? `${suggestion.path}/` : suggestion.path;
}

export function getLastFragment(path: string): string | undefined {
    const segments = path.split('/').filter(Boolean);
    return segments[segments.length - 1];
}
