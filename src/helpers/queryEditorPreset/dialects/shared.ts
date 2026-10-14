import type * as Monaco from 'monaco-editor';
import type {SqlAutocompleteResult} from '@gravity-ui/websql-autocomplete/shared';

import type {CompletionTarget, DialectAnalysis, DialectVocabulary} from './types';

type ParserResult = SqlAutocompleteResult & {
    suggestEntity?: string[];
    suggestViewsOrTables?: string;
};
type Parser = (query: string, position: Monaco.Position) => Promise<ParserResult>;

function completionContext(parsed: ParserResult | undefined, target: CompletionTarget) {
    const tableContext = Boolean(
        parsed?.suggestEntity?.includes('table') ||
        parsed?.suggestViewsOrTables ||
        /\b(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+(?:(?:`[^`]*`|"[^"]*"|[\w$]+)\s*\.\s*)?$/i.test(
            target.before,
        ),
    );
    return {
        tableContext,
        // Parsers may suggest tables and columns at the same expression position.
        // Only the lexical qualifier fallback must exclude table positions.
        columnContext: Boolean(
            parsed?.suggestColumns ||
            (!tableContext && (target.qualifier || parsed?.suggestFunctions)),
        ),
    };
}

async function parseCompletion(
    parse: Parser | undefined,
    query: string,
    position: Monaco.Position,
    target: CompletionTarget,
) {
    if (!parse) return undefined;
    try {
        const parseQuery =
            target.quoted && !target.closed
                ? query.slice(0, target.end) + target.quote + query.slice(target.end)
                : query;
        return await parse(parseQuery, position);
    } catch {
        // Incomplete queries can fail to parse; retain local vocabulary and
        // the narrow lexical table-context fallback used by unparsed dialects.
        return undefined;
    }
}

/** Normalize parser-specific fields here so consumers do not depend on parser APIs. */
export function createAnalysis(vocabulary: DialectVocabulary, parse?: Parser) {
    return async (
        query: string,
        position: Monaco.Position,
        target: CompletionTarget,
    ): Promise<DialectAnalysis> => {
        const parsed = await parseCompletion(parse, query, position, target);
        return {
            keywords: parsed?.suggestKeywords?.map(({value}) => value) ?? vocabulary.keywords,
            functions:
                !parse || parsed?.suggestFunctions || parsed?.suggestAggregateFunctions
                    ? (vocabulary.functions ?? [])
                    : [],
            operators: vocabulary.operators ?? [],
            types: vocabulary.types ?? [],
            aliases: parsed?.suggestColumnAliases?.map(({name}) => name) ?? [],
            columns: parsed?.suggestColumns?.tables?.flatMap((table) => table.columns ?? []) ?? [],
            ...completionContext(parsed, target),
        };
    };
}

export function quoteIdentifier(value: string, target: CompletionTarget) {
    if (target.quoted)
        return (
            value.split(target.quote).join(target.quote + target.quote) +
            (target.closed ? '' : target.quote)
        );
    if (/^[\w$]+$/.test(value)) return value;
    return '`' + value.split('`').join('``') + '`';
}

export function preserveRegisteredLanguage() {
    return () => {};
}
