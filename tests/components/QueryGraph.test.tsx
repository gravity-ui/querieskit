// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {QueryGraph} from '../../src/components/QueryGraph/QueryGraph';
import type {QueryGraphNode, QueryGraphProps} from '../../src/types/queryGraph';

const captured = vi.hoisted(() => ({
    canvas: undefined as any,
    handlers: new Map<string, (event: any) => void>(),
    calculateLayout: vi.fn(),
    setEntities: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    api: {zoomToViewPort: vi.fn(), getGraphColors: vi.fn(), updateGraphColors: vi.fn()},
    graph: {
        cameraService: {
            getCameraState: () => ({scale: 0.1, scaleMin: 0.05, scaleMax: 2}),
            zoom: vi.fn(),
        },
    },
}));

vi.mock('@gravity-ui/graph', () => ({
    ECanDrag: {NONE: 'none'},
    GraphState: {ATTACHED: 'attached'},
    useLayeredLayout: ({blocks, connections, layoutOptions}: any) => {
        const result = React.useMemo(() => {
            captured.calculateLayout({blocks, connections, layoutOptions});
            return {
                blocks: Object.fromEntries(
                    blocks.map(({id}: any, index: number) => [id, {x: index * 145, y: 0}]),
                ),
                edges: {},
            };
        }, [blocks, connections, layoutOptions]);
        return {result, isLoading: false};
    },
}));
vi.mock('@gravity-ui/graph/react', () => ({
    useGraph: () => captured,
    useGraphEvent: (_graph: unknown, name: string, handler: (event: any) => void) => {
        captured.handlers.set(name, handler);
    },
    GraphCanvas: (props: any) => {
        captured.canvas = props;
        return <canvas />;
    },
}));
vi.mock('@gravity-ui/uikit', () => ({
    useThemeValue: () => 'light',
    Button: ({children, view: _view, pin: _pin, ...props}: any) => (
        <button {...props}>{children}</button>
    ),
    Icon: () => null,
    Loader: () => <span>Loading</span>,
    Text: ({children}: any) => <span>{children}</span>,
    Tooltip: ({children, content, open}: any) => (
        <>
            {children}
            {open && <div role="tooltip">{content}</div>}
        </>
    ),
}));
vi.mock('../../src/components/QueryGraph/internal/QueryGraphCanvasBlock', () => ({
    QueryGraphCanvasBlock: class {},
}));
vi.mock('../../src/components/QueryGraph/internal/QueryGraphConnection', () => ({
    QueryGraphConnection: class {},
}));
vi.mock('../../src/components/QueryGraph/internal/queryGraphIcons', () => ({
    getQueryGraphNodeIconSvgs: () => ({}),
}));
vi.mock('../../src/components/QueryGraph/internal/QueryGraphPopup', () => ({
    QueryGraphPopup: ({node}: {node: QueryGraphNode}) => <div data-popup>{node.name}</div>,
}));

const nodes: QueryGraphNode[] = [
    {
        id: 'source',
        kind: 'operation',
        name: 'ReadTable',
        label: 'The full untruncated table operation name',
        status: 'running',
        progress: {fraction: 0.1},
    },
    {id: 'target', kind: 'output', name: 'Full output table path'},
];
const edges = [{id: 'edge', source: 'source', target: 'target'}];

function nodeEvent(node = nodes[0], type = 'mouseenter') {
    const mouseEvent = new MouseEvent(type === 'click' ? 'click' : 'mousemove', {
        clientX: 100,
        clientY: 80,
    });
    return {
        target: {state: {meta: {node}}},
        sourceEvent:
            type === 'click'
                ? mouseEvent
                : new CustomEvent(type, {detail: {sourceEvent: mouseEvent}}),
    };
}

function emit(name: string, event: any) {
    const handler = captured.handlers.get(name);
    if (!handler) throw new Error(`Missing graph event handler: ${name}`);
    act(() => handler(event));
}

describe('QueryGraph interactions', () => {
    let container: HTMLDivElement;
    let root: Root;
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.clearAllMocks();
        captured.handlers.clear();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });
    const render = (props: Partial<QueryGraphProps> = {}) =>
        act(() => root.render(<QueryGraph nodes={nodes} edges={edges} {...props} />));
    const tooltip = () => container.querySelector('[role="tooltip"]');

    it.each([0.1, 0.25, 0.5, 1])(
        'shows the full hovered label at scale %s and highlights adjacent connections',
        (scale) => {
            render();
            emit('camera-change', {scale});
            emit('mouseenter', nodeEvent());
            expect(tooltip()?.textContent).toBe(nodes[0].label);
            const anchor = container.querySelector('.qp-query-graph__hover-anchor') as HTMLElement;
            expect(anchor.style.left).toBe('100px');
            expect(anchor.style.top).toBe('80px');
            expect(captured.setEntities.mock.lastCall?.[0].connections[0].selected).toBe(true);
            emit('mouseleave', nodeEvent(nodes[0], 'mouseleave'));
            expect(tooltip()).toBeNull();
            expect(captured.setEntities.mock.lastCall?.[0].connections[0].selected).toBe(false);
            emit('mouseenter', nodeEvent(nodes[1]));
            expect(tooltip()?.textContent).toBe(nodes[1].name);
        },
    );

    it('closes hover content when the camera moves, a node is clicked, or the view becomes inactive', () => {
        const onNodeClick = vi.fn();
        render({onNodeClick});
        emit('mouseenter', nodeEvent());
        emit('camera-change', {scale: 0.1});
        expect(tooltip()).toBeNull();
        emit('mouseenter', nodeEvent());
        act(() => captured.canvas.click(nodeEvent(nodes[0], 'click')));
        expect(tooltip()).toBeNull();
        expect(container.querySelector('[data-popup]')?.textContent).toBe(nodes[0].name);
        expect(onNodeClick.mock.calls[0][0]).toBe(nodes[0]);
        emit('mouseenter', nodeEvent());
        render({active: false});
        expect(tooltip()).toBeNull();
        expect(container.querySelector('[data-popup]')).toBeNull();
        render();
        expect(tooltip()).toBeNull();
    });

    it('closes hover content when the pointer leaves the graph container', () => {
        render();
        emit('mouseenter', nodeEvent());
        expect(tooltip()?.textContent).toBe(nodes[0].label);
        const canvas = container.querySelector('canvas');
        if (!canvas) throw new Error('Missing graph canvas');
        act(() =>
            canvas.dispatchEvent(
                new MouseEvent('mouseout', {bubbles: true, relatedTarget: document.body}),
            ),
        );
        expect(tooltip()).toBeNull();
        expect(captured.setEntities.mock.lastCall?.[0].connections[0].selected).toBe(false);
    });

    it('updates progress and hovered text without recalculating layout or refitting the camera', () => {
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        render();
        act(() => captured.canvas.onStateChanged({state: 'attached'}));
        expect(captured.api.zoomToViewPort).toHaveBeenCalledTimes(1);
        captured.api.zoomToViewPort.mockClear();
        emit('mouseenter', nodeEvent());
        const initialLayoutCount = captured.calculateLayout.mock.calls.length;
        const updated = nodes.map((node) => ({
            ...node,
            label: 'Updated full label',
            progress: {fraction: 0.75},
        }));
        render({nodes: updated, edges: edges.map((edge) => ({...edge}))});
        expect(initialLayoutCount).toBe(1);
        expect(captured.calculateLayout).toHaveBeenCalledTimes(initialLayoutCount);
        expect(tooltip()?.textContent).toBe('Updated full label');
        expect(captured.setEntities.mock.lastCall?.[0].blocks[0].meta.node.progress.fraction).toBe(
            0.75,
        );
        expect(captured.api.zoomToViewPort).not.toHaveBeenCalled();
    });
});
