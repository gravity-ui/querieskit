// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {HistoryFilter, createHistoryFilter} from '../../src/components/HistoryFilter';
import type {CustomHistoryFilterOptions} from '../../src/types/historyFilter';

vi.mock('@gravity-ui/uikit', () => ({
    Button: ({
        children,
        onClick,
        view,
        selected,
    }: React.PropsWithChildren<{
        onClick?: () => void;
        view?: string;
        selected?: boolean;
    }>) => (
        <button onClick={onClick} data-view={view} data-selected={selected}>
            {children}
        </button>
    ),
    Flex: ({children}: React.PropsWithChildren) => <div>{children}</div>,
    Icon: () => null,
    Popup: ({children, open}: React.PropsWithChildren<{open: boolean}>) =>
        open ? <div data-popup>{children}</div> : null,
}));
vi.mock('../../src/components/SimpleForm', () => ({
    SimpleForm: ({values}: {values: Record<string, unknown>}) => (
        <output data-simple-form>{JSON.stringify(values)}</output>
    ),
}));

type Values = {owner: string; status: string[]};
const initialValues: Values = {owner: '', status: []};

describe('HistoryFilter custom fields', () => {
    let root: Root;
    let container: HTMLDivElement;
    const onApply = vi.fn<(value: Values) => void>();
    const onReset = vi.fn<() => void>();
    const renderFields: CustomHistoryFilterOptions<Values>['renderFields'] = ({
        value,
        onChange,
    }) => (
        <>
            <output>{JSON.stringify(value)}</output>
            <button onClick={() => onChange({...value, owner: 'alice'})}>Set owner</button>
            <button onClick={() => onChange({...value, status: ['running']})}>Set status</button>
        </>
    );
    function render(options: Partial<CustomHistoryFilterOptions<Values>> = {}, flat = false) {
        // Deliberately recreate the adapter and renderer on every parent update.
        const config = createHistoryFilter<Values>({
            initialValues,
            renderFields: (context) => renderFields(context),
            onApply,
            onReset,
            ...options,
        });
        act(() => root.render(<HistoryFilter {...config} buttonView={flat ? 'flat' : 'normal'} />));
    }
    function click(label: string) {
        const button = [...container.querySelectorAll('button')].find(
            (node) => node.textContent === label,
        );
        if (!button) throw new Error(`Missing button: ${label}`);
        act(() => button.click());
    }
    function displayed() {
        return JSON.parse(container.querySelector('output')?.textContent ?? 'null') as Values;
    }

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        onApply.mockClear();
        onReset.mockClear();
        container = document.createElement('div');
        root = createRoot(container);
    });
    afterEach(() => act(() => root.unmount()));

    it('accumulates field edits and supplies exactly one Apply and Reset action', () => {
        render();
        click('');
        expect(container.querySelector('[data-simple-form]')).toBeNull();
        click('Set owner');
        click('Set status');
        expect(onApply).not.toHaveBeenCalled();
        const buttons = [...container.querySelectorAll('button')];
        expect(buttons.filter((node) => node.textContent === 'Apply')).toHaveLength(1);
        expect(buttons.filter((node) => node.textContent === 'Reset')).toHaveLength(1);
        click('Apply');
        expect(onApply).toHaveBeenCalledExactlyOnceWith({owner: 'alice', status: ['running']});
        expect(container.querySelector('[data-popup]')).not.toBeNull();
        click('Reset');
        expect(displayed()).toEqual(initialValues);
        expect(onReset).toHaveBeenCalledOnce();
        expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('retains the draft across closing and parent adapter recreation with equivalent values', () => {
        render({values: {owner: '', status: []}});
        click('');
        click('Set owner');
        click('');
        expect(container.querySelector('[data-popup]')).toBeNull();
        render({values: {status: [], owner: ''}});
        click('');
        expect(displayed()).toEqual({owner: 'alice', status: []});
        click('Apply');
        expect(onApply).toHaveBeenCalledExactlyOnceWith({owner: 'alice', status: []});
    });

    it('accepts external values while open and while closed, and resets to current defaults', () => {
        render();
        click('');
        click('Set owner');
        render({values: {owner: 'external', status: ['completed']}});
        expect(displayed()).toEqual({owner: 'external', status: ['completed']});
        click('');
        render({
            values: {owner: 'saved', status: ['failed']},
            initialValues: {owner: 'default', status: []},
        });
        click('');
        expect(displayed()).toEqual({owner: 'saved', status: ['failed']});
        click('Reset');
        expect(displayed()).toEqual({owner: 'default', status: []});
        expect(onApply).not.toHaveBeenCalled();
    });

    it('preserves the standard active-filter indication and the requested button view', () => {
        render({isChanged: true}, true);
        expect(container.querySelector('button')?.dataset).toMatchObject({
            view: 'flat-info',
            selected: 'true',
        });
        render({isChanged: true});
        expect(container.querySelector('button')?.dataset.view).toBe('action');
    });

    it('initializes the appropriate draft when switching between legacy and custom modes without values', () => {
        const onLegacyApply = vi.fn();
        const renderLegacy = () =>
            act(() =>
                root.render(
                    <HistoryFilter
                        fields={[{id: 'mine', type: 'switch', initialValue: true}]}
                        onApply={onLegacyApply}
                    />,
                ),
            );
        renderLegacy();
        click('');
        expect(container.querySelector('[data-simple-form]')?.textContent).toBe('{"mine":true}');
        render();
        click('');
        expect(displayed()).toEqual(initialValues);
        click('Set owner');
        renderLegacy();
        click('');
        expect(container.querySelector('[data-simple-form]')?.textContent).toBe('{"mine":true}');
        click('Apply');
        expect(onLegacyApply).toHaveBeenCalledExactlyOnceWith({mine: true});
    });
});
