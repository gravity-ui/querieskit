import type {QueryParameter} from '../../../types/queryParameters';
import type {QuerySettingsValue} from '../../../types/querySettings';
import type {YtsaurusEngineSettings} from '../../../types/ytsaurusQueryEngines';
import type {AttachItem} from '../../../types/attachments';

export const QUERY = 'DECLARE $limit AS Int64;\nSELECT * FROM `//demo/events` LIMIT $limit;\n';
export const CLUSTERS = [
    {id: 'production', title: 'Production'},
    {id: 'development', title: 'Development'},
];
export const TAB_ENGINES = [
    {id: 'yql', title: 'YQL', language: 'yql'},
    {id: 'clickhouse', title: 'ClickHouse', language: 'clickhouse'},
];
export const SETTINGS: QuerySettingsValue<YtsaurusEngineSettings> = {
    queryName: 'Daily report',
    access: 'private',
    ytOperationTitle: 'Daily report',
    tokenIds: ['analytics'],
    attributes: [{id: 'owner', key: 'team', value: 'analytics'}],
    custom: {yqlVersion: 'stable', spytConfig: '{"executor_cores": 2}'},
};
export const PARAMETERS: QueryParameter[] = [
    {id: 'limit', name: 'limit', type: {kind: 'Int64'}, value: '100'},
    {id: 'region', name: 'region', type: {kind: 'String'}, value: 'Europe'},
    {id: 'active', name: 'active', type: {kind: 'Bool'}, value: true},
];
export const ATTACHMENTS: AttachItem[] = [
    {id: 'query', name: 'daily-report.sql'},
    {id: 'schema', name: 'schema.json'},
    {
        id: 'docs',
        name: 'Query documentation',
        link: 'https://example.com/docs/query',
        token: 'analytics',
    },
];
export const DELETED_ATTACHMENTS: AttachItem[] = [{id: 'archive', name: 'archive.csv'}];
