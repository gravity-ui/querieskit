// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {TimelineState} from '@gravity-ui/timeline';
import {TimelineCanvasView} from '../../src/modules/QueryTimeline/internal/TimelineCanvasView';
import {createRows} from '../../src/modules/QueryTimeline/helpers/model';

const observed = vi.hoisted(() => ({timeline: undefined as any, instances: new Set<any>()}));
vi.mock('@gravity-ui/timeline/react', async (getOriginal) => {
    const original = await getOriginal<any>();
    return {
        ...original,
        useTimeline: (config: any) => {
            const result = original.useTimeline(config);
            observed.timeline = result.timeline;
            observed.instances.add(result.timeline);
            return result;
        },
    };
});
vi.mock('@gravity-ui/uikit', () => ({useThemeValue: () => 'light', Popup: () => null}));

describe('TimelineCanvasView with the real timeline engine', () => {
    let root: Root;
    let container: HTMLDivElement;
    const rows = createRows(
        [{id: 'one', label: 'One', interval: {start: 0, end: 0}}],
        new Set(),
        1000,
    );
    const props = () => ({
        rows,
        offset: 0,
        rowHeight: 32,
        scrollTop: 0,
        range: {from: -500, to: 1500},
        controlled: false,
        onRangeChange: vi.fn(),
        statuses: new Map(),
        formatDuration: String,
        now: 1000,
        selectedIds: [],
        onSelectionChange: vi.fn(),
    });
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        observed.instances.clear();
        vi.stubGlobal(
            'ResizeObserver',
            class {
                observe() {}
                disconnect() {}
            },
        );
        vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue(
            new DOMRect(0, 0, 600, 320),
        );
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
            this: HTMLCanvasElement,
        ) {
            return new Proxy(
                {canvas: this, measureText: () => ({width: 20})},
                {
                    get(target, property) {
                        return (target as any)[property] ?? (() => {});
                    },
                },
            ) as any;
        });
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });
    it('updates in place, uses global row positions and gives zero events a finite hitbox', () => {
        const initial = props();
        act(() => root.render(<TimelineCanvasView {...initial} />));
        const timeline = observed.timeline;
        expect(timeline.state).toBe(TimelineState.READY);
        const component = Array.from((timeline.api as any).components.values()).find(
            (value: any) => value.getSelectedEvents,
        ) as any;
        expect(component._events[0].from).toBe(0);
        expect(component._events[0].to).toBeGreaterThan(0);
        act(() => root.render(<TimelineCanvasView {...initial} offset={100} scrollTop={3200} />));
        expect(observed.timeline).toBe(timeline);
        expect(observed.instances.size).toBe(1);
        expect(timeline.api.canvasScrollTop).toBe(3200);
        expect(timeline.api.getEventPosition(component._events[0]).y0).toBe(16);
        expect(initial.onRangeChange).not.toHaveBeenCalled();
    });
    it('reports gestures but suppresses synchronization feedback and restores controlled ranges', () => {
        const initial = {...props(), controlled: true};
        act(() => root.render(<TimelineCanvasView {...initial} />));
        act(() => observed.timeline.api.setRange(0, 3000));
        expect(initial.onRangeChange).toHaveBeenCalledExactlyOnceWith({from: 0, to: 3000});
        expect(observed.timeline.api.getInterval()).toEqual({start: -500, end: 1500});
        act(() => root.render(<TimelineCanvasView {...initial} range={{from: 0, to: 5000}} />));
        expect(initial.onRangeChange).toHaveBeenCalledTimes(1);
        expect(observed.timeline.api.getInterval()).toEqual({start: 0, end: 5000});
    });
    it('survives StrictMode effect replay and destroys the engine on unmount', () => {
        act(() =>
            root.render(
                <React.StrictMode>
                    <TimelineCanvasView {...props()} />
                </React.StrictMode>,
            ),
        );
        const timeline = observed.timeline;
        expect(timeline.state).toBe(TimelineState.READY);
        act(() => root.render(null));
        expect(timeline.state).toBe(TimelineState.INIT);
    });
});
