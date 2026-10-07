// @vitest-environment jsdom

import React, {act, useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {Root} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ChartEditorProps} from '../../src/modules/ChartEditor';
import type {AddChartButtonProps} from '../../src/components/AddChartButton/AddChartButton';
import {DashboardCharts} from '../../src/widgets/DashboardCharts/DashboardCharts';

vi.mock('../../src/modules/ChartEditor', () => ({
    ChartEditor: function StatefulEditor({formValues}: ChartEditorProps) {
        const [title, setTitle] = useState(formValues?.chartTitle ?? 'Initial title');
        return (
            <button data-testid="draft-title" onClick={() => setTitle('Unsaved title')}>
                {title}
            </button>
        );
    },
}));
vi.mock('../../src/modules/ChartFieldsEditor', () => ({ChartFieldsEditor: () => null}));
vi.mock('../../src/components/AddChartButton', () => ({
    AddChartButton: ({onSelect}: AddChartButtonProps<string>) => (
        <button data-testid="add-chart" onClick={() => onSelect('line')}>
            Add chart
        </button>
    ),
}));
vi.mock('../../src/components/Dashboard', () => ({Dashboard: () => null}));
vi.mock('../../src/components/Chart', () => ({Chart: () => null}));
vi.mock('../../src/widgets/DashboardCharts/internal/EmptyDashboardPlaceholder', () => ({
    EmptyDashboardPlaceholder: () => null,
}));

describe('DashboardCharts portal lifecycle', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
        }));
        vi.stubGlobal(
            'ResizeObserver',
            class {
                public observe() {}
                public unobserve() {}
                public disconnect() {}
            },
        );
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
        vi.unstubAllGlobals();
    });

    async function render(active?: boolean) {
        await act(async () => {
            root.render(
                <ThemeProvider>
                    <DashboardCharts
                        active={active}
                        dataSource={{
                            line: {
                                requests: {
                                    type: 'line',
                                    seriesId: 'requests',
                                    data: [{x: 1, y: 2}],
                                },
                            },
                        }}
                    />
                </ThemeProvider>,
            );
        });
    }

    async function finishTransition() {
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 200));
        });
    }

    it('hides the real portal and unlocks scrolling while retaining an unsaved series draft', async () => {
        const initialOverflow = document.body.style.overflow;
        await render();
        await act(async () => {
            container.querySelector<HTMLButtonElement>('[data-testid="add-chart"]')!.click();
        });
        await finishTransition();

        const editor = document.body.querySelector<HTMLButtonElement>(
            '[data-testid="draft-title"]',
        )!;
        const overlay = editor.closest<HTMLElement>('[data-floating-ui-status]')!;
        expect(editor).not.toBeNull();
        expect(container.contains(editor)).toBe(false);
        expect(overlay.dataset.floatingUiStatus).toBe('open');
        expect(document.body.style.overflow).toBe('hidden');
        await act(async () => editor.click());
        expect(editor.textContent).toBe('Unsaved title');

        await render(false);
        await finishTransition();
        // UIKit's stylesheet hides kept-mounted overlays in the unmounted transition state.
        expect(overlay.dataset.floatingUiStatus).toBe('unmounted');
        expect(document.body.style.overflow).toBe(initialOverflow);
        expect(document.body.querySelector('[data-testid="draft-title"]')).toBe(editor);

        await render(true);
        await finishTransition();
        expect(overlay.dataset.floatingUiStatus).toBe('open');
        expect(document.body.style.overflow).toBe('hidden');
        expect(document.body.querySelector('[data-testid="draft-title"]')).toBe(editor);
        expect(editor.textContent).toBe('Unsaved title');
    });
});
