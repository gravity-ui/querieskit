// @vitest-environment jsdom

import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {NavigationSchema} from '../../src/modules/NavigationSchema';
import {filterSchema} from '../../src/modules/NavigationSchema/helpers/filterSchema';
import type {NavigationSchemaColumn} from '../../src/types/navigation';

const columns: NavigationSchemaColumn[] = [
    {
        name: 'id',
        type: 'int64',
        description: 'Unique record identifier',
        datacatalogDescription: 'Primary key',
        required: true,
    },
    {name: 'created_at', type: 'timestamp'},
];

function renderSchema(props: Partial<React.ComponentProps<typeof NavigationSchema>> = {}) {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(
        <NavigationSchema data={{columns, loaded: true}} hideToolbar {...props} />,
    );
    return container;
}

describe('NavigationSchema design columns', () => {
    it('shows descriptions and catalog metadata in three default columns', () => {
        const container = renderSchema();
        expect(container.querySelectorAll('thead th')).toHaveLength(3);
        expect(container.textContent).toContain('Unique record identifier');
        expect(container.textContent).toContain('Primary key');
    });

    it('keeps the existing optional columns available through visibleColumns', () => {
        const container = renderSchema({visibleColumns: ['name', 'sortOrder', 'required']});
        expect(container.querySelectorAll('thead th')).toHaveLength(3);
        expect(container.textContent).not.toContain('Primary key');
        expect(container.querySelector('tbody svg')).not.toBeNull();
    });

    it('preserves custom table columns without applying default visibility', () => {
        const container = renderSchema({
            view: {
                tableColumns: [{name: 'required', header: 'Custom required', render: () => 'yes'}],
            },
        });
        expect(container.querySelectorAll('thead th')).toHaveLength(1);
        expect(container.textContent).toContain('Custom required');
        expect(container.textContent).toContain('yes');
    });

    it('searches descriptions and supports rows without metadata', () => {
        expect(filterSchema(columns, ' IDENTIFIER ')).toEqual([columns[0]]);
        expect(filterSchema(columns, 'PRIMARY')).toEqual([columns[0]]);
        expect(filterSchema(columns, 'timestamp')).toEqual([columns[1]]);
        expect(filterSchema(columns, 'missing')).toEqual([]);
        expect(filterSchema(columns, ' ')).toEqual(columns);
    });
});
