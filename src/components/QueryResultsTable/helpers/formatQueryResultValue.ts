import unipika from '@gravity-ui/unipika';
import type {QueryResultDataType, QueryResultFormatterSettings} from '../../../types/queryResults';

const formatter = unipika();

const DEFAULT_FORMATTER_SETTINGS: QueryResultFormatterSettings = {
    escapeWhitespace: false,
    decodeUTF8: false,
    binaryAsHex: true,
    escapeYQLStrings: true,
    omitStructNull: true,
};

export type FormattedQueryResultValue =
    {html: string; text: string; error: false} | {html: ''; text: ''; error: true};

export function formatQueryResultValue(
    value: unknown,
    type: QueryResultDataType,
    settings?: QueryResultFormatterSettings,
): FormattedQueryResultValue {
    const formatterSettings = {...DEFAULT_FORMATTER_SETTINGS, ...settings};
    const input: [unknown, unknown] = [value, type];

    try {
        return {
            html: formatter.formatFromYQL(input, {...formatterSettings, asHTML: true}),
            text: formatter.formatFromYQL(input, {
                ...formatterSettings,
                asHTML: false,
                maxStringSize: undefined,
            }),
            error: false,
        };
    } catch {
        return {html: '', text: '', error: true};
    }
}
