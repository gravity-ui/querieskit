// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {FieldsSelector} from '../../src/components/FieldsSelector';
import type {FieldsSelectorProps} from '../../src/types/fieldsSelectorProps';
import {setLang} from '../../src/i18n';

vi.mock('@gravity-ui/uikit', () => ({
    Button: React.forwardRef(function MockButton(
        {children, view: _view, size: _size, ...props}: any,
        ref: any,
    ) {
        return (
            <button ref={ref} {...props}>
                {children}
            </button>
        );
    }),
    Icon: () => null,
    Flex: ({
        children,
        direction: _direction,
        alignItems: _alignItems,
        gap: _gap,
        ...props
    }: any) => <div {...props}>{children}</div>,
    Text: ({children}: any) => <span>{children}</span>,
    TextInput: ({value, onUpdate, controlProps}: any) => (
        <input {...controlProps} value={value} onChange={(event) => onUpdate(event.target.value)} />
    ),
    Popup: ({children, open, onOpenChange}: any) =>
        open ? (
            <div
                onKeyDown={(event) => {
                    if (event.key === 'Escape') onOpenChange(false);
                }}
            >
                {children}
                <button onClick={() => onOpenChange(false)}>Outside dismissal</button>
            </div>
        ) : null,
}));

let root: Root;
let container: HTMLDivElement;
const fields = [
    {id: 'a', title: 'Alpha'},
    {id: 'b', title: 'Beta'},
    {id: 'c', title: 'Gamma'},
];
let onChange: ReturnType<typeof vi.fn>;
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    setLang('en');
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    onChange = vi.fn();
});
afterEach(() => {
    act(() => root.unmount());
    container.remove();
});
function render(props: Partial<FieldsSelectorProps> = {}) {
    act(() =>
        root.render(
            <FieldsSelector fields={fields} value={['a']} onChange={onChange} {...props} />,
        ),
    );
}
function button(name: string) {
    const match = [...container.querySelectorAll('button')].find(
        (node) => node.textContent === name || node.getAttribute('aria-label') === name,
    );
    if (!match) throw new Error(`Missing button ${name}`);
    return match;
}
function click(element: HTMLElement) {
    act(() => element.click());
}
function toggle(name: string) {
    click(container.querySelector<HTMLElement>(`[role=checkbox][aria-label="${name}"]`)!);
}
function open() {
    click(button('Configure visible fields'));
}
function search(value: string) {
    act(() => {
        const input = container.querySelector('input')!;
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
            input,
            value,
        );
        input.dispatchEvent(new Event('input', {bubbles: true}));
    });
}

describe('FieldsSelector', () => {
    it('preserves immediate defaults and selected order', () => {
        render({value: ['c', 'a']});
        open();
        toggle('Beta');
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['c', 'a', 'b']);
    });
    it('emits one ordered change only on Apply', () => {
        render({applyMode: 'explicit'});
        open();
        toggle('Gamma');
        toggle('Beta');
        expect(onChange).not.toHaveBeenCalled();
        click(button('Apply'));
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['a', 'c', 'b']);
        expect(container.querySelector('[role=checkbox]')).toBeNull();
    });
    it.each(['Cancel', 'Outside dismissal', 'Escape'])('discards the draft on %s', (action) => {
        render({applyMode: 'explicit'});
        open();
        toggle('Beta');
        if (action === 'Escape') {
            act(() =>
                container
                    .querySelector('[role=checkbox]')!
                    .dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})),
            );
        } else click(button(action));
        expect(onChange).not.toHaveBeenCalled();
        open();
        expect(container.querySelector('[aria-label="Beta"]')!.getAttribute('aria-checked')).toBe(
            'false',
        );
    });
    it('preserves draft for equal controlled arrays and replaces it for external changes', () => {
        render({applyMode: 'explicit'});
        open();
        toggle('Beta');
        render({applyMode: 'explicit', value: ['a']});
        expect(container.querySelector('[aria-label="Beta"]')!.getAttribute('aria-checked')).toBe(
            'true',
        );
        render({applyMode: 'explicit', value: ['c']});
        click(button('Apply'));
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['c']);
    });
    it('filters by text without removing hidden selection, and excludes unavailable IDs', () => {
        render({applyMode: 'explicit', searchable: true});
        open();
        toggle('Beta');
        search('gamma');
        expect(container.querySelectorAll('[role=checkbox]')).toHaveLength(1);
        render({applyMode: 'explicit', searchable: true, fields: fields.slice(1)});
        click(button('Apply'));
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['b']);
    });
    it('searches ReactNode titles by searchText or ID and handles hundreds of options', () => {
        render({
            searchable: true,
            fields: [
                ...Array.from({length: 500}, (_, index) => ({
                    id: `id-${index}`,
                    title: <b>Column {index}</b>,
                })),
                {id: 'special', title: <b>Custom</b>, searchText: 'Find me'},
            ],
        });
        open();
        search('find ME');
        expect(container.querySelectorAll('[role=checkbox]')).toHaveLength(1);
        search('id-499');
        expect(container.querySelectorAll('[role=checkbox]')).toHaveLength(1);
    });
    it('handles keyboard toggles and custom button content with count', () => {
        render({applyMode: 'explicit', buttonContent: 'Columns', showSelectedCount: true});
        open();
        expect(button('Configure visible fields').textContent).toBe('Columns (1)');
        act(() =>
            container
                .querySelector('[aria-label="Beta"]')!
                .dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true})),
        );
        click(button('Apply'));
        expect(onChange).toHaveBeenCalledExactlyOnceWith(['a', 'b']);
    });
});
