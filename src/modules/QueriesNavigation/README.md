# QueriesNavigation

`QueriesNavigation` renders application-owned clusters, items, locations and detail panels.
Data loading, favorites, copying and persistence stay in the application.

## Standard row extensions

Use `getItemRowConfig(item)` to configure standard rows without replacing their renderer.
The resolver receives the original generic item, including application metadata. It is never
called for the synthetic parent row. Optional `description` uses a 48px row; rows without a
nonempty description keep their 32px height. `indicators` accepts passive badges or status
content; put interactive controls in `actions` or `menuActions` instead.

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
its controls. Controls stay visible for keyboard and touch access; action and menu events do
not activate the row. Action titles supply accessible names. Long titles and descriptions
truncate while controls retain their space. Keep the primary action set small for narrow panels;
move remaining actions to `menuActions`.

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
existing header and row behavior remains unchanged.
