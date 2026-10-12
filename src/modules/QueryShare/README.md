# QueryShare

A controlled dialog for generating and sharing public query links. Import it from
`@gravity-ui/querieskit/modules/QueryShare`, or enable the built-in QueryEditor
button with `shareProps` (the same props except `open` and `onClose`).

```tsx
import {QueryShare} from '@gravity-ui/querieskit/modules/QueryShare';

<QueryShare
  open={shareOpen}
  onClose={() => setShareOpen(false)}
  link={link}
  onGenerate={generateLink}
  onRegenerate={regenerateLink}
  onMakePermanent={makeLinkPermanent}
  onExpirationChange={updateExpiration}
  pendingAction={pendingAction}
  error={error}
/>;
```

The consuming application generates, stores and updates `link`, and controls
`pendingAction` and `error`. Callbacks signal user intent and return no data.
The module performs no network requests and does not automatically copy links.

| Prop                 | Meaning                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `open`, `onClose`    | Controlled visibility; close button, Escape and backdrop dismiss the dialog.                                                |
| `link`               | Optional `{url, expiresAt}`. Omit to show the generate action.                                                              |
| `onGenerate`         | Generate the first public link.                                                                                             |
| `onRegenerate`       | Replace the existing link.                                                                                                  |
| `onMakePermanent`    | Replace the temporary link with a permanent link.                                                                           |
| `onExpirationChange` | Persist the selected expiration timestamp in milliseconds.                                                                  |
| `pendingAction`      | `generate`, `regenerate`, `makePermanent` or `updateExpiration`; blocks mutations and shows the matching loading indicator. |
| `error`              | Application error displayed in the dialog.                                                                                  |
| `className`          | Additional class on the dialog content wrapper.                                                                             |

`expiresAt` is a Unix timestamp in milliseconds, displayed as `DD.MM.YYYY HH:mm`
in the browser's local timezone. Use `null` for a permanent link: expiration editing
and permanent-link creation are then hidden. Copying and regeneration remain available.
While an action is pending, copying and closing are still available.
Clipboard success uses the UIKit animation and tooltip; failure is announced in the dialog.

Update `link` after successful operations. Updated values appear even while the
dialog is open. Clear `pendingAction` after completion and clear stale application
errors when starting a new operation. The module owns its styles and English/Russian
translations; it inherits the host's Gravity UI theme.

Click the expiration pencil to replace the date with a Gravity UI date and time picker.
Changes stay local until Save is clicked; Cancel discards the draft. Saving calls
`onExpirationChange(expiresAt)` and returns to the date display. The application must
persist the change and supply an updated `link`; use `pendingAction="updateExpiration"`
while saving. The picker uses the browser's local timezone.

When choosing a non-English calendar locale, preload it before rendering, for example
`await settings.loadLocale('ru')` with `settings` from `@gravity-ui/date-utils`.
The picker follows the host UIKit language configured with `configure({lang: 'ru'})`.
