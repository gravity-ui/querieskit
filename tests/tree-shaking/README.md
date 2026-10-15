# Published-package integration checks

Run `npm run build` before the checks below. They deliberately consume emitted
files, so generated Babel helpers and package exports are exercised.

- `node tests/tree-shaking/check.mjs`: existing API, CSS, localization, and
  dependency-boundary checks.
- `node tests/tree-shaking/check-published.mjs`: declared runtime dependencies,
  absence of full Monaco imports, every explicit export's JS/types resolution,
  deferred editors in history lists, and isolated lightweight component styles.
- `node tests/tree-shaking/consumer.mjs`: pack the built library, install it in a
  temporary consumer with Babel runtime 8 at the application root, verify that
  the library independently resolves runtime 7, then build production webpack
  consumers using public ESM and CJS package specifiers. Requires npm registry
  access (or a populated npm cache). The temporary installation is removed.

The isolated consumer bundles third-party dependencies; it does not externalize
Babel, Monaco, or polyfills. Its compiler and CSS tooling come from this project's
dev dependencies, while application runtime dependencies resolve exclusively
from the installed consumer. It does not run npm lifecycle scripts.

Webpack writes `build/consumer/stats-*.json` (usable with Statoscope) and
`build/consumer/sizes.json`. Sizes are emitted bytes without gzip: JavaScript is
minified, CSS is extracted without additional minification. Initial and deferred
JS/CSS are reported separately. The CJS root scenario may
retain substantially more code than ESM because its re-exports execute eagerly.

To compare against an existing measurement:

```sh
CONSUMER_BASELINE=/absolute/path/to/before/sizes.json npm run test:consumer
```

This additionally writes `build/consumer/comparison.json`. Baseline measurements
must use the same compiler settings and dependency versions to isolate source
changes. `webpack-consumer.mjs` also accepts `CONSUMER_ROOT`, `CONSUMER_OUTPUT`,
and an optional `BASELINE_RUNTIME` alias for reproducing old builds that lacked
a runtime dependency. The alias is for baseline measurements only; the isolated
consumer check never uses it.

For a comparison using exactly the same installed dependency tree and fixtures:

```sh
CONSUMER_BASELINE_BUILD=/absolute/path/to/before/build npm run test:consumer
```

The test temporarily swaps only the installed library build, measures baseline
into `build/consumer/before`, restores the packed build, and measures after. Both
measurements use the new public export map and the same nested runtime 7; this
is a controlled code-size comparison, not a claim that the old manifest worked.
The repository build is never modified.
