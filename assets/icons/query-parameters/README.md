# Query parameter icons

SVG exports from the [Query parameters design](https://www.figma.com/design/QvThAJy1PG2eq1W9yy59De/-YQL--Query?node-id=699-32727):

- `raw.svg`: RAW button, node `699:32302`.
- `binary.svg`: escaped string button, node `699:32308` (also `699:43159`).

Both icons retain the exported 16×16 viewport and vector outlines. Black fills
are replaced with `currentColor` so Gravity UI controls their appearance.
Optimized with SVGO using `multipass`, `preset-default` with `removeViewBox: false`,
removal of `preserveAspectRatio`, `overflow` and `style`, and `prefixIds` with a
`query-params-<name>` prefix. No fonts or external assets are required.

The module imports generated React components from
`src/modules/QueryParameters/internal/icons`. Generate them from these optimized
SVG sources using `@svgr/core` with `@svgr/plugin-jsx`, `typescript: true`, and
`jsxRuntime: 'classic'`; component names are `RawIcon` and `BinaryIcon`.
This keeps the icons independent of SVG loaders in development and library builds.
