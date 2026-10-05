// @vitest-environment jsdom

import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import type {Root} from 'react-dom/client';
import BaseDataTable from '@gravity-ui/react-data-table';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {DataTable} from '../../src/components/DataTable/DataTable';
import type {DataTableProps} from '../../src/components/DataTable/DataTable';

vi.mock('../../src/components/EmptyContent', () => ({EmptyContent: () => null}));

describe('DataTable content resize synchronization', () => {
    let container: HTMLDivElement;
    let root: Root;
    let notifyResize: ResizeObserverCallback;
    let observe: ReturnType<typeof vi.fn>;
    let disconnect: ReturnType<typeof vi.fn>;
    let frames: Map<number, FrameRequestCallback>;
    let nextFrame: number;

    const columns = [{name: 'value'}];
    const data = [{value: 'First value'}];
    const settings = {stickyHead: BaseDataTable.FIXED, syncHeadOnResize: true};

    function render(nextSettings = settings, nextData = data) {
        act(() => {
            root.render(<DataTable columns={columns} data={nextData} settings={nextSettings} />);
        });
    }

    function resize(width: number, height: number) {
        notifyResize([{contentRect: {width, height}} as ResizeObserverEntry], {} as ResizeObserver);
    }

    function flushFrame() {
        act(() => {
            const pending = [...frames.values()];
            frames.clear();
            pending.forEach((callback) => callback(0));
        });
    }

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        observe = vi.fn();
        disconnect = vi.fn();
        frames = new Map();
        nextFrame = 0;
        vi.stubGlobal(
            'ResizeObserver',
            class {
                observe = observe;
                disconnect = disconnect;
                constructor(callback: ResizeObserverCallback) {
                    notifyResize = callback;
                }
            },
        );
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn((callback: FrameRequestCallback) => {
                const id = ++nextFrame;
                frames.set(id, callback);
                return id;
            }),
        );
        vi.stubGlobal(
            'cancelAnimationFrame',
            vi.fn((id: number) => frames.delete(id)),
        );
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

    it('observes the real data table and coalesces content changes into one resize', () => {
        const sync = vi.spyOn(BaseDataTable.prototype, 'resize');
        render();

        expect(observe).toHaveBeenCalledOnce();
        expect(observe).toHaveBeenCalledWith(container.querySelector('.data-table__box table'));
        expect(observe.mock.calls[0][0]).toBeInstanceOf(HTMLTableElement);
        expect(observe.mock.calls[0][0]).not.toBe(container.querySelector('table'));

        vi.mocked(requestAnimationFrame).mockClear();
        resize(400, 100);
        resize(400, 200);
        expect(sync).not.toHaveBeenCalled();
        expect(requestAnimationFrame).toHaveBeenCalledOnce();
        flushFrame();
        expect(sync).toHaveBeenCalledOnce();

        // Header synchronization that leaves the body size unchanged cannot loop.
        vi.mocked(requestAnimationFrame).mockClear();
        resize(400, 200);
        expect(requestAnimationFrame).not.toHaveBeenCalled();

        render(settings, [{value: 'Updated value'}]);
        resize(500, 200);
        flushFrame();
        expect(sync).toHaveBeenCalledTimes(2);
        expect(observe).toHaveBeenCalledOnce();
    });

    it('cancels pending synchronization and disconnects when disabled', () => {
        const sync = vi.spyOn(BaseDataTable.prototype, 'resize');
        render();
        resize(400, 100);
        render({...settings, syncHeadOnResize: false});

        expect(disconnect).toHaveBeenCalledOnce();
        expect(cancelAnimationFrame).toHaveBeenCalledOnce();
        flushFrame();
        expect(sync).not.toHaveBeenCalled();
    });

    it('cancels pending synchronization and disconnects on unmount', () => {
        const sync = vi.spyOn(BaseDataTable.prototype, 'resize');
        render();
        resize(400, 100);
        act(() => root.render(null));

        expect(disconnect).toHaveBeenCalledOnce();
        expect(cancelAnimationFrame).toHaveBeenCalledOnce();
        flushFrame();
        expect(sync).not.toHaveBeenCalled();
    });

    it.each<DataTableProps<{value: string}>['settings']>([
        undefined,
        {syncHeadOnResize: true},
        {stickyHead: BaseDataTable.FIXED},
        {stickyHead: BaseDataTable.FIXED, syncHeadOnResize: false},
    ])('does not observe unless sticky header and synchronization are enabled (%j)', (value) => {
        act(() => {
            root.render(<DataTable columns={columns} data={data} settings={value} />);
        });
        expect(observe).not.toHaveBeenCalled();
    });

    it('supports environments without ResizeObserver', () => {
        vi.stubGlobal('ResizeObserver', undefined);
        expect(() => render()).not.toThrow();
        expect(observe).not.toHaveBeenCalled();
    });

    it('observes the replacement table when the dynamic rendering mode changes', () => {
        const sync = vi.spyOn(BaseDataTable.prototype, 'resize');
        function renderDynamic(dynamicRenderType: 'simple' | 'uniform') {
            act(() => {
                root.render(
                    <DataTable
                        columns={columns}
                        data={data}
                        settings={{...settings, dynamicRender: true, dynamicRenderType}}
                    />,
                );
            });
        }

        renderDynamic('simple');
        const firstTable = container.querySelector('.data-table__box table');
        resize(400, 100);
        renderDynamic('uniform');
        const replacementTable = container.querySelector('.data-table__box table');

        expect(replacementTable).toBeInstanceOf(HTMLTableElement);
        expect(replacementTable).not.toBe(firstTable);
        expect(disconnect).toHaveBeenCalledOnce();
        expect(observe).toHaveBeenLastCalledWith(replacementTable);
        expect(observe).toHaveBeenCalledTimes(2);

        flushFrame();
        expect(sync).not.toHaveBeenCalled();
        resize(400, 200);
        flushFrame();
        expect(sync).toHaveBeenCalledOnce();
    });
});
