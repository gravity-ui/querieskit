// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryDuration} from '../../src/components/QueryDuration/QueryDuration';

vi.mock('@gravity-ui/uikit', () => ({
    Label: ({children}: {children: React.ReactNode}) => <span>{children}</span>,
}));

describe('QueryDuration', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.useRealTimers();
    });

    it('shows a placeholder for a completed query without endTime', () => {
        act(() => root.render(<QueryDuration status="completed" startTime={0} />));

        expect(container.textContent).toBe('--:--');
    });

    it('updates a running query using the current time', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15T12:05:00Z'));
        const startTime = Date.now() - 5 * 60_000;

        act(() => root.render(<QueryDuration status="running" startTime={startTime} />));
        expect(container.textContent).toBe('00:05');

        act(() => {
            vi.advanceTimersByTime(60_000);
        });
        expect(container.textContent).toBe('00:06');
    });

    it('accepts zero as a startTime', () => {
        act(() =>
            root.render(<QueryDuration status="completed" startTime={0} endTime={5 * 60_000} />),
        );

        expect(container.textContent).toBe('00:05');
    });
});
