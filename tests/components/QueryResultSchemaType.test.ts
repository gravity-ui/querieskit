import {describe, expect, it} from 'vitest';

import {
    buildQueryResultSchemaType as build,
    normalizeQueryResultSchemaType as normalize,
} from '../../src/modules/QueryResults/helpers/queryResultSchemaType';

const string = ['DataType', 'String'];
const voidType = ['VoidType'];

describe('Schema YQL type adapter', () => {
    it.each(['String', 'Int64', 'Float'])('preserves primitive %s', (name) => {
        expect(build(['DataType', name])).toEqual({name});
    });

    it('preserves scalar parameters including zero and false', () => {
        expect(build(['DataType', 'Decimal', '10', '2'])).toEqual({
            name: 'Decimal',
            parameters: ['10', '2'],
        });
        expect(build(['DataType', 'Custom', 0, false, null])).toEqual({
            name: 'Custom',
            parameters: [0, false, null],
        });
    });

    it('counts optional wrappers and keeps tags in inner-to-outer order', () => {
        expect(
            build([
                'OptionalType',
                [
                    'TaggedType',
                    'outer',
                    ['OptionalType', ['TaggedType', 'inner', ['OptionalType', string]]],
                ],
            ]),
        ).toEqual({name: 'String', optionalDepth: 3, tags: ['inner', 'outer']});
    });

    it('keeps modifiers attached to the owning node', () => {
        expect(build(['OptionalType', ['ListType', ['TaggedType', 'item', string]]])).toEqual({
            name: 'List',
            optionalDepth: 1,
            children: [{type: {name: 'String', tags: ['item']}}],
        });
        expect(build(['TaggedType', 'list', ['ListType', ['OptionalType', string]]])).toEqual({
            name: 'List',
            tags: ['list'],
            children: [{type: {name: 'String', optionalDepth: 1}}],
        });
    });

    it.each(['List', 'Stream'])('adapts %s', (name) => {
        expect(build([`${name}Type`, string])).toEqual({
            name,
            children: [{type: {name: 'String'}}],
        });
    });

    it('preserves tuple order and does not interpret struct field names as types', () => {
        expect(build(['TupleType', [string, ['DataType', 'Int64']]])).toEqual({
            name: 'Tuple',
            children: [{type: {name: 'String'}}, {type: {name: 'Int64'}}],
        });
        expect(
            build([
                'StructType',
                [
                    ['DataType', string],
                    ['OptionalType', voidType],
                ],
            ]),
        ).toEqual({
            name: 'Struct',
            children: [
                {label: 'DataType', type: {name: 'String'}},
                {label: 'OptionalType', type: {name: 'Void'}},
            ],
        });
    });

    it('uses Set only for an exact Void value', () => {
        expect(build(['DictType', string, voidType])).toEqual({
            name: 'Set',
            children: [{type: {name: 'String'}}],
        });
        expect(build(['DictType', string, ['OptionalType', voidType]])).toEqual({
            name: 'Dict',
            children: [{type: {name: 'String'}}, {type: {name: 'Void', optionalDepth: 1}}],
        });
        expect(build(['DictType', string, ['VoidType', 'invalid']]).name).toBe('Dict');
    });

    it('labels Variant alternatives by field name or zero-based index', () => {
        expect(
            build([
                'VariantType',
                [
                    'StructType',
                    [
                        ['one', string],
                        ['two', voidType],
                    ],
                ],
            ]),
        ).toEqual({
            name: 'Variant',
            children: [
                {label: 'one', type: {name: 'String'}},
                {label: 'two', type: {name: 'Void'}},
            ],
        });
        expect(build(['VariantType', ['TupleType', [string, voidType]]])).toEqual({
            name: 'Variant',
            children: [
                {label: '0', type: {name: 'String'}},
                {label: '1', type: {name: 'Void'}},
            ],
        });
    });

    it('recognizes named and indexed Enum alternatives only for exact Void types', () => {
        expect(
            build([
                'VariantType',
                [
                    'StructType',
                    [
                        ['red', voidType],
                        ['blue', voidType],
                    ],
                ],
            ]),
        ).toEqual({
            name: 'Enum',
            children: [
                {label: 'red', type: {name: 'Void'}},
                {label: 'blue', type: {name: 'Void'}},
            ],
        });
        expect(build(['VariantType', ['TupleType', [voidType, voidType]]])).toEqual({
            name: 'Enum',
            children: [
                {label: '0', type: {name: 'Void'}},
                {label: '1', type: {name: 'Void'}},
            ],
        });
        expect(build(['VariantType', ['TupleType', [['OptionalType', voidType]]]]).name).toBe(
            'Variant',
        );
    });

    it.each(['Void', 'Null', 'EmptyList', 'EmptyDict'])('adapts %s', (name) => {
        expect(build([`${name}Type`])).toEqual({name});
    });

    it.each([
        ['int4', 'pgint4'],
        ['_int4', '_pgint4'],
        ['pgint4', 'pgint4'],
        ['_pgint4', '_pgint4'],
    ])('normalizes PostgreSQL %s to %s', (input, name) => {
        expect(build(['PgType', input])).toEqual({name});
    });

    it('keeps unsupported tuples as plain source text', () => {
        const input = ['FutureType', '<script>', {custom: true}];
        expect(build(input)).toEqual({name: JSON.stringify(input)});
    });

    it.each([
        null,
        undefined,
        'String',
        [],
        [12],
        [''],
        ['DataType'],
        ['DataType', 'String', {}],
        ['PgType'],
        ['OptionalType'],
        ['TaggedType', 1, string],
        ['ListType'],
        ['DictType', string],
        ['StructType', {}],
        ['TupleType'],
        ['VariantType', string],
        ['VoidType', 1],
    ])('provides source diagnostics for malformed input %j', (input) => {
        expect(build(input)).toMatchObject({
            name: 'Unknown',
            sourceDescription: expect.any(String),
        });
    });

    it('isolates malformed fields and preserves valid siblings', () => {
        const result = build(['StructType', [['valid', string], ['broken', null], 7]]);
        expect(result.children).toEqual([
            {label: 'valid', type: {name: 'String'}},
            {label: 'broken', type: {name: 'Unknown', sourceDescription: 'null'}},
            {type: {name: 'Unknown', sourceDescription: '7'}},
        ]);
    });

    it('handles cycles and repeated non-cyclic references independently', () => {
        const cycle: unknown[] = ['ListType'];
        cycle.push(cycle);
        expect(build(cycle).children?.[0].type).toMatchObject({
            name: 'Unknown',
            sourceDescription: expect.stringContaining('[Circular]'),
        });
        expect(build(['TupleType', [string, string]]).children).toEqual([
            {type: {name: 'String'}},
            {type: {name: 'String'}},
        ]);
    });

    it('does not crash on excessive nesting or unserializable diagnostics', () => {
        let input: unknown = string;
        for (let i = 0; i < 1000; i++) {
            input = ['ListType', input];
        }
        expect(() => build(input)).not.toThrow();
        expect(build({value: BigInt(1)}).sourceDescription).toBe('{"value":"1"}');
        expect(
            build({
                toJSON() {
                    throw new Error('bad source');
                },
            }),
        ).toEqual({
            name: 'Unknown',
            sourceDescription: '[Unserializable value]',
        });
    });
});

describe('neutral Schema type normalization', () => {
    it('supports arbitrary names and retains labels, parameters, tags and optional depth', () => {
        const input = {
            name: 'Vendor<Custom>',
            parameters: [1, 'two', false, null],
            optionalDepth: 2,
            tags: ['first', 'second'],
            children: [{label: 'DataType', type: {name: 'anything'}}],
        };
        expect(normalize(input)).toEqual(input);
    });

    it('isolates invalid children while preserving valid siblings', () => {
        expect(
            normalize({
                name: 'Record',
                children: [
                    {label: 'good', type: {name: 'String'}},
                    {label: 'bad', type: null},
                    false,
                ],
            }),
        ).toEqual({
            name: 'Record',
            children: [
                {label: 'good', type: {name: 'String'}},
                {label: 'bad', type: {name: 'Unknown', sourceDescription: 'null'}},
                {type: {name: 'Unknown', sourceDescription: 'false'}},
            ],
        });
    });

    it.each([
        null,
        {},
        [],
        {name: ''},
        {name: 'X', optionalDepth: -1},
        {name: 'X', optionalDepth: Infinity},
        {name: 'X', optionalDepth: 1.5},
        {name: 'X', tags: [1]},
        {name: 'X', parameters: [{}]},
        {name: 'X', children: {}},
    ])('normalizes malformed public nodes %j', (input) => {
        expect(normalize(input)).toMatchObject({
            name: 'Unknown',
            sourceDescription: expect.any(String),
        });
    });

    it('terminates cyclic nodes while accepting repeated references', () => {
        const input: {name: string; children: {type: unknown}[]} = {name: 'Tree', children: []};
        input.children.push({type: input});
        expect(normalize(input).children?.[0].type.name).toBe('Unknown');
        const leaf = {name: 'Leaf'};
        expect(normalize({name: 'Tree', children: [{type: leaf}, {type: leaf}]}).children).toEqual([
            {type: leaf},
            {type: leaf},
        ]);
    });
});
