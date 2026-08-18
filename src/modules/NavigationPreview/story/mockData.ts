import type {NavigationPreviewRow} from '../../../types/navigation';

export const PREVIEW_COLUMNS = ['id', 'created_at', 'title', 'status'];

export const PREVIEW_ROWS: NavigationPreviewRow[] = [
    {id: '1', created_at: '2024-01-01T10:00:00Z', title: 'First row', status: 'active'},
    {id: '2', created_at: '2024-01-02T11:30:00Z', title: 'Second row', status: 'active'},
    {id: '3', created_at: '2024-01-03T09:15:00Z', title: 'Third row', status: 'archived'},
];
