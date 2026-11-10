# SimpleForm

A small form renderer with built-in `select`, `switch`, `rangeDatePicker` and
`checkboxGroup` fields. Import the component and its field types through public
entrypoints; built-in field types need no component side-effect imports.

```tsx
import {SimpleForm} from '@gravity-ui/querieskit/components/SimpleForm';
import type {FormField} from '@gravity-ui/querieskit/components/SimpleForm';

const fields: FormField[] = [
  {id: 'mine', type: 'switch', initialValue: false},
  {id: 'engine', type: 'select', options: [{value: 'sql', content: 'SQL'}]},
  {id: 'period', type: 'rangeDatePicker', initialValue: {start: null, end: null}},
  {id: 'states', type: 'checkboxGroup', items: [{id: 'completed', title: 'Completed'}]},
];

<SimpleForm fields={fields} values={values} onValuesChange={setValues} />;
```

At the package root, use `SimpleFormField` for the field descriptor type. The root
name `FormField` remains the separate React field-layout component.

```ts
import type {SimpleFormField, SelectFieldProps} from '@gravity-ui/querieskit';
```

Descriptors are a discriminated union: `type: 'select'` requires `options`,
`checkboxGroup` requires `items`, and `initialValue` follows the corresponding
field value type. The aggregate `FormValues` remains `Record<string, unknown>`;
SimpleForm does not infer a schema from field IDs. Omit `values` to use internal
state initialized from `initialValues` and field defaults.

## Custom field registration

Augment the public `FormFieldPropsRegistry` and register the component once before
rendering a form that uses it. The registry is the same interface through both the
root and the SimpleForm entrypoint; augment one of them.

```tsx
import {registerFormControl} from '@gravity-ui/querieskit/components/SimpleForm';
import type {FormField} from '@gravity-ui/querieskit/components/SimpleForm';

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
}

declare module '@gravity-ui/querieskit/components/SimpleForm' {
  interface FormFieldPropsRegistry {
    rating: RatingProps;
  }
}

// RatingInput is an application component implementing RatingProps.
registerFormControl('rating', RatingInput);
const rating: FormField = {id: 'score', type: 'rating', max: 5, initialValue: 3};
```

Type-only consumers need only the augmentation and type imports. Runtime forms
still need `registerFormControl` for custom components. Existing deep imports and
augmentation of the original forms module remain supported; no mandatory migration
is required. Standard fields no longer need imports such as
`import type {} from '@gravity-ui/querieskit/build/esm/components/SimpleForm/SelectField.js'`.
