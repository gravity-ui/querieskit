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

export type QueryComparisonProps = {
    items: readonly QueryComparisonItem[];
    /** The application owns the right-hand draft. Omit for read-only comparison. */
    onBlockChange?: (id: string, value: string | null) => void;
    readOnly?: boolean;
    mode?: CodeComparisonMode;
    defaultMode?: CodeComparisonMode;
    onModeChange?: (mode: CodeComparisonMode) => void;
    /** Optional application-owned version selectors and actions. */
    header?: ReactNode;
    maxBlockHeight?: number;
    className?: string;
};
