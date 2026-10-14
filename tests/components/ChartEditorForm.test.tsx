// @vitest-environment jsdom

import React, {act} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {createRoot} from 'react-dom/client';
import {expect, it, vi} from 'vitest';
import {ChartEditorForm} from '../../src/components/ChartEditorForm';
import {setLang} from '../../src/i18n';
import type {ChartEditorFormValues} from '../../src/types/chartEditor';

it('preserves selected series and X categories when changing shared chart configuration', () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    const values: ChartEditorFormValues = {
        dataIds: ['requests', 'errors'],
        axisType: 'category',
        axisCategories: ['Monday', 'Tuesday'],
        chartTitle: 'Before',
        xTitle: 'Day',
        yTitle: 'Count',
        showLegend: true,
    };
    const onFormValuesChange = vi.fn();

    try {
        act(() =>
            root.render(
                <ThemeProvider>
                    <ChartEditorForm
                        dataIds={['requests', 'errors']}
                        axisVariants={['category', 'linear']}
                        formValues={values}
                        onFormValuesChange={onFormValuesChange}
                    />
                </ThemeProvider>,
            ),
        );
        const title = container.querySelector<HTMLInputElement>('input[aria-label="Chart title"]');
        expect(title).not.toBeNull();
        if (!title) throw new Error('Missing chart title input');
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
                title,
                'After',
            );
            title.dispatchEvent(new Event('input', {bubbles: true}));
        });
        expect(onFormValuesChange).toHaveBeenLastCalledWith({...values, chartTitle: 'After'});
        expect(title.value).toBe('Before');
    } finally {
        act(() => root.unmount());
        container.remove();
    }
});

it.each([
    {
        lang: 'en',
        labels: undefined,
        expected: ['Chart title', 'X title', 'Y title', 'Show legend'],
    },
    {
        lang: 'ru',
        labels: undefined,
        expected: ['Заголовок графика', 'Заголовок X', 'Заголовок Y', 'Показывать легенду'],
    },
    {
        lang: 'ru',
        labels: {chartTitle: 'Custom title', showLegend: 'Custom legend'},
        expected: ['Custom title', 'Заголовок X', 'Заголовок Y', 'Custom legend'],
    },
    {
        lang: 'en',
        labels: {chartTitle: '', xTitle: '', yTitle: '', showLegend: ''},
        expected: ['', '', '', ''],
    },
])('resolves shared labels for $lang with overrides $labels', ({lang, labels, expected}) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    setLang(lang);
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    try {
        act(() =>
            root.render(
                <ThemeProvider>
                    <ChartEditorForm formValues={{}} labels={labels} />
                </ThemeProvider>,
            ),
        );
        const sharedFields = container.querySelector('.qp-chart-config-fields');
        expect(sharedFields).not.toBeNull();
        if (!sharedFields) throw new Error('Missing shared chart fields');
        expect(
            Array.from(sharedFields.querySelectorAll('input[aria-label]')).map((input) =>
                input.getAttribute('aria-label'),
            ),
        ).toEqual(expected.slice(0, 3));
        expect(sharedFields.querySelector('label')?.textContent).toBe(expected[3]);
    } finally {
        act(() => root.unmount());
        container.remove();
        setLang('en');
    }
});
