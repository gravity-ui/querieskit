// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {QueryTimelineProps, QueryTimelineRange} from '../../src/types/queryTimeline';
import {QueryTimeline} from '../../src/modules/QueryTimeline';

const captured = vi.hoisted(() => ({canvas: undefined as any, mounts: 0, unmounts: 0}));
vi.mock('../../src/modules/QueryTimeline/internal/TimelineCanvasView', () => ({
    TimelineCanvasView: (props: any) => {
        captured.canvas = props;
        React.useEffect(() => {
            captured.mounts++;
            return () => {
                captured.unmounts++;
            };
        }, []);
        return <canvas data-testid="canvas" />;
    },
}));
vi.mock('@gravity-ui/uikit', () => ({
    Flex: ({children, direction, gap, wrap, alignItems, justifyContent, ...props}: any) => (
        <div {...props}>{children}</div>
    ),
    Text: ({children, variant, ellipsis, color, ...props}: any) => (
        <span {...props}>{children}</span>
    ),
    Icon: () => <span />,
    Link: (props: any) => <a {...props} />,
    Button: ({view, size, ...props}: any) => <button {...props} />,
    Loader: () => <span>Loading</span>,
    TextInput: ({onUpdate, hasClear, ...props}: any) => (
        <input {...props} onChange={(event) => onUpdate(event.target.value)} />
    ),
    Select: ({value, onUpdate, options, hasClear, width, ...props}: any) => (
        <select
            {...props}
            value={value[0] ?? ''}
            onChange={(event) => onUpdate(event.target.value ? [event.target.value] : [])}
        >
            <option value="">All</option>
            {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                    {option.content}
                </option>
            ))}
        </select>
    ),
}));
vi.mock('@gravity-ui/date-components', () => ({
    RangeDateSelection: () => <div data-testid="ruler" />,
}));

const items: QueryTimelineProps['items'] = [
    {
        id: 'first',
        label: 'First',
        status: 'custom',
        interval: {start: 0, end: 5000},
        data: {source: 'application'},
        stages: [{id: 's', label: 'Stage', interval: {start: 1000, end: 2000}}],
    },
    {id: 'second', label: 'Second', interval: {start: 2000, end: 6000}},
];

describe('QueryTimeline', () => {
    let container: HTMLDivElement;
    let root: Root;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal(
            'ResizeObserver',
            class {
                observe() {}
                disconnect() {}
            },
        );
        vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320);
        vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(960);
        vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(960);
        captured.canvas = undefined;
        captured.mounts = 0;
        captured.unmounts = 0;
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });
    const render = (props: Partial<QueryTimelineProps> = {}) =>
        act(() => root.render(<QueryTimeline items={items} {...props} />));
    const button = (label: string) =>
        Array.from(container.querySelectorAll('button')).find(
            (node) => node.textContent === label || node.getAttribute('aria-label') === label,
        )!;
    const click = (node: Element) =>
        act(() => node.dispatchEvent(new MouseEvent('click', {bubbles: true})));
    const changeSearch = (value: string) =>
        act(() => {
            const input = container.querySelector('input')!;
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
                input,
                value,
            );
            input.dispatchEvent(new Event('input', {bubbles: true}));
        });

    it('keeps filtering, expanded rows and range across inactive periods', () => {
        render();
        click(button('Expand all'));
        expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(3);
        click(button('Fit interval: Stage'));
        expect(captured.canvas.range).toEqual({from: 500, to: 2500});
        render({active: false});
        expect(container.querySelector('canvas')).toBeNull();
        render();
        expect(captured.canvas.range).toEqual({from: 500, to: 2500});
        expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(3);
        expect(captured.unmounts).toBe(1);
        changeSearch(' First ');
        expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(2);
        expect(captured.canvas.range).toEqual({from: 500, to: 2500});
    });
    it('does not rebuild the canvas or reset the camera when data updates', () => {
        render();
        const mounts = captured.mounts;
        act(() => captured.canvas.onRangeChange({from: 1000, to: 3000}));
        render({items: [...items, {id: 'new', label: 'New', interval: {start: 0, end: 90000}}]});
        expect(captured.canvas.range).toEqual({from: 1000, to: 3000});
        expect(captured.mounts).toBe(mounts);
        click(button('Fit all'));
        expect(captured.canvas.range).toEqual({from: 0, to: 90000});
    });
    it('treats a controlled range as authoritative and deduplicates callbacks', () => {
        const onRangeChange = vi.fn();
        const range: QueryTimelineRange = {from: 0, to: 10000};
        render({range, onRangeChange});
        act(() => {
            captured.canvas.onRangeChange({from: 1000, to: 3000});
            captured.canvas.onRangeChange({from: 1000, to: 3000});
        });
        expect(onRangeChange).toHaveBeenCalledTimes(1);
        expect(captured.canvas.range).toEqual(range);
        render({range: {from: 1000, to: 3000}, onRangeChange});
        expect(captured.canvas.range).toEqual({from: 1000, to: 3000});
        expect(onRangeChange).toHaveBeenCalledTimes(1);
    });
    it('runs the live clock only while active and keeps the initial range', () => {
        vi.useFakeTimers();
        vi.setSystemTime(10000);
        const running = [{id: 'live', label: 'Live', interval: {start: 0}}];
        render({items: running});
        expect(captured.canvas.rows[0].interval.to).toBe(10000);
        act(() => vi.advanceTimersByTime(2000));
        expect(captured.canvas.rows[0].interval.to).toBe(12000);
        expect(captured.canvas.range).toEqual({from: 0, to: 10000});
        render({items: running, active: false});
        expect(vi.getTimerCount()).toBe(0);
        act(() => vi.advanceTimersByTime(3000));
        render({items: running});
        expect(captured.canvas.rows[0].interval.to).toBe(15000);
        expect(captured.canvas.range).toEqual({from: 0, to: 10000});
        render({items: running, now: 9000});
        expect(vi.getTimerCount()).toBe(0);
        expect(captured.canvas.rows[0].interval.to).toBe(9000);
    });
    it('virtualizes 5000 rows and passes global indices to the canvas', () => {
        vi.useFakeTimers();
        const large = Array.from({length: 1000}, (_, index) => ({
            ...items[0],
            id: String(index),
            stages: Array.from({length: 4}, (_, stage) => ({
                id: String(stage),
                label: String(stage),
                interval: {start: 0, end: 1000},
            })),
        }));
        render({items: large});
        click(button('Expand all'));
        expect(container.querySelectorAll('[role="listitem"]').length).toBeLessThanOrEqual(30);
        const scroll = container.querySelector('.qp-query-timeline__scroll')!;
        act(() => {
            scroll.scrollTop = 32000;
            scroll.dispatchEvent(new Event('scroll'));
            vi.advanceTimersByTime(20);
        });
        expect(captured.canvas.offset).toBe(990);
        expect(captured.canvas.scrollTop).toBe(32000);
        expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(30);
        expect(
            (container.querySelector('.qp-query-timeline__canvas') as HTMLElement).style.height,
        ).toBe('320px');
    });
    it('keeps interval-less rows, distinguishes empty/filter/error states', () => {
        render({items: [{id: 'pending', label: 'Pending'}]});
        expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(1);
        expect(container.textContent).toContain('No time intervals');
        expect(container.querySelector('canvas')).toBeNull();
        changeSearch('missing');
        expect(container.textContent).toContain('No matching items');
        render({items: [], emptyContent: 'Custom empty'});
        expect(container.textContent).toContain('Custom empty');
        const onError = vi.fn();
        render({items: [{id: 'bad', label: 'Bad', interval: {start: NaN}}], onError});
        expect(onError).toHaveBeenCalledTimes(1);
        expect(container.querySelector('[role="alert"]')).not.toBeNull();
    });
    it('passes original application data and default content to renderers', () => {
        const renderItemLabel = vi.fn(({defaultContent}) => <strong>{defaultContent}</strong>);
        const onItemClick = vi.fn();
        render({renderItemLabel, onItemClick});
        expect(renderItemLabel.mock.calls[0][0].item).toBe(items[0]);
        click(button('First'));
        expect(onItemClick.mock.calls[0][0].data).toBe(items[0].data);
    });
    it('cleans up StrictMode clocks', () => {
        vi.useFakeTimers();
        act(() =>
            root.render(
                <React.StrictMode>
                    <QueryTimeline items={[{id: 'a', label: 'A', interval: {start: 0}}]} />
                </React.StrictMode>,
            ),
        );
        expect(vi.getTimerCount()).toBe(1);
        act(() => root.render(null));
        expect(vi.getTimerCount()).toBe(0);
    });
});
