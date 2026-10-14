export type CodeComparisonMode = 'split' | 'unified';

/** Null means the diff has not completed or exceeded its computation limit. */
export type CodeComparisonStats = {added: number; removed: number} | null;

export type MonacoDiffEditorProps = {
    original: string;
    modified: string;
    language?: string;
    /** Uses the surrounding Gravity UI theme when omitted. Monaco themes are global. */
    theme?: string;
    mode?: CodeComparisonMode;
    /** Defaults to true when onChange is absent. */
    readOnly?: boolean;
    onChange?: (value: string) => void;
    onDiffChange?: (stats: CodeComparisonStats) => void;
    /** Maximum editor height in pixels, default 600. */
    maxHeight?: number;
    className?: string;
};
