import type {ReactNode} from 'react';
import type {CodeComparisonMode} from './monacoDiffEditor';

export type QueryComparisonItem = {
    /** Stable, unique ID; also identifies the block's local UI state. */
    id: string;
    title: string;
    language?: string;
    /** null is an absent file, whereas an empty string is an existing empty file. */
    original: string | null;
    modified: string | null;
};

export type QueryComparisonVersion = {
    id: string;
    /** Include the query name and version/date when needed to distinguish versions. */
    title: string;
};

export type QueryComparisonVersionPair = {originalId: string; modifiedId: string};

export type QueryComparisonVersionSelection = QueryComparisonVersionPair & {
    options: readonly QueryComparisonVersion[];
    /** Selection and swap requests are atomic. The application supplies the new items. */
    onChange: (versions: QueryComparisonVersionPair) => void;
    disabled?: boolean;
};

export type QueryComparisonActions = {
    /** Reset the draft to the selected modified version, not to the original version. */
    onReset?: () => void;
    onSave?: () => void;
    onCreateQuery?: () => void;
    /** Enables reset/save when their callbacks are supplied. Defaults to false. */
    hasChanges?: boolean;
    pendingAction?: 'save' | 'create';
    disabled?: boolean;
};

export type QueryComparisonProps = {
    items: readonly QueryComparisonItem[];
    /** The application owns the right-hand draft. Omit for read-only comparison. */
    onBlockChange?: (id: string, value: string | null) => void;
    readOnly?: boolean;
    mode?: CodeComparisonMode;
    defaultMode?: CodeComparisonMode;
    onModeChange?: (mode: CodeComparisonMode) => void;
    versionSelection?: QueryComparisonVersionSelection;
    actions?: QueryComparisonActions;
    /** Optional custom left-hand content replacing the built-in version selectors. */
    header?: ReactNode;
    maxBlockHeight?: number;
    className?: string;
};
