import {registerFallbackLanguage} from '../languages';

import {createAnalysis, quoteIdentifier} from './shared';
import type {QueryDialect} from './types';
import {keywords} from './vocabulary';

export const ytql: QueryDialect = {
    id: 'ytql',
    namespace: 'cluster',
    register: (monaco) => registerFallbackLanguage(monaco, 'ytql', {keywords, types: []}),
    quoteIdentifier,
    analyze: createAnalysis({keywords}),
};
