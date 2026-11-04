# QueryWorkspaceLayout

A data-independent editor/results layout with resizing, controlled or uncontrolled
collapse/expand state, and activity propagation. It renders no query widgets itself.
Import it from `@gravity-ui/querieskit/modules/QueryWorkspaceLayout` or the root.

```tsx
<QueryWorkspaceLayout
  active={active}
  showResults={hasExecution}
  renderEditor={({active}) => <ConnectedEditor sessionId={id} active={active} />}
  renderExecutionPanel={(layout) => <ConnectedResults sessionId={id} {...layout} />}
/>
```

The application owns `showResults` (default `true`); this layout never infers it
from execution state. Slots remain mounted when hidden, collapsed or expanded.
`renderEditor` receives `active=false` while results are expanded or the parent
workspace is inactive. Results receive `active=false` when `showResults=false`
or the parent workspace is inactive. Collapsed results remain active so their
header/status can update; pass the supplied `collapsed` flag to the result widget.
Custom overlays and keyboard handlers must honor these signals.

`collapsed`, `expanded`, and `executionPanelHeight` are optional controlled props;
their callbacks propose changes. When omitted, the layout stores them locally.
Defaults are `defaultCollapsed=false`, `defaultExpanded=false`, and
`defaultExecutionPanelHeight=300`. Collapse takes precedence over expansion.
Hiding results preserves layout preferences and does not emit change events.
Height is constrained to leave at least 160px for the editor and 120px for results.
The accessible separator supports pointer resizing and arrow/Home/End keys.

Supply a bounded parent height. Keep slot component types and keys stable to
preserve Monaco, form drafts, and result state. Render callbacks are not components:
place hooks inside the components they return. No store, router, persistence or
query-session abstraction is required.
