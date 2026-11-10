import React from 'react';
import {
    QueryPageLayout,
    type QueryPageLayoutHeaderContext,
    type QueryPageLayoutProps,
} from '../../src';
import {
    type QueryPageLayoutHeaderContext as EntrypointHeaderContext,
    type QueryPageLayoutProps as EntrypointProps,
    QueryPageLayout as LayoutEntrypoint,
} from '../../src/modules/QueryPageLayout';

type Equal<A, B> =
    (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

export type ContractChecks = [
    Assert<Equal<QueryPageLayoutProps, EntrypointProps>>,
    Assert<Equal<QueryPageLayoutHeaderContext, EntrypointHeaderContext>>,
    Assert<Equal<QueryPageLayoutHeaderContext['sidebarToggle'], React.ReactNode>>,
    Assert<Equal<QueryPageLayoutHeaderContext['sidebarCollapsed'], boolean>>,
];

// A single workspace requires neither tab data nor placeholder callbacks.
export const singleWorkspace = (
    <QueryPageLayout sidebar={<nav>Navigation</nav>}>
        <main>Workspace</main>
    </QueryPageLayout>
);

export const headerNode = (
    <LayoutEntrypoint sidebar="Navigation" header={<h1>Query</h1>}>
        Workspace
    </LayoutEntrypoint>
);

export const controlled = (
    <QueryPageLayout
        sidebar={<nav />}
        sidebarWidth={400}
        sidebarCollapsed={false}
        onSidebarWidthChange={(width) => width.toFixed()}
        onSidebarCollapsedChange={(collapsed) => collapsed.valueOf()}
        header={({sidebarToggle, sidebarCollapsed}) => (
            <header aria-expanded={!sidebarCollapsed}>{sidebarToggle}</header>
        )}
    >
        <main />
    </QueryPageLayout>
);

export const uncontrolled: QueryPageLayoutProps = {
    sidebar: <nav />,
    children: <main />,
    defaultSidebarWidth: 400,
    defaultSidebarCollapsed: true,
    className: 'consumer-layout',
};

export const invalidWidthHandler: QueryPageLayoutProps = {
    ...uncontrolled,
    // @ts-expect-error Width changes are numeric, independently of application state.
    onSidebarWidthChange: (width: string) => width,
};
// @ts-expect-error The layout does not accept tab state.
export const invalidTabs: QueryPageLayoutProps = {...uncontrolled, activeTab: 'query'};
