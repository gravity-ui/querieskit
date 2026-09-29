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

Sections mount on their first visit, then remain mounted while hidden. Local
state and scroll are retained when switching sections or toggling `hideTabs`.
Removing an ID from `tabs` discards its mounted content. Application-controlled
state continues to follow the supplied props.

Hidden built-in sections pause automatic list pagination. Custom sections can
use `active` to pause their own fetching, subscriptions or timers. The sidebar
does not cancel requests already started by the application.

Visible navigation uses icon tabs with names and tooltips. With `hideTabs`, panels
become named regions without references to missing tabs; hidden content cannot
receive focus. Header and tabs stay above the scrollable content. Use `header`
for a shared product selector; section `logo` props remain available for standalone
usage and should not duplicate that shared header.

## Migration

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
