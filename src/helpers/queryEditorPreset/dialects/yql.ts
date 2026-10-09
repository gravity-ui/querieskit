import {createAnalysis, preserveRegisteredLanguage, quoteIdentifier} from './shared';
import type {QueryDialect} from './types';
import {functions, keywords} from './vocabulary';

export const yql: QueryDialect = {
    id: 'yql',
    namespace: 'cluster',
    register: preserveRegisteredLanguage,
    quoteIdentifier,
    analyze: createAnalysis({keywords, functions}, async (query, position) =>
        (await import('@gravity-ui/websql-autocomplete/yql')).parseYqlQuery(query, {
            line: position.lineNumber,
            column: position.column,
        }),
    ),
};
