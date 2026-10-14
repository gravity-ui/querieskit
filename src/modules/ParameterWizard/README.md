# ParameterWizard

Controlled editor for one typed query parameter. It has no dependency on the YQL
application, query context, network APIs, persistence, or query execution events.
It belongs to the **modules** level because it composes a recursive editing
scenario; its editors are internal implementation details.

```tsx
import React, {useState} from 'react';
import {ParameterWizard} from '@gravity-ui/querieskit';
import type {ParameterValue} from '@gravity-ui/querieskit';

const savedValue = ['42'];

export function Parameter() {
  const [value, setValue] = useState<ParameterValue>(savedValue);
  const [valid, setValid] = useState(false);

  return (
    <ParameterWizard
      name="$limit"
      type={{name: 'Uint64', optional: true}}
      value={value}
      onChange={setValue}
      onReset={() => setValue(savedValue)}
      onValidationChange={setValid}
    />
  );
}
```

The host application uses `valid` to gate its own submit/save action. No callbacks
are fired to initialize or normalize values on mount. `onValidationChange` reports
validity on mount and when it changes.

## API

- `name`, `type`, `value`, `onChange`: controlled parameter identity, parsed type,
  restricted JSON value and change callback. `undefined` denotes an unfilled value.
- `onReset`: optional action; the caller restores its saved value. Local input
  drafts are discarded even when the saved value equals the current value.
- `onDelete`: optional action; the caller removes the parameter.
- `resetDisabled`, `disabled`, `readOnly`, `className`: action state and integration.
  Read-only mode still allows inspecting containers and switching display modes.
- `onValidationChange`: includes incomplete nested fields and invalid local drafts.
  Invalid text stays visible with an error and does not overwrite the controlled
  value. Accept emitted values synchronously in `onChange`; persistence can run
  separately. Changing `value` externally refreshes the editor. Use a React `key`
  when replacing an entire editing session with the same value.

## Type and value contracts

`ParameterType`, `ParameterTypeMember`, `ParameterPrimitiveTypeName`,
`ParameterValue` and `ParameterWizardProps` are public exports from `src/types`.
The type descriptor follows the original wizard's parsed type shape, without
imports from YQL models. Parsing SQL declarations or backend type arrays remains
in the host application.

Values follow the [restricted JSON format](https://yql.yandex-team.ru/docs/types/json):

| Type                                        | Value                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| Int, Uint, Float, Double, Decimal, DyNumber | Strings, including 64-bit integers                                            |
| Bool                                        | Boolean                                                                       |
| Utf8                                        | String                                                                        |
| String and PostgreSQL                       | Text or a one-element base64 array; PostgreSQL also permits null              |
| Uuid                                        | One-element base64 array, edited as a canonical UUID                          |
| Date / Datetime / Timestamp                 | String containing days / seconds / microseconds since the epoch               |
| Interval                                    | String containing microseconds, edited as an ISO duration                     |
| Json, JsonDocument, Yson                    | JSON value; Yson uses its JSON representation with typed attributes           |
| List, Tuple                                 | Arrays                                                                        |
| Struct                                      | Object or positional array; editing preserves this choice                     |
| Dict                                        | Array of key/value pairs; string-key objects are accepted and edited as pairs |
| Set                                         | Dict with Void values: `[[key, "Void"]]`                                      |
| Enum                                        | String                                                                        |
| Variant                                     | `[[fieldName], value]` or `["index", value]`                                  |
| Optional                                    | `null` / `[]` or `[value]`; nested levels are selected independently          |
| Void, Null, EmptyList, EmptyDict            | Their singleton values                                                        |

Dates are edited in UTC; conversion uses bigint to preserve microseconds, including
negative timestamps and the extended date types. Tagged types retain their metadata
and use the underlying editor. Container rows can be expanded, added and removed.
Unknown types and incompatible incoming container shapes use the JSON editor.
JSON mode can also be enabled explicitly for container types. It uses Monaco Editor
with JSON syntax highlighting, line numbers, folding, and the current UI theme.
Invalid JSON remains a local draft until it matches the parameter type.

Validation covers the value representation, integer/date ranges, UUID/base64 and
Decimal precision/scale when supplied. PostgreSQL values, timezone identifiers,
Yson attributes and other backend-specific semantics remain the backend's
responsibility; this component does not replace server validation.

## Migration from the YQL container

Parse stored JSON before passing `value`, and serialize it in the host's persistence
layer. Replace `useParameterViewModel` with `value`/`onChange`, saved-state handling
with `onReset`, and `canDelete`/context deletion with `onDelete`. The widget emits
edits directly and does not listen to `SaveQueryAction`, `ValidateQueryAction` or
`ExecuteQueryAction`. Existing YQL source files are not modified.

See **Modules / ParameterWizard** in Storybook for interactive examples, including
nested containers, Optional levels, exact 64-bit values, binary/UUID, JSON/Yson,
invalid values, external updates, deletion, read-only/disabled mode and dark theme.
