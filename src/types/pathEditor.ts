import {ReactNode} from 'react';
import type {NavigationItemKind} from './navigation';

export type PathEditorSuggestion = {
    parentPath: string;
    childPath: string;
    path: string;
    /** Explicit icon, takes precedence over `kind`. */
    icon?: ReactNode;
    /** General category used to resolve a default icon when `icon` is not set. */
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
