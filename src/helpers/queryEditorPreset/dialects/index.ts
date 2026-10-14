import type {QueryEditorLanguage} from '../../../types/queryEditorPreset';

import {clickhouse} from './clickhouse';
import {spyt} from './spyt';
import type {QueryDialect} from './types';
import {yql} from './yql';
import {ytql} from './ytql';

const dialects: Record<QueryEditorLanguage, QueryDialect> = {yql, clickhouse, ytql, spyt};

export function getDialect(language: string): QueryDialect | undefined {
    return Object.prototype.hasOwnProperty.call(dialects, language)
        ? dialects[language as QueryEditorLanguage]
        : undefined;
}
