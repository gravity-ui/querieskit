// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {afterEach, describe, expect, it, vi} from 'vitest';
import type {DashboardProps} from '../../src/types/dashboard';
import {createDefaultLayout} from '../../src/components/Dashboard/helpers/createDefaultLayout';
import {useDashboardConfig} from '../../src/components/Dashboard/hooks/useDashboardConfig';

const a = {i: 'a', x: 0, y: 2, w: 2, h: 4};
const b = {i: 'b', x: 2, y: 0, w: 2, h: 2};
const items = ['a', 'b'].map((id) => ({id, content: null}));
let current: ReturnType<typeof useDashboardConfig>;
let root: ReturnType<typeof createRoot> | undefined;
function Fixture(props: DashboardProps) {
    current = useDashboardConfig(props.items, props.grid, props.defaultLayout, props.layout);
    return null;
}
function render(props: DashboardProps) {
    if (!root) root = createRoot(document.createElement('div'));
    act(() => root!.render(<Fixture {...props} />));
}
afterEach(() => {
    act(() => root?.unmount());
    root = undefined;
});
Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true});

describe('dashboard layout', () => {
    it('matches IDs, preserves coordinates and appends after occupied space', () => {
        expect(createDefaultLayout([...items].reverse(), 4, [a, b])).toEqual([b, a]);
        expect(createDefaultLayout([...items, {id: 'c', content: null}], 4, [b, a])[2]).toEqual({
            i: 'c',
            x: 0,
            y: 6,
            w: 2,
            h: 4,
        });
    });
    it('normalizes bounds, drops deleted IDs and uses first finite duplicate', () => {
        expect(
            createDefaultLayout([items[0]], 4, [
                {...a, x: NaN},
                {...a, x: -1, y: -2, w: 99, h: 0},
                a,
                b,
            ]),
        ).toEqual([{...a, x: 0, y: 0, w: 4, h: 1}]);
    });
    it('retains user changes and treats defaultLayout as initial only', () => {
        render({items, defaultLayout: [a, b]});
        const moved = {...a, y: 10};
        act(() => {
            current.changeLayout([moved, b]);
        });
        render({items: [...items].reverse(), defaultLayout: [a, b]});
        expect(current.config.layout).toEqual([b, moved]);
        render({items: [items[1]]});
        render({items});
        expect(current.config.layout.find(({i}) => i === 'a')?.y).toBe(2);
    });
    it('controlled updates are authoritative and never emit reconciliation events', () => {
        const onLayoutChange = vi.fn();
        render({items, layout: [a, b], onLayoutChange});
        act(() => {
            current.changeLayout([{...a, y: 20}, b]);
        });
        expect(current.config.layout).toEqual([a, b]);
        render({items, layout: [{...a, y: 8}, b], onLayoutChange});
        expect(current.config.layout[0].y).toBe(8);
        expect(onLayoutChange).not.toHaveBeenCalled();
        expect(current.changeLayout(current.config.layout)).toBeUndefined();
    });
});
