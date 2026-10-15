# DataTypePopup

Displays a parsed data type in an interactive popover. It uses the shared
`ParameterType` descriptor from `src/types/dataTypes` and has no dependencies on
the YQL application or its type parser.

```tsx
import {DataTypePopup} from '@gravity-ui/querieskit';

<DataTypePopup type={{name: 'List', type: {name: 'Uint64'}}}>List&lt;Uint64&gt;</DataTypePopup>;
```

- `type`: optional type descriptor. Without it, children render without a popup.
- `children`: visible trigger content.
- `hideIcon`: hides the information icon.
- `className`: styles the trigger.

The popover supports hover, click and keyboard activation. Container types form
an expandable tree; the first two levels start expanded. Struct/Variant fields,
Enum members, Decimal parameters, Optional depth and tags are displayed. Content
scrolls when it exceeds 300px in height.

See **Components / DataTypePopup** in Storybook. QueryParameters uses this component
for its visible type labels.
