// @vitest-environment jsdom

import React, {act} from 'react';
import type {Root} from 'react-dom/client';
import {createRoot} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {QueryListLinkRenderer, QueryListRowRenderData} from '../../src/types/queryList';
import type {TutorialHistoryRow} from '../../src/types/tutorial';
import {TutorialRowContent} from '../../src/widgets/TutorialsHistory/TutorialRowContent';

vi.mock('@gravity-ui/uikit', async () => {
    const ReactModule = await import('react');

    return {
        Flex: ({children, className}: React.PropsWithChildren<{className?: string}>) =>
            ReactModule.createElement('div', {className}, children),
        Text: ({
            as = 'span',
            children,
            className,
        }: React.PropsWithChildren<{as?: React.ElementType; className?: string}>) =>
            ReactModule.createElement(as, {className}, children),
    };
});

vi.mock('../../src/components/MonacoEditor', () => ({
    MonacoEditor: ({value}: {value?: string}) => <div data-testid="query">{value}</div>,
    MonacoLanguage: {YQL: 'yql'},
}));

const ITEM: TutorialHistoryRow = {
    id: 'tutorial-string-id',
    title: 'String identifier tutorial',
    query: 'SELECT 1',
    href: '/tutorials/tutorial-string-id',
    height: 28,
};

describe('tutorial row links', () => {
    let container: HTMLDivElement;
    let root: Root;

    const renderContent = (
        data: Partial<QueryListRowRenderData<TutorialHistoryRow>> &
            Pick<QueryListRowRenderData<TutorialHistoryRow>, 'item'>,
    ) => {
        const renderData: QueryListRowRenderData<TutorialHistoryRow> = {
            index: 0,
            isActive: false,
            variant: 'default',
            ...data,
        };

        act(() => {
            root.render(<TutorialRowContent {...renderData} />);
        });
    };

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it('uses the custom link renderer for default and search rows', () => {
        const renderLink = vi.fn<QueryListLinkRenderer>((props) => (
            <a {...props} data-router-link />
        ));

        renderContent({item: ITEM, renderLink});
        expect(container.querySelector('a[data-router-link]')?.getAttribute('href')).toBe(
            ITEM.href,
        );
        expect(container.textContent).toContain(`${ITEM.id}.`);

        renderContent({item: ITEM, variant: 'search', renderLink});
        expect(container.querySelector('a[data-router-link]')?.getAttribute('href')).toBe(
            ITEM.href,
        );
        expect(container.querySelector('[data-testid="query"]')?.textContent?.trim()).toBe(
            ITEM.query,
        );
        expect(renderLink).toHaveBeenCalledTimes(2);
    });

    it('falls back to an anchor when renderLink is absent', () => {
        renderContent({item: ITEM});

        expect(container.querySelector('a')?.getAttribute('href')).toBe(ITEM.href);
    });

    it('renders a non-link row without calling renderLink when href is absent', () => {
        const renderLink = vi.fn<QueryListLinkRenderer>((props) => <a {...props} />);
        renderContent({item: {...ITEM, href: undefined}, renderLink});

        expect(container.querySelector('a')).toBeNull();
        expect(container.querySelector('.qp-row-link')?.tagName).toBe('DIV');
        expect(renderLink).not.toHaveBeenCalled();
    });

    it('keeps the standard group header rendering', () => {
        renderContent({item: {header: 'Getting started', height: 28}});

        expect(container.querySelector('.qp-history-list-header')?.textContent).toBe(
            'Getting started',
        );
    });
});
