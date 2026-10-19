# QueriesVcs

Controlled VCS navigation for VCS provider, branch and folder selection, with optional file previews. Use it directly or as a `vcs` tab in `QueriesSidebar`; `QueryPage` accepts the same configuration through `sidebarProps`.

```tsx
import {QueriesVcs, type VcsItem, type VcsLocation} from '@gravity-ui/querieskit';

// Values and callbacks below belong to the application.
<QueriesVcs
  location={location}
  onUpdate={setLocation}
  providers={{items: [{id: 'github', title: 'GitHub'}]}}
  branches={{items: [{id: 'main', title: 'main'}]}}
  items={items}
  listState={{loaded: true}}
  detail={{openedFile, content, onOpen: setOpenedFile, onClose: closeFile}}
/>;
```

The application owns credentials, network requests, filtering, sorting, persistence and query editing. Paths are absolute within the repository, with `/` as the root. `VcsItem.kind` is `folder` or `file`; additional fields are preserved by the generic props contract.

The header has two selectors: VCS provider and branch. Repository context is supplied by the application through the optional `location.repositoryId`; it has no selector. Changing a provider clears the repository context and branch. Each selector change returns to `/` and requests closing the preview. The application chooses the initial selections and supplies the next controlled state. Stale previews from another location are hidden; cancel or ignore stale network responses in the application as well.

`detail.openedFile` contains `{item, location}`. Preserve the context received by `detail.onOpen`; the file's full path is `item.path`, while `location.path` identifies the containing directory. An empty `detail.content` string is a valid file. The default preview loads a read-only Monaco editor lazily, with `plaintext` as the default language. Provide separate selector, list and detail loading/error states.

## Asynchronous loading

The selectors are available before repository data arrives. The path, filter and file list first appear after both provider and branch are selected, neither selector is loading or has an error, and `listState.loaded` is `true`. After that, directory loading preserves the path and filter and replaces only the list. Omitted `loaded` means `false`; an empty `items` array alone does not indicate a completed request.

1. On provider selection, clear the previous branch options and set `branches.loading: true` while connecting and fetching branches. Supply the new options and clear loading on success; use `branches.error` on failure. Branch selection is disabled during loading or an error.
2. On branch selection, reset `listState.loaded: false`, set `listState.loading: true` and fetch the repository directory. Set `loaded: true` and clear loading only after a successful response, including a successful empty response. On failure, keep `loaded: false` and provide `listState.error`.
3. Reset `loaded: false` for each provider, branch or path change before starting the next directory request. Cancel previous requests or ignore responses whose location no longer matches. Keep `loaded: true` with `loading: true` only when loading more items for the same directory, so the existing list stays visible.

The `AsyncLoading` story demonstrates sequential branch and directory requests with an 800 ms delay and cancellation when the selection changes or the component unmounts. The other stories use already available data and explicitly set `listState.loaded: true`.

## Customization

- `renderItemIcon({item, location, view})` replaces icons in list rows and the standard preview header. Returning `null` hides an icon. Otherwise the default uses `item.icon` or the item kind.
- `renderRowItem` replaces the row contents while retaining selection and virtualization. It receives only application items, never the synthetic parent-folder row.
- `detail.renderContent` replaces the complete preview, including its header. It receives file metadata, content, loading/error states, actions and `onClose`.
- `renderHeader` replaces the selector header. Its `onUpdate` callback supports controlled navigation; `header.actions` adds actions to the standard header.
- `onInsertFile`, `onAttachFile` and `item.sourceUrl` enable standard file actions. `getFileActions` replaces the standard action set. The library never writes to the application's query editor.
- `onPathSubmit` receives a manually entered path. Resolve its kind in the application; a failed file request must not be treated as evidence that the path is a folder. `onLoadSuggestions` optionally supplies path suggestions.

```tsx
<QueriesSidebar tabs={[{id: 'repository', type: 'vcs', props: vcsProps}]} keepMounted />
```

The tab is optional and is present only when supplied in `tabs`. All props, including custom item metadata and renderers, remain available through `QueryPage.sidebarProps`.

After the first successful response in a branch, directory navigation keeps the path and filter visible while replacing the list with a loading indicator (or an error). Switching the VCS provider, repository context or branch resets this readiness and hides navigation until the first successful response.
