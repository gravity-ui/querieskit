import {describe, expect, it} from 'vitest';
import {formatQueryResultValue} from '../../src/components/QueryResultsTable/helpers/formatQueryResultValue';
import type {QueryResultDataType} from '../../src/types/queryResults';

const stringType: QueryResultDataType = ['DataType', 'String'];
const listType: QueryResultDataType = ['ListType', stringType];

function format(...args: Parameters<typeof formatQueryResultValue>) {
    const result = formatQueryResultValue(...args);
    expect(result.error).toBe(false);
    if (result.error) {
        throw new Error('Unexpected formatting error');
    }
    return result;
}

describe('query result formatting', () => {
    it.each<[unknown, QueryResultDataType]>([
        ['hello', stringType],
        [null, ['NullType']],
        [['hello'], ['OptionalType', stringType]],
        [[], ['OptionalType', stringType]],
        [['one', 'two'], listType],
        [[['one', 'two']], ['DictType', stringType, stringType]],
        [
            ['one', 'two'],
            ['TupleType', [stringType, stringType]],
        ],
    ])('formats YQL value %j', (value, type) => {
        const result = format(value, type);
        expect(result.html).not.toBe('');
        expect(result.text).not.toBe('');
        expect(result.isIncomplete).toBe(false);
    });

    it('supports binary wire values', () => {
        const result = format({val: 'AAE=', b64: true}, stringType, {treatValAsData: true});
        expect(result.html).toContain('binary');
        expect(result.text).toContain('00');
    });

    it('detects nested server incompleteness and local string/list truncation', () => {
        expect(
            format([{val: 'part', inc: true}], listType, {treatValAsData: true}).isIncomplete,
        ).toBe(true);
        expect(format(['abcdef'], listType, {maxStringSize: 3}).isIncomplete).toBe(true);
        expect(format(['one', 'two'], listType, {maxListSize: 1}).isIncomplete).toBe(true);
    });

    it.each([1, 50])('keeps structs complete after omitting null fields at limit %i', (limit) => {
        const fields: QueryResultDataType = [
            'StructType',
            [
                ...Array.from({length: limit}, (_, index): [string, QueryResultDataType] => [
                    `empty${index}`,
                    ['OptionalType', stringType],
                ]),
                ['value', stringType],
            ],
        ];
        const value = [...Array.from({length: limit}, () => []), 'present'];
        const result = format(value, fields, {maxListSize: limit});
        expect(result.isIncomplete).toBe(false);
        expect(result.text).toContain('present');
        expect(
            format(value, fields, {maxListSize: limit, omitStructNull: false}).isIncomplete,
        ).toBe(true);
        expect(format(value, fields, {maxListSize: limit, maxStringSize: 2}).isIncomplete).toBe(
            true,
        );
    });

    it('does not treat a variant wrapper as a truncated list', () => {
        const type: QueryResultDataType = ['VariantType', ['TupleType', [stringType, listType]]];
        expect(format(['0', 'complete'], type, {maxListSize: 1}).isIncomplete).toBe(false);
        expect(format(['1', ['one', 'two']], type, {maxListSize: 1}).isIncomplete).toBe(true);
    });

    it.each([undefined, 1])('retains server incompleteness on structs at limit %s', (limit) => {
        const type: QueryResultDataType = ['StructType', [['value', stringType]]];
        expect(
            format({val: ['part'], inc: true}, type, {
                treatValAsData: true,
                maxListSize: limit,
            }).isIncomplete,
        ).toBe(true);
    });

    it('detects truncation and server incompleteness when tagged structs discard markers', () => {
        const type: QueryResultDataType = [
            'TaggedType',
            'url',
            [
                'StructType',
                [
                    ['href', stringType],
                    ['text', stringType],
                ],
            ],
        ];
        expect(format(['https://example.com', 'Link'], type, {maxListSize: 1}).isIncomplete).toBe(
            true,
        );
        expect(format(['https://example.com', 'Link'], type, {maxStringSize: 3}).isIncomplete).toBe(
            true,
        );
        expect(
            format([{val: 'https://example.com', inc: true}, 'Link'], type, {
                treatValAsData: true,
                maxListSize: 2,
            }).isIncomplete,
        ).toBe(true);
    });

    it('extracts optional tags and skips HTML for incomplete tagged data', () => {
        const result = format(
            [{val: 'part', inc: true}],
            ['OptionalType', ['TaggedType', 'image/png', stringType]],
            {treatValAsData: true},
        );
        expect(result).toMatchObject({isIncomplete: true, tag: 'image/png', html: ''});
    });

    it('does not promote nested tags to the whole cell', () => {
        expect(
            format(['url'], ['ListType', ['TaggedType', 'url', stringType]]).tag,
        ).toBeUndefined();
    });

    it('lets explicit metadata override automatic metadata and preserves full copy', () => {
        const result = format(
            'abcdef',
            stringType,
            {maxStringSize: 3},
            {isIncomplete: false, tag: 'custom'},
        );
        expect(result).toMatchObject({isIncomplete: false, tag: 'custom', text: '"abcdef"'});
        expect(result.html).toContain('>abc<');
        const list = format(['one', 'two'], listType, {maxListSize: 1}, {isIncomplete: false});
        expect(list.text).toContain('two');
        expect(list.html).not.toContain('two');
    });

    it('lets cell settings remove inherited converter limits with undefined', () => {
        const result = format(
            ['abcdef', 'second'],
            listType,
            {maxStringSize: 2, maxListSize: 1},
            {
                formatterSettings: {maxStringSize: undefined, maxListSize: undefined},
            },
        );
        expect(result.isIncomplete).toBe(false);
        expect(result.text).toContain('abcdef');
        expect(result.text).toContain('second');
    });

    it.each(['literal', ''])('copies explicit text %j literally', (copyText) => {
        expect(format('value', stringType, undefined, {copyText}).text).toBe(copyText);
    });

    it('keeps URL rendering and supports raw link-copy overrides', () => {
        const type: QueryResultDataType = [
            'TaggedType',
            'url',
            [
                'StructType',
                [
                    ['href', stringType],
                    ['text', stringType],
                ],
            ],
        ];
        const result = format(['https://example.com', 'Link'], type, undefined, {copyText: 'Link'});
        expect(result.html).toContain('<a ');
        expect(result.html).toContain('https://example.com');
        expect(result.text).toBe('Link');
        expect(
            format(['https://example.com', 'Link'], type, undefined, {
                copyText: 'https://example.com',
            }).text,
        ).toBe('https://example.com');
    });

    it('uses formatted text length including quotes, preserving complete copy', () => {
        expect(format('x'.repeat(9997), stringType, undefined, undefined, 10000).isTooLarge).toBe(
            false,
        );
        const result = format('x'.repeat(9998), stringType, undefined, undefined, 10000);
        expect(result).toMatchObject({isTooLarge: true, html: '', isIncomplete: false});
        expect(result.text).toHaveLength(10000);
        expect(format('x'.repeat(9999), stringType, undefined, undefined, 10000).isTooLarge).toBe(
            true,
        );
        expect(
            format('short', stringType, undefined, {copyText: 'x'.repeat(10000)}, 10000).isTooLarge,
        ).toBe(false);
        expect(format('x'.repeat(10000), stringType).isTooLarge).toBe(false);
    });

    it.each(['url', 'image/png', 'audio/wav', 'video/mp4'])(
        'exempts %s from HTML limits',
        (tag) => {
            const result = format(
                'https://example.com',
                ['TaggedType', tag, stringType],
                undefined,
                undefined,
                1,
            );
            expect(result.isTooLarge).toBe(false);
            expect(result.html).not.toBe('');
        },
    );

    it('isolates invalid YQL conversion errors', () => {
        expect(formatQueryResultValue({}, ['UnknownType'])).toEqual({
            error: true,
            html: '',
            text: '',
        });
    });
});
