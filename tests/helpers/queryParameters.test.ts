import {describe, expect, it} from 'vitest';
import type {QueryParameter, QueryParameterType} from '../../src/types/queryParameters';
import {
    defaultType,
    defaultValue,
    escapeString,
    formatType,
    fromRaw,
    parameterKinds,
    toRaw,
    unescapeString,
    validateParameters,
} from '../../src/modules/QueryParameters/helpers/parameters';

const parameter = (patch: Partial<QueryParameter> = {}): QueryParameter => ({
    id: 'p',
    name: 'limit',
    type: {kind: 'Number'},
    value: '900719925474099312345',
    ...patch,
});

describe('query parameter validation', () => {
    it('preserves arbitrarily precise numeric and JSON text', () => {
        for (const kind of ['Number', 'Json'] as const) {
            const value =
                kind === 'Number'
                    ? '900719925474099312345.00001e1000'
                    : '{"n":900719925474099312345}';
            expect(fromRaw({kind}, toRaw({kind}, value))).toBe(value);
        }
        expect(validateParameters([parameter()])).toEqual({});
        expect(() => fromRaw({kind: 'Number'}, '900719925474099312345')).toThrow();
    });
    it('rejects invalid names, duplicates, schemas and numeric values', () => {
        expect(validateParameters([parameter({name: '   '})]).p.name).toBeTruthy();
        const duplicate = validateParameters([parameter(), parameter({id: 'q'})]);
        expect(duplicate.p.name).toBeTruthy();
        expect(duplicate.q.name).toBeTruthy();
        expect(validateParameters([parameter({value: 'Infinity'})]).p.value?.$).toBeTruthy();
        expect(
            validateParameters([parameter({type: {kind: 'Tuple', items: []}, value: []})]).p.type,
        ).toBeTruthy();
        expect(validateParameters([parameter({deleted: true, value: 'invalid'})])).toEqual({});
        expect(validateParameters([parameter(), parameter({deleted: true})]).p.name).toBeTruthy();
    });
    it('reports nested errors at stable paths and rejects duplicate sibling IDs', () => {
        const type: QueryParameterType = {
            kind: 'Dict',
            key: {kind: 'String'},
            value: {kind: 'List', item: {kind: 'Json'}},
        };
        const value = [{id: 'entry', key: 'a', value: [{id: 'child', value: 'bad'}]}];
        expect(
            validateParameters([parameter({type, value})]).p.value?.['$/entry/value/child'],
        ).toBeTruthy();
        expect(
            validateParameters([
                parameter({
                    type: {kind: 'List', item: {kind: 'String'}},
                    value: [
                        {id: 'same', value: 'a'},
                        {id: 'same', value: 'b'},
                    ],
                }),
            ]).p.value?.['$/same'],
        ).toBeTruthy();
    });
    it('rejects duplicate dictionary keys independently of entry IDs', () => {
        const type: QueryParameterType = {
            kind: 'Dict',
            key: {kind: 'String'},
            value: {kind: 'String'},
        };
        const value = [
            {id: 'a', key: 'same', value: 'one'},
            {id: 'b', key: 'same', value: 'two'},
        ];
        expect(validateParameters([parameter({type, value})]).p.value?.['$/b/key']).toBeTruthy();
        expect(() => fromRaw(type, '[["same","one"],["same","two"]]')).toThrow();
    });
    it('bounds recursive schemas including cycles', () => {
        const cyclic: QueryParameterType = {kind: 'List', item: {kind: 'String'}};
        cyclic.item = cyclic;
        expect(validateParameters([parameter({type: cyclic, value: []})]).p.type).toBeTruthy();
        expect(() => defaultValue(cyclic)).toThrow();
    });
});

describe('query parameter RAW conversion', () => {
    it('roundtrips nested collections and retains IDs', () => {
        const type: QueryParameterType = {
            kind: 'Dict',
            key: {kind: 'String'},
            value: {
                kind: 'Tuple',
                items: [
                    {kind: 'Number'},
                    {
                        kind: 'Variant',
                        options: [{id: 'option', name: 'Text', type: {kind: 'String'}}],
                    },
                ],
            },
        };
        const value = [
            {
                id: 'entry',
                key: 'a',
                value: [
                    {id: 'number', value: '0001'},
                    {id: 'variant', value: {optionId: 'option', value: 'hello'}},
                ],
            },
        ];
        const raw = toRaw(type, value);
        expect(JSON.parse(raw)).toEqual([['a', ['0001', {optionId: 'option', value: 'hello'}]]]);
        expect(fromRaw(type, raw, value)).toEqual(value);
    });
    it('rejects invalid shape, option, tuple arity and JSON contents', () => {
        expect(() => fromRaw(defaultType('Tuple'), '[]')).toThrow();
        expect(() => fromRaw(defaultType('Dict'), '[["key"]]')).toThrow();
        expect(() =>
            fromRaw(defaultType('Variant'), '{"optionId":"missing","value":"a"}'),
        ).toThrow();
        expect(() => fromRaw({kind: 'Json'}, '"not json"')).toThrow();
        expect(() => fromRaw({kind: 'String'}, '{')).toThrow();
    });
    it('supplies valid defaults for every supported kind', () => {
        for (const kind of parameterKinds) {
            const type = defaultType(kind);
            const value = defaultValue(type);
            expect(validateParameters([parameter({type, value})])).toEqual({});
            expect(formatType(type)).toContain(kind);
            expect(fromRaw(type, toRaw(type, value), value)).toEqual(value);
        }
    });
});

describe('escaped strings', () => {
    it('roundtrips backslashes, byte escapes, unicode and lone surrogates', () => {
        const value = '\\x41\u0000\nПривет 😀\ud800';
        expect(unescapeString(escapeString(value))).toBe(value);
        expect(unescapeString('\\x41\\u0410')).toBe('AА');
    });
    it('rejects incomplete and unknown escapes', () => {
        for (const value of ['\\', '\\x1', '\\u123', '\\xzz', '\\q'])
            expect(() => unescapeString(value)).toThrow();
    });
});

describe('extended parameter schemas', () => {
    it('preserves nullable booleans and nullable Pg text', () => {
        const optional: QueryParameterType = {kind: 'Optional', item: {kind: 'Bool'}};
        for (const value of [null, false, true]) {
            expect(fromRaw(optional, toRaw(optional, value))).toBe(value);
        }
        expect(() => fromRaw(optional, '"false"')).toThrow();
        const pg: QueryParameterType = {kind: 'Pg', name: 'text'};
        for (const value of [null, '', 'NULL', 'first\nsecond']) {
            expect(fromRaw(pg, toRaw(pg, value))).toBe(value);
        }
    });
    it('rejects invalid integer syntax without converting large integers', () => {
        const value = '18446744073709551615';
        expect(fromRaw({kind: 'Uint64'}, toRaw({kind: 'Uint64'}, value))).toBe(value);
        for (const [kind, value] of [
            ['Int64', '1.2'],
            ['Uint64', '-1'],
            ['Int32', '1e2'],
        ] as const) {
            expect(validateParameters([parameter({type: {kind}, value})]).p.value?.$).toBeTruthy();
        }
    });
    it('validates enum options and selected values', () => {
        const type: QueryParameterType = {kind: 'Enum', options: ['red', 'blue']};
        expect(fromRaw(type, '"blue"')).toBe('blue');
        expect(() => fromRaw(type, '"green"')).toThrow();
        expect(
            validateParameters([
                parameter({type: {kind: 'Enum', options: ['red', 'red']}, value: 'red'}),
            ]).p.type,
        ).toBeTruthy();
    });
    it('roundtrips named structs with stable schema IDs and nullable nested values', () => {
        const type: QueryParameterType = {
            kind: 'Struct',
            fields: [
                {id: 'name-id', name: '__proto__', type: {kind: 'Utf8'}},
                {id: 'enabled-id', name: 'enabled', type: {kind: 'Optional', item: {kind: 'Bool'}}},
            ],
        };
        const value = [
            {id: 'name-id', value: 'текст'},
            {id: 'enabled-id', value: null},
        ];
        const raw = toRaw(type, value);
        expect(JSON.parse(raw)).toEqual(JSON.parse('{"__proto__":"текст","enabled":null}'));
        expect(fromRaw(type, raw)).toEqual(value);
        expect(() => fromRaw(type, '{"enabled":null}')).toThrow();
        expect(() => fromRaw(type, '{"__proto__":"текст","enabled":null,"extra":"x"}')).toThrow();
        expect(
            validateParameters([parameter({type, value: [{id: 'wrong', value: ''}, value[1]]})]).p
                .value?.$,
        ).toBeTruthy();
        const invalid = [...value];
        invalid[1] = {id: 'enabled-id', value: 'true'};
        expect(
            validateParameters([parameter({type, value: invalid})]).p.value?.['$/enabled-id'],
        ).toBeTruthy();
    });
    it('validates JSON documents but leaves engine-specific YSON syntax intact', () => {
        expect(() => fromRaw({kind: 'JsonDocument'}, '"not json"')).toThrow();
        const yson = '{foo=42;bar=#;}';
        expect(fromRaw({kind: 'Yson'}, toRaw({kind: 'Yson'}, yson))).toBe(yson);
    });
});
