# ResizeHandle

A controlled, keyboard-accessible separator for application-owned layouts.

```tsx
import {ResizeHandle} from '@gravity-ui/querieskit/components/ResizeHandle';

<div style={{display: 'grid', width: 6, height: '100%'}}>
  <ResizeHandle
    orientation="vertical"
    value={sidebarWidth}
    min={240}
    max={600}
    label="Resize sidebar"
    controls="sidebar"
    onChange={setSidebarWidth}
  />
</div>
```

The parent applies the proposed size to the controlled region and supplies the
separator's geometry. `controls` identifies that region's DOM ID; provide a localized
accessible `label`. The handle owns pointer capture and clamps changes to `min` and
optional `max`; it does not measure or resize the controlled region itself.

Orientation describes the separator. A vertical separator increases its value when
dragged right or when ArrowRight is pressed; a horizontal separator increases it when
dragged up or when ArrowUp is pressed, matching a bottom results panel. The opposite
arrow decreases the value. Keyboard steps are 16 px, or 64 px with Shift. Home selects
`min`; End selects `max` when supplied.

For a complete editor/results layout, use
[QueryWorkspaceLayout](../../modules/QueryWorkspaceLayout/README.md).
