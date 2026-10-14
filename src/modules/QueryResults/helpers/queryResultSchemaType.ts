import type {QueryResultSchemaType} from '../../../types/queryResults';

export type SchemaTypeNode = Omit<QueryResultSchemaType, 'children'> & {
    children?: readonly {label?: string; type: SchemaTypeNode}[];
    sourceDescription?: string;
};

type Parameter = string | number | boolean | null;

function isParameter(value: unknown): value is Parameter {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

/** Keep diagnostics textual, including values which JSON cannot normally serialize. */
function describeSource(value: unknown): string {
    const seen = new WeakSet<object>();
    try {
        return (
            JSON.stringify(value, (_key, item: unknown) => {
                if (typeof item === 'bigint' || typeof item === 'symbol') {
                    return String(item);
                }
                if (item && typeof item === 'object') {
                    if (seen.has(item)) {
                        return '[Circular]';
                    }
                    seen.add(item);
                }
                return item;
            }) ?? String(value)
        );
    } catch {
        return '[Unserializable value]';
    }
}

function unknownNode(value: unknown): SchemaTypeNode {
    return {name: 'Unknown', sourceDescription: describeSource(value)};
}

function isExactVoid(value: unknown): boolean {
    return Array.isArray(value) && value.length === 1 && value[0] === 'VoidType';
}

function withRecursionGuard(
    value: unknown,
    ancestors: Set<object>,
    build: () => SchemaTypeNode,
): SchemaTypeNode {
    if (!value || typeof value !== 'object' || ancestors.has(value) || ancestors.size >= 100) {
        return unknownNode(value);
    }
    ancestors.add(value);
    try {
        return build();
    } catch {
        return unknownNode(value);
    } finally {
        ancestors.delete(value);
    }
}

type BuildNode = (input: unknown) => SchemaTypeNode;

function buildScalar(input: unknown[]): SchemaTypeNode | undefined {
    const [kind, ...parameters] = input;
    const [first, ...dataParameters] = parameters;
    switch (kind) {
        case 'DataType':
            return typeof first === 'string' && first && dataParameters.every(isParameter)
                ? {
                      name: first,
                      ...(parameters.length > 1 && {parameters: dataParameters}),
                  }
                : unknownNode(input);
        case 'PgType': {
            if (parameters.length !== 1 || typeof first !== 'string' || !first) {
                return unknownNode(input);
            }
            const array = first.startsWith('_');
            const name = array ? first.slice(1) : first;
            return {
                name: `${array ? '_' : ''}${name.startsWith('pg') ? name : `pg${name}`}`,
            };
        }
        case 'VoidType':
        case 'NullType':
        case 'EmptyListType':
        case 'EmptyDictType':
            return parameters.length ? unknownNode(input) : {name: kind.slice(0, -4)};
        default:
            return undefined;
    }
}

function buildVariant(input: unknown[], build: BuildNode): SchemaTypeNode {
    const [, ...parameters] = input;
    const [first] = parameters;
    if (
        parameters.length !== 1 ||
        !Array.isArray(first) ||
        !['StructType', 'TupleType'].includes(first[0]) ||
        first.length !== 2 ||
        !Array.isArray(first[1])
    ) {
        return unknownNode(input);
    }
    const base = build(first);
    if (!base.children) {
        return unknownNode(input);
    }
    const isEnum = first[1].every((entry: unknown) =>
        first[0] === 'TupleType'
            ? isExactVoid(entry)
            : Array.isArray(entry) &&
              entry.length === 2 &&
              typeof entry[0] === 'string' &&
              isExactVoid(entry[1]),
    );
    return {
        name: isEnum ? 'Enum' : 'Variant',
        children: base.children.map((child, index) => ({
            ...child,
            ...(first[0] === 'TupleType' && {label: String(index)}),
        })),
    };
}

function buildContainer(input: unknown[], build: BuildNode): SchemaTypeNode {
    const [kind, ...parameters] = input;
    const [first, second] = parameters;
    switch (kind) {
        case 'ListType':
        case 'StreamType':
            return parameters.length === 1
                ? {name: kind.slice(0, -4), children: [{type: build(first)}]}
                : unknownNode(input);
        case 'DictType':
            if (parameters.length !== 2) {
                return unknownNode(input);
            }
            return isExactVoid(second)
                ? {name: 'Set', children: [{type: build(first)}]}
                : {name: 'Dict', children: [{type: build(first)}, {type: build(second)}]};
        case 'TupleType':
        case 'StructType': {
            if (parameters.length !== 1 || !Array.isArray(first)) {
                return unknownNode(input);
            }
            return {
                name: kind.slice(0, -4),
                children: first.map((entry: unknown) => {
                    if (kind === 'TupleType') {
                        return {type: build(entry)};
                    }
                    return Array.isArray(entry) &&
                        entry.length === 2 &&
                        typeof entry[0] === 'string'
                        ? {label: entry[0], type: build(entry[1])}
                        : {type: unknownNode(entry)};
                }),
            };
        }
        case 'VariantType':
            return buildVariant(input, build);
        default:
            return {name: describeSource(input)};
    }
}

/** Adapt legacy YQL tuples without changing the Result value formatter. */
export function buildQueryResultSchemaType(value: unknown): SchemaTypeNode {
    const ancestors = new Set<object>();
    const build: BuildNode = (input) =>
        withRecursionGuard(input, ancestors, () => {
            if (!Array.isArray(input) || typeof input[0] !== 'string' || !input[0]) {
                return unknownNode(input);
            }
            const [kind, ...parameters] = input;
            const [first, second] = parameters;
            switch (kind) {
                case 'OptionalType': {
                    if (parameters.length !== 1) {
                        return unknownNode(input);
                    }
                    const child = build(first);
                    return {...child, optionalDepth: (child.optionalDepth ?? 0) + 1};
                }
                case 'TaggedType': {
                    if (parameters.length !== 2 || typeof first !== 'string') {
                        return unknownNode(input);
                    }
                    const child = build(second);
                    return {...child, tags: [...(child.tags ?? []), first]};
                }
                default:
                    return buildScalar(input) ?? buildContainer(input, build);
            }
        });
    return build(value);
}

/** Validate caller-provided presentation nodes while preserving healthy siblings. */
export function normalizeQueryResultSchemaType(value: unknown): SchemaTypeNode {
    const ancestors = new Set<object>();
    const build = (input: unknown): SchemaTypeNode =>
        withRecursionGuard(input, ancestors, () => {
            if (Array.isArray(input)) {
                return unknownNode(input);
            }
            const node = input as Record<string, unknown>;
            if (
                typeof node.name !== 'string' ||
                !node.name ||
                (node.parameters !== undefined &&
                    (!Array.isArray(node.parameters) || !node.parameters.every(isParameter))) ||
                (node.optionalDepth !== undefined &&
                    (typeof node.optionalDepth !== 'number' ||
                        !Number.isSafeInteger(node.optionalDepth) ||
                        node.optionalDepth < 0)) ||
                (node.tags !== undefined &&
                    (!Array.isArray(node.tags) ||
                        !node.tags.every((tag: unknown) => typeof tag === 'string'))) ||
                (node.children !== undefined && !Array.isArray(node.children))
            ) {
                return unknownNode(input);
            }
            return {
                name: node.name,
                ...(node.parameters !== undefined && {parameters: node.parameters as Parameter[]}),
                ...(node.optionalDepth !== undefined && {
                    optionalDepth: node.optionalDepth as number,
                }),
                ...(node.tags !== undefined && {tags: node.tags as string[]}),
                ...(Array.isArray(node.children) && {
                    children: node.children.map((child: unknown) => {
                        if (!child || typeof child !== 'object' || Array.isArray(child)) {
                            return {type: unknownNode(child)};
                        }
                        const entry = child as Record<string, unknown>;
                        if (entry.label !== undefined && typeof entry.label !== 'string') {
                            return {type: unknownNode(child)};
                        }
                        return {
                            ...(entry.label !== undefined && {label: entry.label as string}),
                            type: build(entry.type),
                        };
                    }),
                }),
            };
        });
    return build(value);
}
