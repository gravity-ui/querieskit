# QueryTimeline

A backend-independent execution timeline with a virtualized list, expandable stages,
status and name filters, live intervals, and a synchronized time range.

```tsx
import {QueryTimeline} from '@gravity-ui/querieskit';
import type {QueryTimelineItem} from '@gravity-ui/querieskit';

const items: QueryTimelineItem[] = [
  {
    id: 'load',
    label: 'Load source',
    status: 'fetching',
    interval: {start: Date.now() - 10_000},
    progress: {completed: 3, total: 5},
    stages: [
      {
        id: 'connect',
        label: 'Connect',
        interval: {start: Date.now() - 10_000, end: Date.now() - 8_000},
      },
    ],
  },
];

<div style={{height: 600}}>
  <QueryTimeline
    items={items}
    statuses={[
      {
        id: 'fetching',
        label: 'Fetching',
        color: 'var(--g-color-base-info-heavy)',
      },
    ]}
    timeZone="UTC"
  />
</div>;
```

Use UIKit's `ThemeProvider` and global styles as described in the package README.
The parent must provide a bounded height. `rowHeight` defaults to 32 px (minimum 24);
`listWidth` defaults to 360 px (minimum 160). Row labels are single-line and truncated.

## Data and customization

- Timestamps are Unix milliseconds, including zero. An omitted `end` means the interval
  is ongoing, regardless of its status. Without an interval, the parent extent is derived
  from its stages; without either, the item remains in the list without a bar.
- Item IDs must be unique; stage IDs must be unique within their item. Input order is
  preserved. Invalid timestamps, reversed intervals and duplicate IDs produce a localized
  error state and report technical details through `onError`.
- Status IDs are arbitrary strings. `statuses` supplies labels, optional icons and colors.
  Unknown statuses use their ID and a neutral color. Missing statuses display a dash.
- Stage colors accept ordinary CSS colors or whole-value CSS variables. Without a stage
  color, tones of the parent status color distinguish stages. Gaps and overlaps retain
  their actual time coordinates; overlapping segments follow array drawing order.
- `progress.fraction` takes precedence over `completed / total`; values are clamped to 0–1.
- `renderItemLabel`, `renderItemStatus` and `renderEventPopup` receive
  `{item, stage?, defaultContent}`. `data` remains opaque and is returned unchanged.
- `href` makes the parent label a link. `onItemClick` receives the original item and React
  mouse event; `onEventClick` receives `{item, stage?}`. The default actionable labels also
  expose event actions to keyboard users.
- `formatDuration(milliseconds)` customizes duration strings; `timeZone` changes date
  formatting without changing timestamps. The default duration format is `HH:mm:ss`,
  or milliseconds for subsecond intervals.

## Range, live updates and state

The initial range is `range`, then `defaultRange`, then `bounds`, then the data extent.
`range` with `onRangeChange` supports controlled use. Without `range`, the module stores
the viewport internally. All ranges use `{from, to}` in milliseconds. The supported viewport
duration is 1 second to 15 years, with millisecond alignment; short ranges are centered and
expanded to one second.

“Fit all” uses `bounds` or the entire data extent, even when rows are filtered. “Fit interval”
adds 500 ms on each side. Filtering and incoming data do not reset the viewport. The toolbar
owns zoom buttons so the date ruler and canvas retain exactly the same horizontal scale.

When `now` is omitted, open intervals update every second. Supply `now` for external clocks
or deterministic snapshots. `active={false}` suspends the timer and destroys the canvas,
while preserving the filters, expanded IDs, selection, viewport and scroll position.
To reset the complete state for a different execution, change the React `key`.

Name search matches parent labels. Status counts describe all parent items; stages do not
increment them. Expand/collapse all affects only filtered items. Both the DOM and canvas
use a shared virtual window with ten extra rows on either side.

`showSearch`, `showStatusFilter` and `showRangeSelector` default to `true`.
`loading`, `errorContent` and `emptyContent` customize loading/error/empty scenarios.

## QueryProgress integration

Pass `timelineProps` alongside the existing `graphProps` to `QueryProgress`. The two views
retain independent state when switching tabs. Omitting `timelineProps` shows an empty
timeline, preserving compatibility with graph-only consumers. The application supplies
the timeline model independently of the graph; no backend adapter is included.

## Compatibility

This module uses `@gravity-ui/timeline` 1.32.2 and requires UIKit 7.18.0 or newer within the
Timeline package's supported peer range. QueriesKit's minimum UIKit version is now 7.18.0.
`@gravity-ui/date-utils` is a runtime dependency. `lodash` is declared explicitly because
Timeline 1.32.2 imports it but does not list it among its runtime dependencies.
