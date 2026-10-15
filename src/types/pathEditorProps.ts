import type {FocusEvent} from 'react';
import type {
    LoadPathSuggestions,
    PathEditorEventPayload,
    PathEditorSuggestion,
    PathEditorSuggestionFilter,
} from './pathEditor';

export type PathEditorProps = {
    className?: string;
    placeholder?: string;
    defaultPath?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    hasClear?: boolean;
    showErrors?: boolean;
    customFilter?: PathEditorSuggestionFilter;
    cluster?: string;
    suggestions?: PathEditorSuggestion[];
    suggestionsError?: boolean;
    errorMessage?: string;
    onLoadSuggestions?: LoadPathSuggestions;
    onChange?: (path: string) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>, payload: PathEditorEventPayload) => void;
    onBlur?: (path: string) => void;
    onApply?: (path: string) => void;
    onCancel?: () => void;
};
