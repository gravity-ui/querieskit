import {registerFallbackLanguage} from '../languages';

import {createAnalysis, quoteIdentifier} from './shared';
import type {QueryDialect} from './types';
import {functions, keywords, types} from './vocabulary';

const operators = [
    '+',
    '-',
    '*',
    '/',
    '%',
    '=',
    '<=>',
    '<>',
    '<',
    '>',
    '<=',
    '>=',
    'AND',
    'OR',
    'NOT',
    'LIKE',
    'RLIKE',
];

export const spyt: QueryDialect = {
    id: 'spyt',
    namespace: 'database',
    register: (monaco) => registerFallbackLanguage(monaco, 'spyt', {keywords, types}),
    quoteIdentifier,
    analyze: createAnalysis({keywords, functions, operators, types}),
};
