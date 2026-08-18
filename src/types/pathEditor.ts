import {ReactNode} from 'react';
import type {NavigationItemKind} from './navigation';

export type PathEditorSuggestion = {
    parentPath: string;
    childPath: string;
    path: string;
    icon?: ReactNode;
    kind?: NavigationItemKind;
    targetPathBroken?: boolean;
};

export type PathEditorSuggestionFilter = (
    suggestions: PathEditorSuggestion[],
) => PathEditorSuggestion[];

export type PathEditorEventPayload = {
    path: string;
};

export type LoadPathSuggestionsParams = {
    path: string;
    customFilter: PathEditorSuggestionFilter | undefined;
    cluster: string | undefined;
};

export type LoadPathSuggestions = (
    params: LoadPathSuggestionsParams,
) => void | Promise<PathEditorSuggestion[]>;
