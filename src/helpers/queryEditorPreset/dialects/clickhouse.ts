import {createAnalysis, preserveRegisteredLanguage, quoteIdentifier} from './shared';
import type {QueryDialect} from './types';
import {functions, keywords} from './vocabulary';

export const clickhouse: QueryDialect = {
    id: 'clickhouse',
    namespace: 'database',
    register: preserveRegisteredLanguage,
    quoteIdentifier,
    analyze: createAnalysis({keywords, functions}, async (query, position) =>
        (await import('@gravity-ui/websql-autocomplete/clickhouse')).parseClickHouseQuery(query, {
            line: position.lineNumber,
            column: position.column,
        }),
    ),
};
