import unipika from '@gravity-ui/unipika';
import type {
    QueryResultCellOptions,
    QueryResultDataType,
    QueryResultFormatterSettings,
} from '../../../types/queryResults';

const formatter = unipika();

const DEFAULT_FORMATTER_SETTINGS: QueryResultFormatterSettings = {
    escapeWhitespace: false,
    decodeUTF8: false,
    binaryAsHex: true,
    escapeYQLStrings: true,
    omitStructNull: true,
};

export type FormattedQueryResultValue =
    | {
          html: string;
          text: string;
          error: false;
          isIncomplete: boolean;
          tag?: string;
          isTooLarge: boolean;
      }
    | {html: ''; text: ''; error: true};

function hasIncompleteNode(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
        return false;
    }
    if ('$incomplete' in value && value.$incomplete === true) {
        return true;
    }
    return Object.values(value).some(hasIncompleteNode);
}

function exceedsInlineLimit(text: string, tag: string | undefined, limit: number | undefined) {
    const isExempt = tag === 'url' || /^(audio|video|image)\//.test(tag ?? '');
    return !isExempt && limit !== undefined && text.length >= limit;
}

function hasConverterLimits(settings: QueryResultFormatterSettings) {
    return (settings.maxListSize ?? 0) > 0 || (settings.maxStringSize ?? 0) > 0;
}

function resolveCompleteness(
    input: [unknown, unknown],
    node: ReturnType<typeof formatter.converters.yql>,
    flags: {incomplete?: boolean},
    hasLimits: boolean,
    copySettings: QueryResultFormatterSettings,
) {
    const incompleteNode = hasIncompleteNode(node);
    if (incompleteNode || !hasLimits) {
        return {
            isIncomplete: incompleteNode || Boolean(flags.incomplete),
            fullNode: undefined,
        };
    }

    const fullFlags: {incomplete?: boolean} = {};
    const fullNode = formatter.converters.yql(input, {...copySettings}, fullFlags);
    // Limited converter flags also count omitted null fields and variant wrappers.
    // Compare converted values for actual truncation, including tags that discard markers.
    // With limits removed, converter flags report only server incompleteness.
    return {
        isIncomplete:
            Boolean(fullFlags.incomplete) || JSON.stringify(node) !== JSON.stringify(fullNode),
        fullNode,
    };
}

export function formatQueryResultValue(
    value: unknown,
    type: QueryResultDataType,
    settings?: QueryResultFormatterSettings,
    options?: QueryResultCellOptions,
    maxInlineTextLength?: number,
): FormattedQueryResultValue {
    const formatterSettings = {
        ...DEFAULT_FORMATTER_SETTINGS,
        ...settings,
        ...options?.formatterSettings,
    };
    const input: [unknown, unknown] = [value, type];

    try {
        const flags: {incomplete?: boolean} = {};
        const node = formatter.converters.yql(input, {...formatterSettings}, flags);
        const hasLimits = hasConverterLimits(formatterSettings);
        const copySettings = {
            ...formatterSettings,
            maxListSize: undefined,
            maxStringSize: undefined,
        };
        const {isIncomplete, fullNode} =
            options?.isIncomplete === undefined
                ? resolveCompleteness(input, node, flags, hasLimits, copySettings)
                : {isIncomplete: options.isIncomplete, fullNode: undefined};
        const tag = options?.tag ?? node.$tag;
        const formattedText = formatter.format(node, {...formatterSettings, asHTML: false});
        const isTooLarge = exceedsInlineLimit(formattedText, tag, maxInlineTextLength);
        let text = options?.copyText ?? formattedText;

        if (options?.copyText === undefined && !isIncomplete && hasLimits) {
            // An explicit completeness override must still copy all available input.
            const copyNode = fullNode ?? formatter.converters.yql(input, {...copySettings});
            text = formatter.format(copyNode, {...copySettings, asHTML: false});
        }

        return {
            html:
                isTooLarge || (isIncomplete && tag !== undefined)
                    ? ''
                    : formatter.format(node, {...formatterSettings, asHTML: true}),
            text,
            error: false,
            isIncomplete,
            tag,
            isTooLarge,
        };
    } catch {
        return {html: '', text: '', error: true};
    }
}
