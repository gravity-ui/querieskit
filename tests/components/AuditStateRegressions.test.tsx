// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {HistoryFilter} from '../../src/components/HistoryFilter';
import {NavigationDetail} from '../../src/modules/NavigationDetail';
import {Dashboard} from '../../src/components/Dashboard';
import type {QueryListFilterConfig} from '../../src/types/queryList';
import type {NavigationDetailConfig} from '../../src/types/navigation';

const captures = vi.hoisted(() => ({form: {} as any, dash: {} as any}));
vi.mock('@gravity-ui/uikit', () => ({
    Button: ({children, onClick}: any) => <button onClick={onClick}>{children}</button>,
    Flex: ({children}: any) => <div>{children}</div>,
    Icon: () => null,
    Popup: ({children, open}: any) => (open ? <div>{children}</div> : null),
}));
vi.mock('../../src/components/SimpleForm', () => ({
    SimpleForm: (props: any) => {
        captures.form = props;
        return <pre>{JSON.stringify(props.values)}</pre>;
    },
}));
vi.mock('../../src/modules/NavigationHeader', () => ({NavigationHeader: () => null}));
vi.mock('../../src/components/SearchWithButtons', () => ({SearchWithButtons: () => null}));
vi.mock('../../src/modules/NavigationDetail/internal/NavigationDetailTabs', () => ({
    NavigationDetailTabs: ({tabs, onUpdate}: any) =>
        tabs.map((tab: any) => (
            <button key={tab.id} disabled={tab.disabled} onClick={() => onUpdate(tab.id)}>
                {tab.title}
            </button>
        )),
}));
vi.mock('../../src/components/Dashboard/internal/DashPlate', () => ({
    DashPlate: () => null,
    DRAG_HANDLE_CLASSNAME: 'drag',
}));
vi.mock('@gravity-ui/dashkit', () => ({
    DashKit: Object.assign(
        (props: any) => {
            captures.dash = props;
            return null;
        },
        {reloadPlugins: () => {}},
    ),
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));
const render = (element: React.ReactNode) => act(() => root.render(element));
function click(text: string) {
    const button = [...container.querySelectorAll('button')].find(
        (item) => item.textContent === text,
    );
    if (!button) throw new Error(`Missing button ${text}`);
    act(() => button.click());
}

describe('HistoryFilter draft', () => {
    const fields: QueryListFilterConfig['fields'] = [
        {id: 'mine', type: 'switch', initialValue: true},
        {id: 'other', type: 'switch', initialValue: false},
    ];
    it('applies displayed defaults, accumulates edits, and resets without remounting', () => {
        const onApply = vi.fn();
        const onReset = vi.fn();
        render(
            <HistoryFilter
                fields={fields}
                initialValues={{other: true}}
                onApply={onApply}
                onReset={onReset}
            />,
        );
        click('');
        act(() => container.querySelectorAll('button')[1].click());
        expect(onApply).toHaveBeenLastCalledWith({mine: true, other: true});
        act(() => captures.form.onValuesChange({...captures.form.values, mine: false}));
        act(() => captures.form.onValuesChange({...captures.form.values, other: false}));
        act(() => container.querySelectorAll('button')[1].click());
        expect(onApply).toHaveBeenLastCalledWith({mine: false, other: false});
        click(''); // closing and reopening preserves the draft
        click('');
        expect(captures.form.values).toEqual({mine: false, other: false});
        act(() => container.querySelectorAll('button')[2].click());
        expect(captures.form.values).toEqual({mine: true, other: true});
        expect(onReset).toHaveBeenCalledOnce();
    });
    it('preserves edits for equivalent external objects but accepts changed values', () => {
        const show = (values: Record<string, unknown>) =>
            render(<HistoryFilter fields={fields} values={values} />);
        show({mine: false, selected: ['a'], date: new Date(0)});
        click('');
        act(() => captures.form.onValuesChange({...captures.form.values, other: true}));
        show({date: new Date(0), selected: ['a'], mine: false});
        expect(captures.form.values.other).toBe(true);
        show({mine: true});
        expect(captures.form.values).toEqual({mine: true, other: false});
    });
});

describe('NavigationDetail dynamic tabs', () => {
    const tabs = [
        {id: 'a', title: 'A', content: 'Content A'},
        {id: 'b', title: 'B', content: 'Content B'},
    ];
    it('recovers from loading, hidden, disabled, and removed tabs without emitting selection', () => {
        const onTabUpdate = vi.fn();
        const show = (config: NavigationDetailConfig) =>
            render(
                <NavigationDetail
                    config={config}
                    location={{cluster: undefined, path: '/'}}
                    onUpdate={() => {}}
                    onTabUpdate={onTabUpdate}
                />,
            );
        show({tabs: [], emptyContent: 'Empty'});
        expect(container.textContent).toBe('Empty');
        show({tabs, defaultTab: 'b'});
        expect(container.textContent).toContain('Content B');
        show({tabs: [tabs[0], {...tabs[1], hidden: true}], defaultTab: 'b'});
        expect(container.textContent).toContain('Content A');
        show({tabs: [{...tabs[0], disabled: true}, tabs[1]], defaultTab: 'a'});
        expect(container.textContent).toContain('Content B');
        show({tabs: [{...tabs[0], disabled: true}], emptyContent: 'Empty'});
        expect(container.textContent).toBe('Empty');
        expect(onTabUpdate).not.toHaveBeenCalled();
    });
    it('keeps a valid user choice and leaves controlled selection to the caller', () => {
        const show = (activeTab?: string) =>
            render(
                <NavigationDetail
                    config={{tabs, defaultTab: 'b'}}
                    location={{cluster: undefined, path: '/'}}
                    onUpdate={() => {}}
                    activeTab={activeTab}
                />,
            );
        show();
        click('A');
        show();
        expect(container.textContent).toContain('Content A');
        show('missing');
        expect(container.textContent).not.toContain('Content A');
        expect(container.textContent).not.toContain('Content B');
    });
});

it('Dashboard forwards current content/index and ignores removed items', () => {
    const onItemFocus = vi.fn();
    const onItemBlur = vi.fn();
    const first = {id: 'a', content: 'A'};
    const second = {id: 'b', content: 'B'};
    const show = (items: (typeof first)[]) =>
        render(<Dashboard items={items} onItemFocus={onItemFocus} onItemBlur={onItemBlur} />);
    show([first, second]);
    captures.dash.onItemFocus({id: 'b'});
    expect(onItemFocus).toHaveBeenLastCalledWith('B', 1);
    show([second, first]);
    captures.dash.onItemBlur({id: 'b'});
    expect(onItemBlur).toHaveBeenLastCalledWith('B', 0);
    show([first]);
    captures.dash.onItemFocus({id: 'b'});
    expect(onItemFocus).toHaveBeenCalledOnce();
});
