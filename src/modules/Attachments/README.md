# Attachments

`Attachments` displays files and links and proposes changes through `onChange`. Applications own contents, uploads and persistence. Existing calls retain their behavior: creating an empty item emits `isNew: true`, Apply emits the saved item, and Cancel removes drafts. Do not persist `isNew` items as completed files.

## Controlled extended model

```tsx
import {Attachments} from '@gravity-ui/querieskit/modules/Attachments';
import type {AttachItem, AttachmentsProps} from '@gravity-ui/querieskit';

type AppAttachment = AttachItem & {content: string};
const [value, setValue] = React.useState({
  attachments: [] as AppAttachment[],
  deletedAttachments: [] as AppAttachment[],
});
const props: AttachmentsProps<AppAttachment> = {
  ...value,
  createAttachment: (draft) => ({...draft, content: ''}),
  onChange: setValue,
  onSelectFile: async (file) => ({
    id: crypto.randomUUID(),
    name: file.name,
    content: await file.text(), // File I/O belongs to the application.
  }),
  tokenRequired: false,
  validateDuplicates: true,
};
return <Attachments<AppAttachment> key={documentId} {...props} />;
```

The factory is required when the model adds required fields. It creates complete objects for empty file/link drafts; the library preserves generated draft identity and editable initial values. Rename patches the original object; delete and restore move it without losing extra fields. Generic `AttachmentList` callbacks also retain application fields.

Use a document-specific React `key` when replacing the document. This discards pending edits and local processing UI and ignores completion of old file requests. Closing a panel for the same document can preserve its draft by keeping the component mounted. Changing the array identity alone does not reset editing. Controlled arrays remain the source of truth; requests propose changes, and the parent decides whether to accept them.

## Validation and local files

- `nameValidator` and `linkValidator` override the existing editor validators. Return an error string or error object, or `null` for success. Validation errors keep the draft open. Include required-field checks in custom validators when needed.
- `validateDuplicates` defaults to `false`; when enabled, it checks exact case-sensitive names among current saved attachments, excluding the edited row. Deleted items are excluded. It validates edit confirmations, local file results, and Restore. A conflicting Restore leaves the item in Deleted, shows an error, and does not call `onChange`; restoring can be retried after resolving the conflict.
- `tokenRequired` defaults to the legacy behavior: required when `tokens` is nonempty. Set `false` to permit links without a token even when choices exist.
- Supplying `onSelectFile` adds “Choose local file” and distinguishes it from “Create empty file” and “Link”. It receives the browser `File` and returns a Promise for a complete attachment. The library never reads or uploads the file.
- While pending, another file action is blocked. Success appends the returned object to the latest controlled lists, removing `isNew`. Duplicate IDs (including deleted items) and invalid returned names produce an error instead of inserting an item.
- Rejection keeps the selected `File` for explicit retry; retry calls the handler again with that same file. Returned-model validation errors also allow retry, so upload handlers should support retries/idempotency. User-facing error messages may be provided through `Error.message`.
- Unmount prevents a late result from changing lists; it does not cancel application network requests. The application owns cancellation if needed.

`onItemClick` continues to open the application's content editor. Row actions have accessible names, remain focusable without hover, and do not trigger the row click handler.
