import type {CompletionTarget, QueryNamespace} from './dialects/types';

// Dialect parsers own completion context. This best-effort lexical scanner supplies
// source ranges and physical references for schema requests and navigation; it is
// also the fallback for dialects without a parser. It is not a SQL AST: CTE output
// inference, table functions and arbitrary dialect-specific grammar are not modeled.
export type QueryToken = {text: string; start: number; end: number};
export type TableReference = {
    identifier: string;
    clusterId?: string;
    alias?: string;
    start: number;
    end: number;
};

export function tokenize(query: string, includeComments = false): QueryToken[] {
    const tokens: QueryToken[] = [];
    const pattern =
        /--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:''|\\.|[^'\\])*(?:'|$)|`(?:``|\\.|[^`\\])*(?:`|$)|"(?:""|\\.|[^"\\])*(?:"|$)|[\w$]+|[^\s]/g;
    for (const match of query.matchAll(pattern)) {
        const text = match[0];
        if (includeComments || (!text.startsWith('--') && !text.startsWith('/*'))) {
            tokens.push({text, start: match.index, end: match.index + text.length});
        }
    }
    return tokens;
}

export function unquote(value: string): string {
    const quote = value[0];
    return quote === '`' || quote === '"'
        ? value
              .slice(1, value.endsWith(quote) && value.length > 1 ? -1 : undefined)
              .split(quote + quote)
              .join(quote)
        : value;
}

function isIdentifier(token?: QueryToken): token is QueryToken {
    return Boolean(token && /^(?:[\w$]|`|")/.test(token.text));
}

export function activeCluster(query: string, fallback?: string): string | undefined {
    const tokens = tokenize(query);
    let cluster = fallback;
    tokens.forEach((token, index) => {
        if (token.text.toUpperCase() === 'USE' && isIdentifier(tokens[index + 1])) {
            cluster = unquote(tokens[index + 1].text);
        }
    });
    return cluster;
}

export function completionCluster(
    namespace: QueryNamespace,
    query: string,
    fallback?: string,
    qualifier?: string,
) {
    return namespace === 'database' ? fallback : (qualifier ?? activeCluster(query, fallback));
}

export function tableReferences(
    query: string,
    fallback?: string,
    namespace: QueryNamespace = 'cluster',
): TableReference[] {
    const tokens = tokenize(query);
    const references: TableReference[] = [];
    const fromDepths = new Set<number>();
    let depth = 0;
    tokens.forEach((token, index) => {
        if (token.text === '(') depth += 1;
        if (token.text === ')') {
            fromDepths.delete(depth);
            depth -= 1;
        }
        if (/^(WHERE|GROUP|ORDER|HAVING|LIMIT|UNION|;|ON)$/i.test(token.text))
            fromDepths.delete(depth);
        if (/^FROM$/i.test(token.text)) fromDepths.add(depth);
        if (
            !/^(FROM|JOIN|UPDATE|INTO|TABLE)$/i.test(token.text) &&
            !(token.text === ',' && fromDepths.has(depth))
        )
            return;
        const name = referenceName(query, tokens, index + 1, fallback, namespace);
        if (!name) return;
        const {first, last, identifier, clusterId} = name;
        let {next} = name;
        if (tokens[next]?.text === '(') return;
        if (tokens[next]?.text.toUpperCase() === 'AS') next += 1;
        const alias = tokens[next];
        references.push({
            identifier,
            clusterId,
            start: first.start,
            end: last.end,
            alias:
                isIdentifier(alias) &&
                !/^(WHERE|JOIN|LEFT|RIGHT|INNER|FULL|CROSS|ON|GROUP|ORDER|LIMIT|UNION|SET|HAVING|WINDOW)$/i.test(
                    alias.text,
                )
                    ? unquote(alias.text)
                    : undefined,
        });
    });
    return references;
}

export function completionTarget(query: string, offset: number): CompletionTarget {
    const tokens = tokenize(query);
    const token = tokens.find((item) => item.start < offset && item.end >= offset);
    const quoted = token && /^[`"]/.test(token.text);
    const start = quoted
        ? token.start + 1
        : offset - (query.slice(0, offset).match(/[\w$]*$/)?.[0].length || 0);
    const closed = Boolean(quoted && token.text.length > 1 && token.text.endsWith(token.text[0]));
    let end = offset + (query.slice(offset).match(/^[\w$]*/)?.[0].length || 0);
    if (quoted) end = token.end - Number(closed);
    const prefix = query.slice(start, offset);
    const before = query.slice(0, quoted ? token.start : start);
    const qualifier = before.match(/(`(?:``|[^`])+`|"(?:""|[^"])+"|[\w$]+)\s*\.\s*$/)?.[1];
    return {
        start,
        end,
        prefix,
        quoted: Boolean(quoted),
        closed,
        quote: quoted ? token.text[0] : '`',
        qualifier: qualifier ? unquote(qualifier) : undefined,
        before,
    };
}

type QueryScope = {start: number; end: number; unions: number[]};

function queryScopes(query: string, tokens: QueryToken[]) {
    const scopes: QueryScope[] = [{start: 0, end: query.length + 1, unions: []}];
    const stack: QueryScope[] = [];
    for (const token of tokens) {
        if (token.text === '(') {
            const scope: QueryScope = {start: token.start, end: query.length + 1, unions: []};
            stack.push(scope);
            scopes.push(scope);
        } else if (token.text === ')') {
            const scope = stack.pop();
            if (scope) scope.end = token.end;
        } else if (token.text.toUpperCase() === 'UNION') {
            (stack[stack.length - 1] ?? scopes[0]).unions.push(token.start);
        }
    }
    return scopes;
}

/** Returns physical references visible at the cursor, with inner aliases shadowing outer aliases. */
export function visibleTableReferences(
    query: string,
    offset: number,
    clusterId: string | undefined,
    namespace: QueryNamespace,
) {
    const tokens = tokenize(query);
    const scopes = queryScopes(query, tokens);
    const scopeAt = (position: number) =>
        [...scopes].reverse().find((scope) => scope.start <= position && position < scope.end) ??
        scopes[0];
    const cursorScope = scopeAt(offset);
    const isVisible = (scope: QueryScope, position: number) =>
        scope.start <= cursorScope.start &&
        scope.end >= cursorScope.end &&
        // Each UNION operand owns its table aliases, including when the cursor
        // is inside a correlated subquery of that operand.
        scope.unions.filter((boundary) => boundary <= position).length ===
            scope.unions.filter((boundary) => boundary <= offset).length;
    const separators = tokens.filter((token) => token.text === ';');
    const statementStart = [...separators].reverse().find((token) => token.end <= offset)?.end ?? 0;
    const statementEnd = separators.find((token) => token.start >= offset)?.start ?? query.length;
    const computedTables: {name: string; scope: QueryScope}[] = [];
    const tokensByStart = new Map(tokens.map((token) => [token.start, token]));
    for (let index = 0; index < tokens.length - 2; index += 1) {
        const token = tokens[index];
        if (token.start < statementStart || token.end > statementEnd) continue;
        // WITH name AS (...) and subsequent CTEs declare relations in the enclosing scope.
        if (
            isIdentifier(token) &&
            tokens[index + 1].text.toUpperCase() === 'AS' &&
            tokens[index + 2].text === '('
        ) {
            computedTables.push({name: unquote(token.text), scope: scopeAt(token.start)});
        }
    }
    const visible = tableReferences(query, clusterId, namespace)
        .map((reference) => ({reference, scope: scopeAt(reference.start)}))
        .filter(({reference, scope}) => isVisible(scope, reference.start))
        .filter(({reference, scope}) => {
            const source = tokensByStart.get(reference.start);
            // Match the original unqualified token, before USE adds a database
            // prefix. Explicit qualifiers denote physical tables.
            if (!source || source.end !== reference.end) return true;
            return !computedTables.some(
                (computed) =>
                    computed.scope.start <= scope.start &&
                    computed.scope.end >= scope.end &&
                    unquote(source.text) === computed.name,
            );
        });
    // Restrict shadowing to explicit aliases: unqualified table names from different
    // namespaces can legitimately coexist and must keep both schema sources.
    return visible
        .filter(
            ({reference, scope}) =>
                !reference.alias ||
                !visible.some(
                    (other) =>
                        other.reference.alias === reference.alias &&
                        other.scope.start > scope.start &&
                        other.scope.end < scope.end,
                ),
        )
        .map(({reference}) => reference);
}

function referenceName(
    query: string,
    tokens: QueryToken[],
    index: number,
    fallback: string | undefined,
    namespace: QueryNamespace,
) {
    const first = tokens[index];
    if (!isIdentifier(first)) return undefined;
    let last = first;
    let next = index + 1;
    const databaseNamespace = namespace === 'database';
    const defaultNamespace = activeCluster(query.slice(0, first.start));
    let clusterId = completionCluster(namespace, query.slice(0, first.start), fallback);
    let identifier = unquote(first.text);
    if (databaseNamespace && defaultNamespace) identifier = defaultNamespace + '.' + identifier;
    if (tokens[next]?.text === '.' && isIdentifier(tokens[next + 1])) {
        if (!databaseNamespace) clusterId = unquote(first.text);
        last = tokens[next + 1];
        identifier = databaseNamespace
            ? unquote(first.text) + '.' + unquote(last.text)
            : unquote(last.text);
        next += 2;
    }
    return {first, last, identifier, clusterId, next};
}
