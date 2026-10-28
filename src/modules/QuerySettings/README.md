# QuerySettings

Controlled query settings form. The module has no engine-specific behavior: the application supplies custom controls, their values, localization and validation. Query name, Access and operation title are shown by default; query name and operation title are marked required.

```tsx
import React, {useState} from 'react';
import {Select} from '@gravity-ui/uikit';
import {
  FormField,
  QuerySettings,
  type QuerySettingsErrors,
  type QuerySettingsValue,
} from '@gravity-ui/querieskit';

type CustomSettings = {yqlVersion: string};
type Settings = QuerySettingsValue<CustomSettings>;

function validate(value: Settings): QuerySettingsErrors<CustomSettings> {
  return {
    fields: {
      queryName: value.queryName.trim() ? undefined : 'Enter a query name',
      ytOperationTitle: value.ytOperationTitle.trim() ? undefined : 'Enter an operation title',
    },
    custom: {
      yqlVersion: value.custom.yqlVersion ? undefined : 'Select a version',
    },
  };
}

export function SettingsForm() {
  const [value, setValue] = useState<Settings>({
    queryName: '',
    access: 'private',
    ytOperationTitle: '',
    tokenIds: [],
    attributes: [],
    custom: {yqlVersion: 'stable'},
  });
  const [showErrors, setShowErrors] = useState(false);

  return (
    <QuerySettings
      value={value}
      onChange={setValue}
      errors={showErrors ? validate(value) : undefined}
      onFieldBlur={() => setShowErrors(true)}
      tokens={[{id: 'analytics', title: 'Analytics'}]}
      renderCustomFields={({value, onChange, errors, onFieldBlur, disabled}) => (
        <FormField label="YQL version">
          <Select
            aria-label="YQL version"
            width="max"
            value={[value.custom.yqlVersion]}
            options={[{value: 'stable', content: 'Stable'}]}
            onUpdate={([yqlVersion]) => onChange({...value, custom: {...value.custom, yqlVersion}})}
            onBlur={() => onFieldBlur?.({section: 'custom', field: 'yqlVersion'})}
            disabled={disabled}
            validationState={errors?.custom?.yqlVersion ? 'invalid' : undefined}
            errorMessage={errors?.custom?.yqlVersion}
          />
        </FormField>
      )}
    />
  );
}
```

`renderCustomSections` renders standalone sections after Attributes using the same context as `renderCustomFields`.

`renderCustomFields` appears immediately after Query name. Use it for YQL version, another engine's fields, or application settings. The application decides what happens to custom values when its engine changes. Pass `disabled`, accessible names and custom error messages to custom controls explicitly.

## Props and changes

- `value`, `onChange(nextValue)` contain the complete state, including `custom`. General fields emit edits immediately. Attributes keep local drafts until Apply; Cancel discards a draft, and adding a row does not emit a change until Apply. Receiving new props does not emit changes.
- `tokens` provides selectable token IDs and display titles, not credentials. Omit it to hide the selector; pass `[]` for a visible disabled selector. Options may have `disabled: true`.
- `hiddenFields` accepts all standard field names, plus `'tokens'` (alias for `'tokenIds'`) and `'attributes'`. Hidden values are preserved and excluded from the General counter; custom fields are not counted.
- `disabled` disables standard edits. `className` positions the form within its parent.
- General and Attributes collapse independently. Attribute rows have stable `id` values; retain these when updating values or attaching server errors. Adding or editing a row focuses its key input. Enter applies the draft; Escape cancels it. Row actions appear on hover or keyboard focus and remain visible on touch devices. External updates to an edited attribute replace its draft; removing it also removes its editor. Unapplied drafts are discarded when the settings module unmounts.

## Validation and running queries

The module displays external errors and requires a nonblank attribute key before Apply. It does not prevent running a query. The application owns required-field checks, duplicate attribute keys, allowed values and server validation.

`QuerySettingsErrors<TCustom>` groups messages as follows:

```ts
const errors: QuerySettingsErrors<CustomSettings> = {
  fields: {queryName: 'Enter a query name'},
  attributes: {'row-id': {key: 'This key already exists'}},
  custom: {yqlVersion: 'This version is unavailable'},
};
```

`onFieldBlur` receives one of `{section: 'fields', field}`, `{section: 'attributes', id, field: 'key' | 'value'}`, or `{section: 'custom', field}`. The example reveals all validation errors after the first blur; use these references to track touched fields when per-field validation is preferred. Custom controls report their own blur events and render their own errors.

Before Run, validate the current complete value again, show the returned errors and execute only when no messages remain. For a closed editor panel, set `activePanel` to `'settings'` if validation fails. The `EditorIntegration` story demonstrates this flow, engine selection and scrolling through a long attribute list.

## QueryEditor integration

Keep settings state in the application so closing the panel cannot discard it:

```tsx
<QueryEditor
  {...editorProps}
  activePanel={activePanel}
  onActivePanelChange={setActivePanel}
  settingsProps={{value: settings, onChange: setSettings}}
/>
```

`QueryEditor` owns the panel title, close action and resize behavior. Its `onChange` continues to report query text only; the form's `onChange` reports settings. With `settingsProps`, the editor renders the selected engine’s `renderSettingsFields` after Query name, followed by the application’s `renderCustomFields`. Both receive the same controlled settings value and change callback. The engine context additionally includes `engineId` and `clusterId`.

Use `settings={<QuerySettings ... />}` for full manual composition instead; `settings` and `settingsProps` are mutually exclusive. QuerySettings itself remains engine-independent. See [the editor settings and built-in preset](../../widgets/QueryEditor/README.md#settings) for optional engine UI descriptions, application-supplied options and controlled form values.

## Protected attributes and validation

All extensions are opt-in. Existing callers retain immediate general-field changes and
attribute-only Apply/Cancel. Permissions default to allowed; global `disabled` takes precedence.
`validateAttribute(draft, attributes)` synchronously checks the candidate against the current
applied rows. Return `{key, value}` error messages to keep the editor open without emitting
`onChange`. These draft errors clear on editing or external row updates. Existing `errors`
remain display-only server/application errors. Validation before query execution remains the
application's responsibility.

`checkDuplicateAttributeKeys` compares exact, case-sensitive keys against other applied rows,
excluding the candidate's stable ID. It defaults to false for compatibility. It neither trims
stored keys nor modifies existing rows. Blank keys remain blocked independently.

```tsx
function ProtectedSettings({initial}: {initial: QuerySettingsValue}) {
  const [value, setValue] = useState(initial);
  return (
    <QuerySettings
      value={value}
      onChange={setValue}
      hiddenFields={['access']}
      renderCustomFields={({value, onChange, disabled}) => (
        <Select
          aria-label="Visibility"
          disabled={disabled}
          value={[value.access]}
          options={[
            {value: 'private', content: 'Private'},
            {value: 'everyone', content: 'Everyone'},
          ]}
          onUpdate={([access]) => {
            if (access === 'private' || access === 'everyone') onChange({...value, access});
          }}
        />
      )}
      getAttributePermissions={(row) => ({
        canEditKey: row.id !== 'owner',
        canRemove: row.id !== 'owner',
      })}
      checkDuplicateAttributeKeys
      validateAttribute={(draft) => (draft.value.trim() ? undefined : {value: 'Enter a value'})}
    />
  );
}
```

## Change metadata

`onChange(nextValue, change?)` still receives the complete next value. Standard controls also
provide `change.changes`, an array of operations:

- `{section: 'fields', field}` for a general field;
- `{section: 'custom', field}` for a custom field (built-in engine settings supply this);
- `{section: 'attributes', operation: 'add' | 'remove' | 'rename' | 'update-value', id}`.

An attribute Apply emits one callback; renaming its key and editing its value produces two
operations in that callback. Applying unchanged text reports an empty operation array.
Adding or cancelling an unapplied draft does not emit a callback. Receiving external values
does not emit a callback either. Attribute IDs are retained when keys change.

Custom renderers may pass the optional metadata explicitly:

```tsx
onChange({...value, custom: {...value.custom, warehouse}}, {
  changes: [{section: 'custom', field: 'warehouse'}],
});
```

Existing custom renderers can continue calling `onChange(nextValue)`. Their changes have no
metadata; consumers must keep a fallback if they use such renderers. The library does not
infer changes inside arbitrary custom objects.

## Typed attribute values

The default `QuerySettingsAttribute`, `QuerySettingsValue` and `QuerySettingsProps` retain
string attribute values. Supply the second `TValue` generic to the latter two to preserve
numbers, booleans or objects, and supply an `attributeCodec`. A codec is required for
non-string values; it is optional for the default string API.

```tsx
import type {
  QuerySettingsAttributeCodec,
  QuerySettingsValue,
} from '@gravity-ui/querieskit/modules/QuerySettings';

const codec: QuerySettingsAttributeCodec<number> = {
  format: String,
  parse: (text) => {
    const value = Number(text);
    return text.trim() && Number.isFinite(value)
      ? {value}
      : {error: 'Enter a finite number'};
  },
};

function NumericSettings({initial}: {initial: QuerySettingsValue<{}, number>}) {
  const [value, setValue] = useState(initial);
  return <QuerySettings value={value} onChange={setValue} attributeCodec={codec} />;
}
```

`format` produces the display/draft text; `parse` returns a typed value or a localized error
message. Return `{error}` for invalid input instead of throwing. Parsing happens on Apply
only when the text changed, or when adding an attribute. Renaming a key, or applying
unchanged text, preserves the original value and object identity without parsing. Errors
keep the draft open and prevent `onChange`; `validateAttribute` receives the successfully
parsed value. Backend validation and choosing a codec remain the application's responsibility.

New typed drafts have no raw value until parsing succeeds, so their permissions are checked
against that candidate on Apply. Existing rows use their committed value for permissions.
Duplicate checks, external errors, disabled state and external controlled updates work in
both modes. Updating an attribute externally replaces its text draft; unrelated updates
preserve it. The application still owns conversion between backend dictionaries and stable
attribute rows.

Typed values also pass through `QueryEditorProps<TCustom, TAttachment, TValue>` and the final
`TValue` parameter of `QueryPageProps`. `createBuiltinQueryEngines<TCustom, TValue>()` preserves
the same attribute type in its settings contexts. All new generic parameters default to string.
