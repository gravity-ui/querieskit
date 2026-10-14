# QueriesSidebar

`QueriesSidebar` combines independently usable modules into an ordered sidebar.
The application owns data fetching, routing, search values and other controlled
section state. The widget owns section selection and layout.

```tsx
import {QueriesSidebar} from '@gravity-ui/querieskit/widgets/QueriesSidebar';
import type {QueriesSidebarTab} from '@gravity-ui/querieskit/widgets/QueriesSidebar';

const tabs: QueriesSidebarTab[] = [
  {id: 'history', type: 'history', props: historyProps},
  {id: 'saved', type: 'saved', props: savedProps},
  {id: 'navigation', type: 'navigation', props: navigationProps},
  {id: 'tutorials', type: 'tutorials', props: tutorialProps},
];

// The containing application supplies the sidebar's width and height.
<QueriesSidebar header={<ProductSelector />} tabs={tabs} defaultActiveTab="history" />;

// External navigation / router controls selection. No tab strip is rendered.
<QueriesSidebar header={<ProductSelector />} tabs={tabs} hideTabs activeTab={section} />;
```

## Props and selection

| Prop                | Behavior                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `tabs`              | Ordered array; omit sections that should not be available                                                 |
| `header`            | Optional React content above the tab strip, also shown with `hideTabs`                                    |
| `activeTab`         | Controlled selected ID; do not change between controlled and uncontrolled modes                           |
| `defaultActiveTab`  | Initial uncontrolled ID; defaults to the first enabled tab                                                |
| `onActiveTabChange` | User selection requests, or uncontrolled fallback changes; never echoes prop updates or initial selection |
| `hideTabs`          | Defaults to `false`; hides only the tab strip, without resetting content                                  |
| `keepMounted`      | Defaults to `false`; set to `true` to preserve visited contents while inactive                            |
| `className`         | External layout class on the root                                                                         |

IDs must be non-empty, unique and stable. Keep a tab's type stable as well.
Invalid IDs are skipped, with development warnings. If selection is unavailable,
the first enabled tab is displayed; an empty or entirely disabled set displays
no content. In controlled mode this fallback does not rewrite application state.

Built-in types are `history`, `saved`, `navigation` and `tutorials`; their `props`
use the corresponding module contract. Titles and icons are localized defaults.
The widget and tab types accept generic row types in the order history, saved,
navigation item, navigation cluster, tutorial.

A `custom` tab has `id`, `title` (a string accessible name), `icon` (React content)
and `renderContent({active})`. All tab types accept `disabled`.

## State and accessibility

By default, only the active section's contents are mounted. Switching sections
unmounts the previous contents, runs effect cleanup and resets their local state.
Panel containers may remain in the DOM. This also applies to custom sections and
external `activeTab` updates. `hideTabs` only controls the tab strip and does not
change the content lifecycle.

With `keepMounted={true}`, sections mount on their first visit and remain mounted
while hidden, preserving local state and scroll. Hidden built-in sections pause
automatic list pagination; custom sections can use `active` to pause their own
fetching, subscriptions or timers.

Changing `keepMounted` to `false` immediately unmounts inactive contents. Changing
it back to `true` preserves the active contents and retains subsequent visits;
it does not remount previously discarded inactive contents. Removing a tab
always discards its contents. Application-controlled state follows supplied props.

## Loading and polling inside custom sections

The option controls only panel contents. Hooks called above `QueriesSidebar` to
prepare `tab.props` continue running even when a panel unmounts. Put loading,
delayed search and polling hooks inside a component adapter returned by
`custom.renderContent`. Do not call hooks directly inside `renderContent`.

```tsx
import {useEffect, useState} from 'react';
import {QueriesHistory} from '@gravity-ui/querieskit/modules/QueriesHistory';
import {QueriesSidebar} from '@gravity-ui/querieskit/widgets/QueriesSidebar';
import type {QueriesHistoryProps} from '@gravity-ui/querieskit';

type HistoryItems = QueriesHistoryProps['items'];

function HistoryAdapter({
  loadHistory,
}: {
  loadHistory: (signal: AbortSignal, query: string) => Promise<HistoryItems>;
}) {
  const [items, setItems] = useState<HistoryItems>([]);
  const [search, setSearch] = useState({value: '', fullSearch: false});

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function refresh() {
      try {
        const nextItems = await loadHistory(controller.signal, search.value);
        if (!controller.signal.aborted) setItems(nextItems);
      } catch (error) {
        if (!controller.signal.aborted) console.error(error);
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 5000);
      }
    }

    void refresh();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [loadHistory, search.value]);

  return <QueriesHistory items={items} search={{...search, onUpdate: setSearch}} />;
}

// loadHistory is a stable application-provided loader accepting an AbortSignal.
<QueriesSidebar
  keepMounted={false}
  tabs={[
    {
      id: 'history',
      type: 'custom',
      title: 'History',
      icon: null,
      renderContent: () => <HistoryAdapter loadHistory={loadHistory} />,
    },
    // Other sections use their own adapters in the same way.
  ]}
/>;
```

Cleanup must cancel pending work or ignore stale results. Unmounting alone does
not cancel a request already started by the application.

Visible navigation uses icon tabs with names and tooltips. With `hideTabs`, panels
become named regions without references to missing tabs; hidden content cannot
receive focus. Header and tabs stay above the scrollable content. Use `header`
for a shared product selector; section `logo` props remain available for standalone
usage and should not duplicate that shared header.

## Migration

**Changed default:** inactive section contents now unmount. Add
`keepMounted={true}` to preserve the previous lazy-mount-and-retain behavior.
Without it, returning to a section resets local state and restarts its effects.


`QueriesHistory`, `SavedQueries`, `QueriesNavigation`, `TutorialsHistory` now live
in `src/modules` and are published at `@gravity-ui/querieskit/modules/<Name>`.
Their names, props, helpers and root exports are preserved. The previous explicit
`@gravity-ui/querieskit/widgets/<Name>` entrypoints remain compatibility aliases
to the same module files through `package.json`; no widget wrappers remain.

Direct physical imports such as `@gravity-ui/querieskit/build/esm/widgets/<Name>`
must migrate to the new public module entrypoints. Prefer these entrypoints for
standalone sections: they do not import `QueriesSidebar` or unrelated sections.
The combined sidebar includes all four built-in renderers in its dependency graph.

History places its visible-fields selector next to the search input. Saved queries
always display the available date, engine and author metadata; `SavedQueriesProps`
no longer accepts `visibleFields`. Remove that prop from saved-section configs.
