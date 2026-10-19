# QueriesVcs

Controlled VCS navigation for VCS provider, optional repository, branch and folder selection, with optional file previews. Use it directly or as a `vcs` tab in `QueriesSidebar`; `QueryPage` accepts the same configuration through `sidebarProps`.

```tsx
import {QueriesVcs, type VcsItem, type VcsLocation} from '@gravity-ui/querieskit';

// Values and callbacks below belong to the application.
<QueriesVcs
  location={location}
  onUpdate={setLocation}
  providers={{items: [{id: 'github', title: 'GitHub'}]}}
  repositories={{items: [
    {id: 'analytics', title: 'Analytics'},
    {id: 'reporting', title: 'Reporting'},
  ]}}
  branches={{items: [{id: 'main', title: 'main'}]}}
  items={items}
  listState={{loaded: true}}
  detail={{openedFile, content, onOpen: setOpenedFile, onClose: closeFile}}
/>;
```

The application owns credentials, network requests, filtering, sorting, persistence and query editing. Paths are absolute within the repository, with `/` as the root. `VcsItem.kind` is `folder` or `file`; additional fields are preserved by the generic props contract.

## Repository selection and controlled navigation

The standard header orders selectors as provider → repository → branch. Pass the optional `repositories: VcsSelectorConfig` (`items`, `loading`, `error`) to enable repository selection; its value is `location.repositoryId`. Without `repositories`, existing behavior is unchanged, including an application-supplied `repositoryId`.

The repository selector appears only when `repositories.items.length > 1`, counting disabled options. For zero or one item it stays hidden, including when the sole repository has not been selected. **The application must choose a sole repository** by updating `location`; the component never selects or corrects controlled values automatically. Loading and errors remain visible even when the selector is hidden. After a provider is selected, a successfully loaded empty repository list displays “No repositories”.

Repository selection is disabled until a provider is chosen and while providers or repositories are loading or have errors. With `repositories` supplied, branch selection and browser content additionally require a selected repository and a nonempty repository list without loading or errors.

The standard header emits these exact location shapes through `onUpdate`:

| Selection | Next location |
| --- | --- |
| Provider | `{providerId, path: '/'}` |
| Repository | `{providerId: location.providerId, repositoryId, path: '/'}` |
| Branch | `{...location, branch, path: '/'}` |

A changed selection requests closing the preview before calling `onUpdate`; selecting the current value does nothing. The application stores the new location, loads dependent options and may select a default branch. Stale previews from another provider, repository, branch or directory are hidden. File-list items have no context metadata, so the application must clear them and reset `listState.loaded` when changing context.

`detail.openedFile` contains `{item, location}`. Preserve the context received by `detail.onOpen`; the file's full path is `item.path`, while `location.path` identifies the containing directory. An empty `detail.content` string is a valid file. The default preview loads a read-only Monaco editor lazily, with `plaintext` as the default language. Provide separate selector, list and detail loading/error states.

## Asynchronous loading

The selectors are available before repository data arrives. The path, filter and file list first appear after provider and branch (and repository, when `repositories` is supplied) are selected, the required selectors are ready without loading or errors, and `listState.loaded` is `true`. After that, directory loading preserves the path and filter and replaces only the list. Omitted `loaded` means `false`; an empty `items` array alone does not indicate a completed request.

1. On provider selection, synchronously clear repository options, branch options, file items and preview, and reset `listState.loaded: false`. Set `repositories.loading: true` and fetch repositories. Supply the new options and clear loading on success; use `repositories.error` on failure. If there is one repository, select it in application state. Without `repositories`, fetch branches directly instead.
2. On repository selection, synchronously clear branch options, items and preview, reset `loaded: false`, and set `branches.loading: true` while fetching branches. Supply the options and clear loading on success, or use `branches.error` on failure. The application may choose a default branch.
3. On branch selection, clear file items, reset `loaded: false`, set `listState.loading: true` and fetch the directory. Set `loaded: true` and clear loading only after a successful response, including an empty response. On failure, keep `loaded: false` and provide `listState.error`.
4. Reset `loaded: false` for each provider, repository, branch or path change before starting the next directory request. Cancel previous requests or ignore responses whose full location no longer matches, including repository/branch-option requests and file previews. Invalidate outstanding requests synchronously in the navigation handler so they cannot publish stale results before effect cleanup. Keep `loaded: true` with `loading: true` only when loading more items for the same directory, so the existing list stays visible.

The `AsyncLoading` story demonstrates the complete provider → repositories → branches → files sequence with an 800 ms delay per request, synchronous dependent-state resets and obsolete-response guards at every stage. GitLab has a sole repository which the example application selects automatically. The other stories use already available data and explicitly set `listState.loaded: true`.

## Customization

- `renderItemIcon({item, location, view})` replaces icons in list rows and the standard preview header. Returning `null` hides an icon. Otherwise the default uses `item.icon` or the item kind.
- `renderRowItem` replaces the row contents while retaining selection and virtualization. It receives only application items, never the synthetic parent-folder row.
- `detail.renderContent` replaces the complete preview, including its header. It receives file metadata, content, loading/error states, actions and `onClose`.
- `renderHeader` replaces the selector header. It receives `providers`, optional `repositories`, `branches`, `location` and navigation callbacks. The custom renderer controls visibility and dependent-selector rules; use the reset shapes above when changing selections. Its `onUpdate` callback supports controlled navigation; `header.actions` adds actions to the standard header.
- `onInsertFile`, `onAttachFile` and `item.sourceUrl` enable standard file actions. `getFileActions` replaces the standard action set. The library never writes to the application's query editor.
- `onPathSubmit` receives a manually entered path. Resolve its kind in the application; a failed file request must not be treated as evidence that the path is a folder. `onLoadSuggestions` optionally supplies path suggestions.

```tsx
<QueriesSidebar tabs={[{id: 'repository', type: 'vcs', props: vcsProps}]} keepMounted />
```

The tab is optional and is present only when supplied in `tabs`. All props, including custom item metadata and renderers, remain available through `QueryPage.sidebarProps`.

After the first successful response in a branch, directory navigation keeps the path and filter visible while replacing the list with a loading indicator (or an error). Switching the VCS provider, repository context or branch resets this readiness and hides navigation until the first successful response.
