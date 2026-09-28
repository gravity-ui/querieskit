// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, it, vi} from 'vitest';
import {QueryProgress} from '../../src/modules/QueryProgress';

vi.mock('@gravity-ui/uikit', () => {
    const Group = Object.assign(({children}: any) => <div>{children}</div>, {
        Option: ({children}: any) => <span>{children}</span>,
    });
    return {
        Flex: ({children}: any) => <div>{children}</div>,
        Icon: () => null,
        Loader: () => null,
        SegmentedRadioGroup: Group,
    };
});
vi.mock('../../src/components/QueryGraph', () => ({
    QueryGraph: ({active}: any) => <div data-graph={String(active)} />,
}));
vi.mock('../../src/modules/QueryTimeline', () => ({
    QueryTimeline: ({active, items}: any) => (
        <div data-timeline={String(active)} data-count={items.length} />
    ),
}));

it('opens both lazy views through controlled changes and preserves mounted shells', async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement('div');
    const root = createRoot(container);
    const graphProps = {nodes: [], edges: []};
    try {
        await act(async () =>
            root.render(<QueryProgress graphProps={graphProps} view="timeline" />),
        );
        expect(container.querySelector('[data-timeline="true"]')?.getAttribute('data-count')).toBe(
            '0',
        );
        expect(container.querySelector('[data-graph]')).toBeNull();
        await act(async () => root.render(<QueryProgress graphProps={graphProps} view="graph" />));
        expect(container.querySelector('[data-graph="true"]')).not.toBeNull();
        expect(container.querySelector('[data-timeline="false"]')).not.toBeNull();
        await act(async () =>
            root.render(<QueryProgress graphProps={graphProps} view="timeline" />),
        );
        expect(container.querySelector('[data-graph="false"]')).not.toBeNull();
        expect(container.querySelector('[data-timeline="true"]')).not.toBeNull();
        await act(async () =>
            root.render(<QueryProgress graphProps={graphProps} view="timeline" active={false} />),
        );
        expect(container.querySelector('[data-graph="false"]')).not.toBeNull();
        expect(container.querySelector('[data-timeline="false"]')).not.toBeNull();
        await act(async () =>
            root.render(<QueryProgress graphProps={{...graphProps, active: false}} view="graph" />),
        );
        expect(container.querySelector('[data-graph="false"]')).not.toBeNull();
        await act(async () =>
            root.render(
                <QueryProgress
                    graphProps={graphProps}
                    view="timeline"
                    timelineProps={{items: [], active: false}}
                />,
            ),
        );
        expect(container.querySelector('[data-timeline="false"]')).not.toBeNull();
    } finally {
        act(() => root.unmount());
    }
});
