import type {NavigationViewSection} from '../../../types/navigation';

export const VIEW_COLUMNS = ['Name and Title', 'Type', 'Datacatalog description'];

export const makeViewRows = (count: number) =>
    Array.from({length: count}, (_, index) => ({
        'Name and Title': `field_${index + 1}`,
        Type: index % 2 === 0 ? 'string' : 'int64',
        'Datacatalog description': index % 3 === 0 ? 'Primary identifier' : '',
    }));

export const VIEW_SECTIONS: NavigationViewSection[] = [
    {
        id: 'general',
        title: 'General',
        columns: VIEW_COLUMNS,
        rows: makeViewRows(4),
        loaded: true,
        defaultExpanded: true,
    },
    {
        id: 'attributes',
        title: 'Attributes',
        columns: VIEW_COLUMNS,
        rows: makeViewRows(3),
        loaded: true,
    },
    {
        id: 'computed',
        title: 'Computed fields',
        columns: VIEW_COLUMNS,
        rows: [],
        loaded: true,
    },
];
