import type {ReactNode} from 'react';
import type {AlignType} from '@gravity-ui/react-data-table';

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
};

export type QueryResultColumn<TRow extends Record<string, unknown>> = {
    name: Extract<keyof TRow, string> | string;
    type: QueryResultDataType;
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

export type QueryResultsView = 'result' | 'schema';

export type QueryResultsSchemaRenderContext<TRow extends Record<string, unknown>> = {
    columns: Array<QueryResultColumn<TRow>>;
};
