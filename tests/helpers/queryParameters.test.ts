import {describe, expect, it} from 'vitest';
import type {QueryParameter, QueryParameterType} from '../../src/types/queryParameters';
import {
    defaultType,
    defaultValue,
    escapeString,
    formatType,
    fromRaw,
    isNullLevel,
    isNullValue,
    nullableInfo,
    parameterKinds,
    toRaw,
    unescapeString,
    validType,
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
    it('validates JSON documents and Yson as JSON without rewriting text', () => {
        expect(() => fromRaw({kind: 'JsonDocument'}, '"not json"')).toThrow();
        expect(() => fromRaw({kind: 'Yson'}, JSON.stringify('{foo=42;}'))).toThrow();
        const yson = ' {"n":900719925474099312345, "nil":null} ';
        expect(fromRaw({kind: 'Yson'}, toRaw({kind: 'Yson'}, yson))).toBe(yson);
    });
});

describe('format validation', () => {
    it.each([
        ['Date', '2026-10-13'],
        ['Date32', '-123456-01-31'],
        ['Date32', '1-01-01'],
        ['Datetime64', '+123456-12-31T23:59:59Z'],
        ['Timestamp', '2026-10-13T12:34:56.123456Z'],
        ['Timestamp64', '-0001-01-01T00:00:00.1Z'],
        ['Datetime', '2026-10-13T00:00:00Z'],
        ['Interval', 'PT0S'],
        ['Interval64', '-P1D'],
        ['Interval', 'P1W2DT3000H4M5.123456S'],
        ['Uuid', 'ABCDEF12-1234-0000-FFFF-123456789abc'],
    ])('accepts %s %s and preserves its exact text', (kind, value) => {
        const type = {kind} as QueryParameterType;
        expect(validateParameters([parameter({type, value})])).toEqual({});
        expect(fromRaw(type, toRaw(type, value))).toBe(value);
    });
    it.each([
        ['Date', '-0001-01-01'],
        ['Date', '2026-00-01'],
        ['Date', '2026-13-01'],
        ['Date', '2026-01-00'],
        ['Date32', '1234567-01-01'],
        ['Date', '2026-01-32'],
        ['Datetime', '2026-01-01T24:00:00Z'],
        ['Datetime', '2026-01-01T12:60:00Z'],
        ['Datetime', '2026-01-01T12:00:60Z'],
        ['Datetime', '2026-01-01T12:00:00.1Z'],
        ['Timestamp', '2026-01-01T12:00:00.1234567Z'],
        ['Timestamp', '2026-01-01T12:00:00'],
        ['Timestamp', '2026-01-01T12:00:00+03:00'],
        ['Interval', '90'],
        ['Interval', 'P'],
        ['Interval', 'PT'],
        ['Interval', 'P1DT'],
        ['Interval', 'P1Y'],
        ['Interval', 'P1M'],
        ['Interval', 'PT1.1234567S'],
        ['Uuid', '123456781234123412341234567890ab'],
        ['Uuid', 'zzzzzzzz-1234-1234-1234-123456789abc'],
    ])('rejects %s %s', (kind, value) => {
        expect(
            validateParameters([parameter({type: {kind} as QueryParameterType, value})]).p.value?.$,
        ).toBeTruthy();
    });
    it('leaves timezone types and Utf8 unchecked', () => {
        for (const kind of [
            'TzDate',
            'TzDate32',
            'TzDatetime',
            'TzDatetime64',
            'TzTimestamp',
            'TzTimestamp64',
            'Utf8',
        ] as const) {
            expect(
                validateParameters([parameter({type: {kind}, value: 'arbitrary input'})]),
            ).toEqual({});
        }
    });
});

describe('nested nullable levels', () => {
    const type: QueryParameterType = {
        kind: 'Optional',
        item: {kind: 'Optional', item: {kind: 'Int32'}},
    };
    it('distinguishes outer NULL, inner NULL and present values', () => {
        expect(nullableInfo(type)).toEqual({type: {kind: 'Int32'}, levels: 2});
        for (const value of [null, {kind: 'optional-null' as const, depth: 1}, '42']) {
            expect(fromRaw(type, toRaw(type, value))).toEqual(value);
        }
        expect(isNullValue(type, null)).toBe(true);
        expect(isNullValue({kind: 'Int32'}, null)).toBe(false);
    });
    it('counts Pg as its own nullable level', () => {
        const pg: QueryParameterType = {kind: 'Optional', item: {kind: 'Pg', name: 'text'}};
        expect(nullableInfo(pg).levels).toBe(2);
        expect(fromRaw(pg, '{"kind":"optional-null","depth":1}')).toEqual({
            kind: 'optional-null',
            depth: 1,
        });
        expect(() =>
            fromRaw({kind: 'Pg', name: 'text'}, '{"kind":"optional-null","depth":1}'),
        ).toThrow();
    });
    it('rejects invalid depths and marker shapes', () => {
        for (const depth of [-1, 0, 1.5, 2, 3, '1']) {
            expect(() => fromRaw(type, JSON.stringify({kind: 'optional-null', depth}))).toThrow();
        }
        expect(isNullLevel({kind: 'optional-null', depth: 1, extra: true})).toBe(false);
        expect(() => fromRaw(type, '{"kind":"optional-null","depth":1,"extra":true}')).toThrow();
        expect(() => fromRaw({kind: 'String'}, '{"kind":"optional-null","depth":1}')).toThrow();
    });
    it('roundtrips markers inside collections without losing stable IDs', () => {
        const list: QueryParameterType = {kind: 'List', item: type};
        const value = [
            {id: 'outer', value: null},
            {id: 'inner', value: {kind: 'optional-null' as const, depth: 1}},
            {id: 'present', value: '42'},
        ];
        expect(fromRaw(list, toRaw(list, value), value)).toEqual(value);
        const invalid = [{id: 'inner', value: {kind: 'optional-null' as const, depth: 2}}];
        expect(
            validateParameters([parameter({type: list, value: invalid})]).p.value?.['$/inner'],
        ).toBeTruthy();
    });
});

describe('unknown schemas', () => {
    const type: QueryParameterType = {kind: 'Unknown', name: 'FutureType'};
    it('preserves JSON text and exposes the original type name without adding a picker choice', () => {
        expect(validType(type)).toBe(true);
        expect(formatType(type)).toBe('FutureType');
        expect(parameterKinds).not.toContain('Unknown');
        const value = ' {"n":900719925474099312345} ';
        expect(fromRaw(type, toRaw(type, value))).toBe(value);
        const list: QueryParameterType = {kind: 'List', item: type};
        expect(JSON.parse(toRaw(list, [{id: 'u', value}]))).toEqual([value]);
    });
    it('rejects invalid JSON and malformed schemas', () => {
        expect(
            validateParameters([parameter({type, value: 'raw invalid text'})]).p.value?.$,
        ).toBeTruthy();
        expect(validType({kind: 'Unknown', name: ''})).toBe(false);
        expect(validType({kind: 'FutureType'} as unknown as QueryParameterType)).toBe(false);
    });
});
