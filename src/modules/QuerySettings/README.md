# QuerySettings

Controlled query settings form. The module has no engine-specific behavior: the application supplies custom controls, their values, localization and validation. Query name, Access and YT operation title are always shown; query name and operation title are marked required.

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

`renderCustomFields` appears immediately after Query name. Use it for YQL version, another engine's fields, or application settings. The application decides what happens to custom values when its engine changes. Pass `disabled`, accessible names and custom error messages to custom controls explicitly.

## Props and changes

- `value`, `onChange(nextValue)` contain the complete state, including `custom`. General fields emit edits immediately. Attributes keep local drafts until Apply; Cancel discards a draft, and adding a row does not emit a change until Apply. Receiving new props does not emit changes.
- `tokens` provides selectable token IDs and display titles, not credentials. Omit it to hide the selector; pass `[]` for a visible disabled selector. Options may have `disabled: true`.
- `hiddenFields` accepts `'tokens'` and `'attributes'`. Hidden values are preserved.
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

Before Run, validate the current complete value again, show the returned errors and execute only when no messages remain. For a closed editor panel, set `settingsOpen` to `true` if validation fails. The `EditorIntegration` story demonstrates this flow, engine selection and scrolling through a long attribute list.

## QueryEditor integration

Keep settings state in the application so closing the panel cannot discard it:

```tsx
<QueryEditor
  {...editorProps}
  settingsOpen={settingsOpen}
  onSettingsOpenChange={setSettingsOpen}
  settings={<QuerySettings value={settings} onChange={setSettings} />}
/>
```

`QueryEditor` owns the panel title, close action and resize behavior. Its `onChange` continues to report query text only; the form's `onChange` reports settings. Without a `settings` slot, the editor retains its existing empty panel.
