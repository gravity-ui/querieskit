# QueryPageLayout

A data-independent page shell with a resizable sidebar, a header and workspace
content. Use it for a single workspace or an application-owned composition without
creating query tabs. Import it from `@gravity-ui/querieskit/modules/QueryPageLayout`
or the package root.

```tsx
import {QueryPageLayout} from '@gravity-ui/querieskit/modules/QueryPageLayout';
import {QueryWorkspaceLayout} from '@gravity-ui/querieskit/modules/QueryWorkspaceLayout';

<div style={{height: '100vh'}}>
  <QueryPageLayout sidebar={<ApplicationSidebar />} header="Query workspace">
    <QueryWorkspaceLayout
      showResults={hasExecution}
      renderEditor={({active}) => <ApplicationEditor active={active} />}
      renderExecutionPanel={(layout) => <ApplicationResults {...layout} />}
    />
  </QueryPageLayout>
</div>;
```

`sidebar` and `children` accept arbitrary React content. There is no dependency on
`QueriesSidebar`, an editor, a query model, a store or a router. Loading data,
executing queries and persisting preferences remain the application's responsibility.
Provide a bounded parent height and content that can shrink within its container.

## Header

When `header` is a React node or is omitted, the layout renders its standard header
with the sidebar toggle followed by that node. A render callback takes over the
header composition and receives the ready-made accessible toggle and current
collapsed state:

```tsx
<QueryPageLayout
  sidebar={<ApplicationSidebar />}
  header={({sidebarToggle, sidebarCollapsed}) => (
    <ApplicationHeader leadingAction={sidebarToggle} compact={sidebarCollapsed} />
  )}
>
  <ApplicationWorkspace />
</QueryPageLayout>
```

Place `sidebarToggle` in the custom header to retain an in-layout way to reopen the
sidebar. Render callbacks are not components; put hooks in the components they return.

## Layout state

Width and collapse can be controlled independently:

```tsx
<QueryPageLayout
  sidebar={<ApplicationSidebar />}
  sidebarWidth={sidebarWidth}
  onSidebarWidthChange={setSidebarWidth}
  sidebarCollapsed={sidebarCollapsed}
  onSidebarCollapsedChange={setSidebarCollapsed}
>
  <ApplicationWorkspace />
</QueryPageLayout>
```

Omit the controlled props to use local state. `defaultSidebarWidth` defaults to
300px and `defaultSidebarCollapsed` defaults to `false`. In controlled mode,
callbacks propose changes and the parent must update the corresponding prop.
Changing a controlled prop does not emit a change callback.

The sidebar has a 240px minimum and resizing reserves 320px for the workspace plus
a 6px separator. Containers narrower than their combined minimum can overflow;
the layout does not automatically collapse the sidebar. The separator supports pointer dragging and keyboard resizing
with arrow, Home and End keys. Collapsing the sidebar preserves its preferred
width. The sidebar and workspace content remain mounted; keep their component
types and keys stable to preserve local drafts and editor state.

`className` styles the layout's root. `classNames` adds classes to the `layout`,
`sidebar`, `sidebarDivider`, `workspace` and `content` regions for external
positioning and composition. Each slot owns its content styling. The layout owns
positioning and resizing between the sidebar and workspace.

## Related compositions

`QueryPageLayout` arranges the sidebar beside the workspace. `QueryWorkspaceLayout`
arranges the editor above execution results within that workspace; the two layouts
have independent state and can be composed as shown above.

Use `QueryPage` when you want the ready-made query/comparison tab composition with
workspace retention and tab accessibility. Existing `QueryPage` consumers do not
need to migrate to this module.

Storybook examples: `SingleWorkspace` demonstrates the two nested layouts without
tabs, `CustomHeader` places the supplied toggle in an application header, and
`Controlled` exposes external sidebar controls.
