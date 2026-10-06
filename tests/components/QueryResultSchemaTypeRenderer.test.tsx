// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryResultSchemaType} from '../../src/modules/QueryResults/internal/QueryResultSchemaType';
import type {SchemaTypeNode} from '../../src/modules/QueryResults/helpers/queryResultSchemaType';

// JSDOM has no layout; keep real Tooltip focus/hover behavior while avoiding
// Floating UI's repeated placement attempts against zero-sized rectangles.
vi.mock('@floating-ui/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@floating-ui/react')>();
    return {
        ...actual,
        useFloating: (options: Parameters<typeof actual.useFloating>[0]) =>
            actual.useFloating({...options, middleware: []}),
    };
});

describe('schema type renderer', () => {
    let container: HTMLDivElement;
    let root: Root;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });
    function render(type: SchemaTypeNode) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <QueryResultSchemaType type={type} />
                </ThemeProvider>,
            ),
        );
    }
    function toggle(name: string) {
        const button = Array.from(container.querySelectorAll('button')).find(
            (element) => element.getAttribute('aria-label') === name,
        );
        expect(button).toBeDefined();
        if (!button) throw new Error(`Missing button: ${name}`);
        act(() => button.click());
    }
    const nested: SchemaTypeNode = {
        name: 'Struct',
        children: ['left', 'right'].map((label) => ({
            label,
            type: {
                name: 'List',
                children: [{type: {name: 'Box', children: [{type: {name: `${label}-leaf`}}]}}],
            },
        })),
    };

    it('initially expands only levels zero and one and preserves independent descendant state', () => {
        render(nested);
        expect(container.textContent).toContain('Box');
        expect(container.textContent).not.toContain('left-leaf');
        const boxes = container.querySelectorAll('button[aria-label="Expand type: Box"]');
        expect(boxes).toHaveLength(2);
        act(() => (boxes[0] as HTMLButtonElement).click());
        expect(container.textContent).toContain('left-leaf');
        expect(container.textContent).not.toContain('right-leaf');
        toggle('Collapse type: left: List');
        expect(container.textContent).not.toContain('left-leaf');
        toggle('Expand type: left: List');
        expect(container.textContent).toContain('left-leaf');
        render(JSON.parse(JSON.stringify(nested)));
        expect(container.textContent).toContain('left-leaf');
    });

    it('renders custom parameters and modifiers as text on the owning node, even collapsed', () => {
        render({
            name: 'Custom',
            parameters: [4, 'value', false, null],
            optionalDepth: 2,
            tags: ['outer-tag'],
            children: [{label: '<field>', type: {name: 'String', tags: ['inner-tag']}}],
        });
        expect(container.textContent).toContain('Custom(4, value, false, null)');
        expect(container.textContent).toContain('optional × 2');
        expect(container.textContent).toContain('<field>: String[inner-tag]');
        toggle('Collapse type: Custom');
        expect(container.textContent).toContain('outer-tag');
        expect(container.textContent).not.toContain('inner-tag');
        expect(container.querySelector('button')?.getAttribute('aria-expanded')).toBe('false');
    });

    it('exposes malformed source text through a keyboard-focusable tooltip anchor', async () => {
        render({name: 'Unknown', sourceDescription: '["ListType", null]'});
        const button = container.querySelector('button');
        if (!button) throw new Error('Missing source button');
        expect(button.getAttribute('aria-label')).toBe('Show original type value');
        expect(button.tabIndex).toBe(0);
        await act(async () => {
            button.focus();
        });
        expect(document.activeElement).toBe(button);
        expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain(
            '["ListType", null]',
        );
    });
});
