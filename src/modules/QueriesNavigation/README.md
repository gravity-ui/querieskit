# QueriesNavigation

`QueriesNavigation` renders application-owned clusters, items, locations and detail panels.
Data loading, favorites, copying and persistence stay in the application.

## Standard row extensions

Use `getItemRowConfig(item)` to configure standard rows without replacing their renderer.
The resolver receives the original generic item, including application metadata. It is never
called for the synthetic parent row. Optional `description` uses a 48px row; rows without a
nonempty description keep their 32px height. `indicators` accepts passive badges or status
content; put interactive controls in `actions`, `menuActions`, or `menuActionGroups` instead.

```tsx
import React, {useState} from 'react';
import {QueriesNavigation} from '@gravity-ui/querieskit';

export function Browser() {
  const [location, setLocation] = useState({cluster: 'main', path: '/documents'});
  const [items, setItems] = useState([
    {path: '/documents/report', title: 'Report', target: '/archive/report', favorite: false},
  ]);

  return (
    <QueriesNavigation
      location={location}
      onUpdate={(next) => setLocation({cluster: next.cluster ?? 'main', path: next.path ?? '/'})}
      items={items}
      getItemRowConfig={(item) => ({
        description: item.target,
        indicators: item.favorite ? <span aria-label="Favorite">★</span> : null,
        actions: [
          {
            id: 'favorite',
            title: item.favorite ? 'Remove from favorites' : 'Add to favorites',
            content: item.favorite ? '★' : '☆',
            onClick: (original) =>
              setItems((current) =>
                current.map((value) =>
                  value.path === original.path ? {...value, favorite: !value.favorite} : value,
                ),
              ),
          },
        ],
        menuActions: [
          {
            id: 'copy',
            title: 'Copy path',
            content: '⧉',
            onClick: (original) => {
              void navigator.clipboard.writeText(original.path);
            },
          },
        ],
      })}
    />
  );
}
```

Both action collections reuse `NavigationAction<T>` (`id`, `title`, `content`, `onClick`,
optional `hidden`, `disabled`, `qa`). Hidden actions are omitted. A disabled item also disables
its controls. By default, the actions area appears on row hover and remains visible while its
menu is open. Keyboard focus also reveals the controls, and devices without hover keep them
visible. Set `actionsVisibility: 'always'` to keep actions visible on every device. Hidden
controls retain their layout space, so revealing them does not move the row title. Action and
menu events do not activate the row. Action titles supply accessible names. Long titles and descriptions
truncate while controls retain their space. Keep the primary action set small for narrow panels;
move remaining actions to `menuActions` or `menuActionGroups`.

`menuActionGroups` adds named groups to the standard menu. Each group has `id`, optional
`title`, and `actions: NavigationAction<T>[]`. Plain `menuActions` appear first, followed by
the groups. Hidden actions and empty groups are omitted. The application supplies translated
titles and callbacks; the menu does not interpret engines, paths, or query syntax.

```tsx
getItemRowConfig={(item) => ({
  menuActionGroups: [
    {id: 'copy', title: t('action_copy'), actions: getCopyActions(item)},
    {id: 'insert', title: t('action_insert'), actions: getInsertActions(item)},
  ],
})}
```

The standard menu automatically keeps the row actions visible while open. For a custom menu,
set `actionsMenuOpen` to its current open state. With multiple custom menus, pass the logical
OR of their open states.

Use `renderMenuTrigger({item, disabled})` to replace only the additional-actions menu while
keeping standard `actions`. The renderer receives the original typed item and a boolean
disabled state. It takes precedence over `menuActions` and `menuActionGroups`, even when it returns `null`.

```tsx
import React, {useState} from 'react';
import {NavigationActionsMenu, NavigationItemRow} from '@gravity-ui/querieskit';

function ApplicationRow({item}) {
  const [open, setOpen] = useState(false);

  return (
    <NavigationItemRow
      item={item}
      actions={getInlineActions(item)}
      actionsMenuOpen={open}
      renderMenuTrigger={({item: original, disabled}) => (
        <NavigationActionsMenu
          arg={original}
          disabled={disabled}
          groups={getActionGroups(original)}
          open={open}
          onOpenToggle={setOpen}
        />
      )}
    />
  );
}
```

The trigger shares the non-shrinking actions area. Mouse, pointer and keyboard events from
this area, including React portals rendered by the custom menu, do not activate the row.
The application must apply `disabled` and accessible names to its controls. Nested menus,
action availability, open state and confirmation dialogs remain application-owned.

The same config fields are available directly on `NavigationItemRow<T>`, and the resolver is
also available on `NavigationItemsList<T>`. Existing `renderNavigationItem` / `renderRowItem`
remain full row renderers: a non-null result takes precedence over the standard row; `null`
retains the standard fallback. Custom renderers are responsible for matching configured height.

## Additional header menu trigger

`header.renderMenuTrigger({location, actions})` inserts custom content alongside standard
header buttons. Return a keyboard-accessible menu trigger (for example a UIKit `DropdownMenu`).
The context follows the current header, including the opened item's location and merged detail
actions. The slot is also available on `NavigationHeader` and `NavigationDetail`.

`header.renderActions` keeps its existing full-replacement semantics and takes precedence over
`renderMenuTrigger`, including when it returns `null`. Without the new optional props,
the header keeps its standard action buttons.

## Shared actions menu

`NavigationActionsMenu<T>` can also be used independently or in the header. Pass `arg` and
ready-made `actions` and/or `groups`; callbacks receive the original argument. The component
provides grouping, hidden/disabled handling, an accessible default trigger, and optional
controlled state through `open` / `onOpenToggle`. `size`, `className`, and `renderSwitcher`
allow presentation customization. A custom switcher must forward the supplied props and
provide its own accessible name.

```tsx
header={{
  renderMenuTrigger: ({location}) => (
    <NavigationActionsMenu
      arg={location}
      groups={getLocationActionGroups(location)}
    />
  ),
}}
```

Groups are presentational: formatting a path, generating SQL, inserting text into an editor,
creating queries, and confirming unsaved changes remain application responsibilities. No
engine registry or engine-specific data is required by the shared menu.

## Compose table detail tabs

`createTableDetailConfig()` still creates `schema`, `preview`, `meta`, and `view`,
in that order, with `schema` selected initially. The existing data resolvers and
`renderMeta` continue to work without migration.

Supply `tabs` to select and order standard tabs, replace individual contents, or
include custom tabs. A string keeps the standard renderer and translated title.
An object with a standard ID overrides only the supplied properties. A custom ID
requires a title and uses the existing `NavigationDetailTab` contract.

```tsx
import {createTableDetailConfig} from '@gravity-ui/querieskit/modules/QueriesNavigation';

const resolve = createTableDetailConfig<Table>({
  resolveMeta: (table) => table.metadata,
  tabs: (table) => [
    'meta',
    {id: 'schema', content: <ApplicationSchema table={table} />},
    {
      id: 'preview',
      renderContent: ({search, onSearchUpdate}) => (
        <ApplicationPreview table={table} search={search} onSearchUpdate={onSearchUpdate} />
      ),
    },
    {id: 'activity', title: 'Activity', content: <TableActivity table={table} />},
  ],
});
```

Here metadata retains its standard implementation, schema and preview use application
components, and `view` is excluded. `Table` is the application's type extending
`NavigationItem`; loading and actions stay in those application components.
The callback receives the current typed item each time the factory resolves a table.
For content that does not depend on the item, pass a readonly array directly instead.

An explicitly supplied `content` (including `null`) removes the standard renderer.
An explicit `renderContent` uses the normal navigation render context and takes
precedence over `content`, with `content` as the existing nullish-result fallback.
A title-only override retains the standard renderer. Keep IDs unique.

With explicit `tabs`, the first visible, enabled tab is the default. An empty array
produces no tabs, and a list with no selectable tabs has no default. Omitting `tabs`
preserves the previous configuration. `hasSearch` remains `false`; use the resulting
standard `NavigationDetailConfig` to enable shared search or supply controlled search
through the detail panel. Arbitrary `NavigationDetailConfig` objects remain supported
without this preset.
