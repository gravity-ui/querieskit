import type {NavigationSchemaColumn} from '../../../types/navigation';

export const SCHEMA_COLUMNS: NavigationSchemaColumn[] = [
    {
        name: 'id',
        description: 'Unique record identifier',
        datacatalogDescription: 'Primary key',
        type: 'int64',
        sortOrder: 'ascending',
        required: true,
    },
    {
        name: 'created_at',
        description: 'Date and time when the record was created',
        datacatalogDescription: 'Creation timestamp',
        type: 'string',
        sortOrder: 'descending',
        required: true,
    },
    {name: 'title', type: 'string', required: true},
    {name: 'status', type: 'string'},
    {name: 'payload', type: 'any'},
];
