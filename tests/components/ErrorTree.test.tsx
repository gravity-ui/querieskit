// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ErrorTree} from '../../src/components/ErrorTree';
import type {ErrorTreeItem, ErrorTreeProps} from '../../src/types/errorTree';
import {setLang} from '../../src/i18n';

const branch = (id: string): ErrorTreeItem => ({
    id,
    severity: 'info',
    message: `Message ${id}`,
    position: {row: id === 'a' ? 1 : 2, column: 3},
    attributes: {source: id},
    children: [{id: 'child', severity: 'warning', message: `Child ${id}`}],
});

describe('ErrorTree', () => {
    let container: HTMLDivElement;
    let root: Root;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        configure({lang: 'en'});
        setLang('en');
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });
    function render(props: ErrorTreeProps) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <ErrorTree {...props} />
                </ThemeProvider>,
            ),
        );
    }
    function node(message: string) {
        const label = [...container.querySelectorAll('[title]')].find(
            (element) => element.getAttribute('title') === message,
        );
        const result = label?.closest('.qp-error-tree__node');
        if (!result) throw new Error(`Missing node: ${message}`);
        return result;
    }
    function toggle(message: string) {
        return button(message, 'button[aria-expanded]');
    }
    function button(message: string, selector: string) {
        const result = node(message).querySelector<HTMLButtonElement>(selector);
        if (!result) throw new Error(`Missing button: ${message} ${selector}`);
        return result;
    }
    function click(button: HTMLButtonElement) {
        act(() => button.click());
    }
    it('renders empty, single and multiple sources without a synthetic root', () => {
        render({roots: []});
        expect(container.textContent).toBe('');
        render({roots: [branch('a')]});
        expect(container.querySelectorAll('.qp-error-tree > .qp-error-tree__node')).toHaveLength(1);
        render({roots: [branch('a'), branch('b')]});
        expect(container.querySelectorAll('.qp-error-tree > .qp-error-tree__node')).toHaveLength(2);
        expect(
            [...container.querySelectorAll('.qp-error-tree > .qp-error-tree__node')].map(
                (element) => element.querySelector('[title]')?.getAttribute('title'),
            ),
        ).toEqual(['Message a', 'Message b']);
    });
    it('keeps expansion independent and attached to root IDs during reorder, insertion and removal', () => {
        render({roots: [branch('a'), branch('b')]});
        expect(toggle('Message a').getAttribute('aria-expanded')).toBe('true');
        click(toggle('Message a'));
        expect(toggle('Message a').getAttribute('aria-expanded')).toBe('false');
        expect(toggle('Message b').getAttribute('aria-expanded')).toBe('true');
        render({roots: [branch('b'), branch('c'), branch('a')]});
        expect(toggle('Message a').getAttribute('aria-expanded')).toBe('false');
        expect(toggle('Message b').getAttribute('aria-expanded')).toBe('true');
        expect(toggle('Message c').getAttribute('aria-expanded')).toBe('true');
        render({roots: [branch('a')]});
        expect(toggle('Message a').getAttribute('aria-expanded')).toBe('false');
        expect(container.textContent).not.toContain('Message b');
    });
    it('applies expansion defaults to every tree, including informational descendants', () => {
        const roots = ['a', 'b'].map((id) => ({
            ...branch(id),
            children: [{...branch(`nested-${id}`), message: `Nested ${id}`}],
        }));
        render({roots, defaultExpanded: true, defaultInfoExpanded: false});
        for (const id of ['a', 'b']) {
            expect(toggle(`Message ${id}`).getAttribute('aria-expanded')).toBe('true');
            expect(toggle(`Nested ${id}`).getAttribute('aria-expanded')).toBe('false');
        }
        render({roots: ['c', 'd'].map(branch), defaultExpanded: false});
        expect(toggle('Message c').getAttribute('aria-expanded')).toBe('false');
        expect(toggle('Message d').getAttribute('aria-expanded')).toBe('false');
    });
    it('renders attributes and dispatches positions for the matching tree independently', () => {
        const roots = [branch('a'), branch('b')];
        const onPositionClick = vi.fn();
        const renderAttributes = vi.fn((attributes, item) => (
            <span>{`${item.id}: ${attributes.source}`}</span>
        ));
        render({roots, onPositionClick, renderAttributes});
        click(button('Message a', '.qp-error-tree__attributes-button'));
        expect(node('Message a').textContent).toContain('a: a');
        expect(node('Message b').textContent).not.toContain('b: b');
        expect(renderAttributes).toHaveBeenCalledWith(roots[0].attributes, roots[0]);
        expect(renderAttributes).toHaveBeenCalledWith(roots[1].attributes, roots[1]);
        for (const item of roots) {
            click(button(item.message, '.qp-error-tree__message-button'));
            expect(onPositionClick).toHaveBeenLastCalledWith(item, item.position);
        }
        render({roots: [roots[1], roots[0]], onPositionClick, renderAttributes});
        expect(node('Message a').textContent).toContain('a: a');
        expect(node('Message b').textContent).not.toContain('b: b');
    });
});
