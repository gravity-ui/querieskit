import type * as Monaco from 'monaco-editor';

import type {EditorProviderContext} from './editorProviders';

export type QueryEditorLanguage = 'yql' | 'clickhouse' | 'ytql' | 'spyt';

export type QueryCatalogRequest = EditorProviderContext & {
    language: string;
    path: string;
    token: Monaco.CancellationToken;
};

export type QueryCatalogItem = {
    name: string;
    path?: string;
    kind: 'directory' | 'table';
    detail?: string;
};

export type QueryTableColumn = {name: string; type?: string; detail?: string};

export type QueryEditorReference = {
    kind: 'table';
    identifier: string;
    range: Monaco.IRange;
    clusterId?: string;
};

export type QueryEditorPresetOptions = {
    /** Omitted means all supported languages. Parsers load only on completion requests. */
    languages?: readonly QueryEditorLanguage[];
    listPathChildren?: (
        request: QueryCatalogRequest,
    ) => Promise<readonly QueryCatalogItem[]> | readonly QueryCatalogItem[];
    getTableSchema?: (
        request: QueryCatalogRequest,
    ) => Promise<readonly QueryTableColumn[]> | readonly QueryTableColumn[];
    onReferenceClick?: (reference: QueryEditorReference) => void;
};
