import type {NavigationSchemaColumn} from '../../../types/navigation';

export const SCHEMA_COLUMNS: NavigationSchemaColumn[] = [
    {name: 'id', type: 'int64', sortOrder: 'ascending', required: true},
    {name: 'created_at', type: 'string', sortOrder: 'descending', required: true},
    {name: 'title', type: 'string', required: true},
    {name: 'status', type: 'string'},
    {name: 'payload', type: 'any'},
];
