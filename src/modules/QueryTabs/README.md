# QueryTabs

A controlled strip of query and comparison tabs. The application owns the items,
selection, and tab content. Items appear in their array order; IDs must be unique.

```tsx
import {useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import {QueryTabs, type QueryTabItem} from '@gravity-ui/querieskit';

function QueryWorkspace() {
  const [items, setItems] = useState<QueryTabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>();

  const addTab = () => {
    const item: QueryTabItem = {
      id: crypto.randomUUID(),
      title: 'New query',
      type: 'query',
      status: 'draft',
    };
    setItems((current) => [...current, item]);
    setActiveTab(item.id);
  };

  const closeTab = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;

    setItems(items.filter((item) => item.id !== id));
    if (activeTab === id) {
      setActiveTab(items[index + 1]?.id ?? items[index - 1]?.id);
    }
  };

  return (
    <QueryTabs
      items={items}
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
      onAddTab={addTab}
      onCloseTab={closeTab}
      actions={<Button onClick={() => console.log('Settings')}>Settings</Button>}
    />
  );
}
```

Query items use `type: 'query'` and the existing `QueryStatus`: `draft`, `running`,
`completed`, `failed`, or `aborted`. The optional `isModified` flag is independent
of execution status. On the active tab the red dot and close button appear side by side,
including on hover and focus. On inactive tabs the dot occupies the close-button position;
hovering or focusing reveals the close button. Draft tabs have no status icon.

Comparison items use `type: 'comparison'`, `id`, `leftTitle`, and `rightTitle`.
The two titles appear on either side of the comparison icon, followed by the close button:

```tsx
const comparison: QueryTabItem = {
  id: 'comparison-1',
  type: 'comparison',
  leftTitle: 'Original query',
  rightTitle: 'Updated query',
};
```

Each title truncates independently; the accessible name includes both full titles.

`onAddTab` and `onCloseTab(id)` request changes; they do not mutate the list or
choose a replacement tab. The example appends new tabs and activates them, and
selects the next tab (then the previous one) when closing the active tab. An app
can confirm unsaved changes before removing a tab. Closing the last tab is allowed.

Set `hideCloseOnLastTab` to hide the close button when there is exactly one item.
It defaults to `false` and applies to both query and comparison tabs. The modification
indicator stays visible, and adding a second tab restores the close buttons.

If `activeTab` is missing or does not match an item, the first tab is displayed
as selected without emitting `onActiveTabChange`.

`actions` accepts a `ReactNode` for the right-hand area. Each supplied button or
menu owns its event handlers; there is no shared action callback. `className`
allows parent-owned positioning. Tab content is rendered separately by the app.
