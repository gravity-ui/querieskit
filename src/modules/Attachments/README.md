# Attachments

`Attachments` edits committed files and links. Applications own contents, uploads, and persistence. Clicking Add creates a separate editor draft; only a validated Apply proposes a committed collection change. Cancel never changes committed data.

## Collections and drafts

Supply `attachments` and `deletedAttachments` to control committed collections. Omit them and optionally provide `defaultAttachments` / `defaultDeletedAttachments` for local state. Controlled arrays remain authoritative: `onChange` proposes a next value, and the parent decides whether to accept it. Do not switch a collection between controlled and uncontrolled modes after mounting.

Drafts are local by default. To persist unfinished text or detect unsaved edits, provide `drafts` and `onDraftsChange`, or observe `onDraftsChange` while leaving `drafts` omitted. `defaultDrafts` initializes local drafts. Each `AttachmentDraft` has `mode: 'create' | 'update'` and `value: {id, name, link?, token?}`. `value.id` is stable; updates refer to the committed item's ID. The callback includes every text edit, including edits of existing items, and draft removal on Apply or Cancel. Draft IDs must be unique; create IDs must not collide with either committed collection. Invalid identities are reported without replacing committed objects or rewriting controlled drafts. Drafts need not satisfy committed-item validation. An empty drafts array means no open edits; an existing draft may still match the committed value.

Use a document-specific React `key` when replacing the document. This discards local drafts and processing UI and ignores completion of old file requests. To restore drafts after a remount, save them in application state and pass them back. Changing collection identity does not reset edits. Draft state does not include browser `File` objects or pending upload state.

## Extended models and semantic changes

```tsx
import {Attachments} from '@gravity-ui/querieskit/modules/Attachments';
import type {
  AttachItem,
  AttachmentDraft,
  AttachmentsValue,
} from '@gravity-ui/querieskit/modules/Attachments';

type AppAttachment = AttachItem & {content: string};
const [value, setValue] = React.useState<AttachmentsValue<AppAttachment>>({
  attachments: [],
  deletedAttachments: [],
});
const [drafts, setDrafts] = React.useState<AttachmentDraft[]>([]);
return (
  <Attachments<AppAttachment>
    key={documentId}
    {...value}
    drafts={drafts}
    onDraftsChange={setDrafts}
    createAttachment={(input) => ({...input, content: ''})}
    onChange={(next, change) => {
      setValue(next);
      // change describes create, update, delete, restore, or delete-all.
    }}
    onSelectFile={async (file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      content: await file.text(),
    })}
    tokenRequired={false}
    validateDuplicates
  />
);
```

`createAttachment` is a synchronous factory required for models with required extension fields. It runs only after validated Apply on a new file/link; Add and Cancel never invoke it. Return a complete object. Generated identity and edited fields are preserved. Factory exceptions keep the draft open and display the error; Apply can be retried. Editing an existing item patches the latest committed object and preserves its extra fields; deleting and restoring move that object unchanged.

`onChange(next, change)` runs once per committed action. `change` is one of `{type: 'create', item}`, `{type: 'update', item, previous}`, `{type: 'delete', item}`, `{type: 'restore', item}`, or `{type: 'delete-all', items}`. It is a UI change proposal, not notification that remote persistence succeeded. Applications can use the full snapshot or the operation. Draft changes are reported separately. Apply closes its draft even when a controlled parent declines the collection proposal.

## Validation and local files

- `nameValidator` and `linkValidator` override editor validators. Return an error string or object, or `null` for success. Include required-field checks in custom validators. Invalid input stays open and does not call the factory or committed callback.
- `validateDuplicates` defaults to `false`. When enabled, exact case-sensitive names are compared against current committed attachments, excluding the edited item. Drafts and deleted items are excluded. A conflicting Restore remains in Deleted and displays an error.
- `tokenRequired` defaults to requiring a token when `tokens` is nonempty; use `false` to allow links without tokens.
- `onSelectFile` receives a browser `File` and returns a Promise for a complete committed object. The library never reads or uploads it. A pending operation blocks another file selection. Success proposes append to the latest lists; duplicate IDs (including deleted items and draft IDs) and invalid names show an error instead.
- Rejection retains the selected File for explicit retry. Retry invokes the handler again with the same File; applications own idempotency and network cancellation. Unmount ignores late completion without canceling the request.

`onItemClick` opens the application's content editor and receives the original committed object. Draft rows are edited locally and never sent to that callback.

## Migration

Remove `isNew` items from committed collections. Move persisted unfinished inputs to `drafts`, or let the component manage them. Creation factories now receive validated editor input on Apply instead of empty input on Add. `onChange` no longer fires for Add, typing, or Cancel; observe `onDraftsChange` for those interactions. Existing callbacks accepting only the next collection remain valid.
