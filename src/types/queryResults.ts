import type {ReactNode} from 'react';
import type {EmptyContentVariant} from '../components/EmptyContent';
import type {AlignType, Settings} from '@gravity-ui/react-data-table';

export type QueryResultDataTypeParameter =
    | string
    | number
    | boolean
    | null
    | QueryResultDataType
    | readonly QueryResultDataType[]
    | readonly [string, QueryResultDataType][];

/** A YQL type tuple accepted by @gravity-ui/unipika. */
export type QueryResultDataType = readonly [string, ...QueryResultDataTypeParameter[]];

/** A format-independent description used only by the Schema view. */
export type QueryResultSchemaType = {
    name: string;
    parameters?: readonly (string | number | boolean | null)[];
    /** Number of optional wrappers around this node; defaults to zero. */
    optionalDepth?: number;
    tags?: readonly string[];
    children?: readonly {
        label?: string;
        type: QueryResultSchemaType;
    }[];
};

export type QueryResultFormatterSettings = {
    escapeWhitespace?: boolean;
    decodeUTF8?: boolean;
    showDecoded?: boolean;
    binaryAsHex?: boolean;
    escapeYQLStrings?: boolean;
    omitStructNull?: boolean;
    maxListSize?: number;
    maxStringSize?: number;
    compact?: boolean;
    /** Interpret YQL wire envelopes such as {val, inc, b64}. */
    treatValAsData?: boolean;
};

export type QueryResultColumn<TRow extends Record<string, unknown>> = {
    name: Extract<keyof TRow, string> | string;
    type: QueryResultDataType;
    /** Overrides Schema presentation without changing Result value formatting. */
    schemaType?: QueryResultSchemaType;
    header?: ReactNode;
    width?: number | string;
    align?: AlignType;
    render?: (context: QueryResultCellRenderContext<TRow>) => ReactNode;
};

export type QueryResultCellRenderContext<TRow extends Record<string, unknown>> = {
    row: TRow;
    value: unknown;
    index: number;
    column: QueryResultColumn<TRow>;
};

export type QueryResultCellOptions = {
    isIncomplete?: boolean;
    tag?: string;
    /** Literal clipboard text; an empty string is a valid override. */
    copyText?: string;
    /** Overrides table settings. An explicit undefined removes a limit. */
    formatterSettings?: QueryResultFormatterSettings;
};

export type QueryResultCellPreviewContext<TRow extends Record<string, unknown>> =
    QueryResultCellRenderContext<TRow> & {isIncomplete: boolean; tag?: string};

export type QueryResultCellSettings<TRow extends Record<string, unknown>> = {
    formatterSettings?: QueryResultFormatterSettings;
    maxVisibleLines?: number;
    /** Collapse only above this line count. Defaults to maxVisibleLines. */
    collapseAfterLines?: number;
    /** Replace HTML when formatted text reaches this length. Unlimited by default. */
    maxInlineTextLength?: number;
    getCellOptions?: (context: QueryResultCellRenderContext<TRow>) => QueryResultCellOptions;
    onCellPreview?: (context: QueryResultCellPreviewContext<TRow>) => void | Promise<void>;
};

/** Shared rendering and layout settings for every result table. */
export type QueryResultsTableSettings<TRow extends Record<string, unknown>> =
    QueryResultCellSettings<TRow> & {
        rowKey?: (row: TRow, index: number) => string | number;
        displayIndices?: boolean;
        stripedRows?: boolean;
        /** Set to false when the surrounding layout does not need a sticky header. */
        stickyHead?: Settings['stickyHead'] | false;
    };

export type QueryResultsTableProps<TRow extends Record<string, unknown>> =
    QueryResultsTableSettings<TRow> & {
        columns: Array<QueryResultColumn<TRow>>;
        /** Values use the YQL wire representation consumed by @gravity-ui/unipika. */
        rows: TRow[];
        loading?: boolean;
        loaded?: boolean;
        errorContent?: ReactNode;
        emptyVariant?: EmptyContentVariant;
        className?: string;
    };

export type QueryResultsView = 'result' | 'schema';

export type QueryResultsSchemaRenderContext<TRow extends Record<string, unknown>> = {
    columns: Array<QueryResultColumn<TRow>>;
};

export type QueryResultsProps<TRow extends Record<string, unknown>> =
    QueryResultsTableSettings<TRow> & {
        columns: Array<QueryResultColumn<TRow>>;
        /** Values use the YQL wire representation consumed by @gravity-ui/unipika. */
        rows: TRow[];
        totalRows?: number;
        loading?: boolean;
        errorContent?: ReactNode;
        title?: ReactNode;
        toolbarContent?: ReactNode;
        actions?: ReactNode;
        view?: QueryResultsView;
        defaultView?: QueryResultsView;
        onViewChange?: (view: QueryResultsView) => void;
        renderSchema?: (context: QueryResultsSchemaRenderContext<TRow>) => ReactNode;
        className?: string;
    };
