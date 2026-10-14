# AGENTS.md

Instructions for agents on the code structure of `@gravity-ui/querieskit`.

## Multi-agent workflow

- Proactively use subagents when independent tasks can run in parallel
  and materially improve speed or review quality. No separate user
  request is needed.
- Use up to 3 subagents concurrently across the entire task.
  Choose the number based on useful independent work.
- Keep small, straightforward changes and tightly coupled work
  in the main agent.
- Give each subagent a bounded task, relevant context, expected output,
  and explicit permission to edit or instructions to remain read-only.
- For parallel implementation, assign non-overlapping file ownership.
  Agree on shared props and public types before splitting dependent work.
  Keep shared barrels and integration changes with the main agent.
- Useful delegated tasks in this repository include:
  - Checking API levels, import direction, public types, and barrel usage.
  - Reviewing style ownership, Gravity UI usage, and i18n conventions.
  - Investigating test failures or checking affected Storybook scenarios.
- The main agent should continue complementary work while subagents run.
  Avoid duplicating their tasks.
- Before finishing, inspect delegated changes, reconcile findings,
  and run the appropriate checks on the integrated result.

## Storybook server lifecycle

- Before starting Storybook, check whether this project's Storybook is
  already available at the user-provided URL or the configured port
  (6006 by default). Confirm that it belongs to this project; an occupied
  port alone is not enough.
- Reuse an existing project Storybook for verification. Do not restart,
  reconfigure, or stop a server started by the user or another task,
  including when it is unhealthy or verification fails. If ownership or
  project identity is unclear, leave that process untouched.
- If no usable project Storybook is available, start your own instance
  on a free port. Never terminate another process to free a port. Record
  the URL and process or session you started, and share them with subagents
  so they reuse the same instance instead of starting duplicates.
- After testing or visual verification, stop any Storybook server started
  by you or your subagents, including when verification fails or is blocked.
- Track the server's process or session and verify that it has exited
  before finishing the task. Do not stop servers started by the user or
  other tasks, and do not use broad process-kill commands.
- Leave an instance started by you or your subagents running only when
  the user explicitly asks you to. Leave pre-existing servers running.
- Separate ports do not isolate source changes: servers in the same
  working directory see the same edits. When independent, stable previews
  are required, use a separate git worktree and its own Storybook instance.

## Four levels of the public API

The library is organized into four levels of abstraction. Every new and existing unit must follow this structure:

```text
src/
  components/   — basic atomic components
  modules/      — assemblies of several components into a reusable scenario block
  widgets/      — ready-made product widgets
  pages/        — compositions of widgets with page-level layout
  types/        — public types
  helpers/      — shared helpers not tied to a specific widget
  index.ts
```

### `src/components` — basic components

Small components that do not manage a large scenario and do not contain complex state/orchestration.

Inclusion rule: a component belongs in `src/components` only if a consumer of the library can use it separately and the component has a stable props contract. Do not move a component here just for the sake of consistency.

Examples: [`QueryStatusIcon`](src/components/QueryStatusIcon/QueryStatusIcon.tsx:27), [`QueryDuration`](src/components/QueryDuration/QueryDuration.tsx).

Component structure:

```text
components/
  ComponentName/
    ComponentName.tsx
    ComponentName.scss
    index.ts
```

### `src/modules` — modules

Blocks that assemble `components` and, when needed, other `modules` to define an interaction scenario within a single widget (search, list, a row with its own selection/editing logic, etc.).

A module is usually not intended to be used separately from its widget — it is an internal building block, but is factored out into a separate public level for import readability and potential reuse across widgets.

Parts of a module that have no standalone usage scenario (e.g. an internal row header, an internal menu) are not moved to `components`, and stay inside the module — either next to the main file or in an `internal/` subfolder.

Module structure:

```text
modules/
  ModuleName/
    ModuleName.tsx
    internal/
      InternalPart.tsx
    helpers/
      helperFn.ts
    index.ts
```

### `src/widgets` — widgets

Complete feature blocks that can be dropped into an application as a whole widget. A widget assembles `modules` and `components`, and contains its own i18n and widget-level settings.

Widget structure:

```text
widgets/
  WidgetName/
    WidgetName.tsx
    i18n/
    index.ts
```

### `src/pages` — pages

Pages compose independent widgets into a complete screen and own their shared layout, including resizing and visibility. They preserve the widgets' full props contracts rather than duplicating or flattening them. Data loading, query execution, persistence, and routing remain the application's responsibility.

A page follows the same unit structure: `pages/PageName/PageName.tsx`, an optional owned `PageName.scss` and `i18n/`, and a mandatory `index.ts`. See [`QueryPage`](src/pages/QueryPage/README.md).

## Import rules between levels

- `pages` import concrete `widgets`, `modules`, and `components`.
- `widgets` import `modules` and `components`, never `pages`.
- `modules` import `components` and may compose other `modules` without dependency cycles.
- `modules` do not import `widgets` or `pages`.
- `components` do not import `modules`, `widgets`, or `pages`.

Violating this order (e.g. importing a widget inside a module) is not allowed — it breaks the readability of the abstraction levels.

### Internal imports and tree-shaking

- In production code under `src`, import concrete units through their own entrypoints, e.g. `../../modules/QueriesList` or `../../components/FieldsSelector`.
- Do not import from paths resolving to `src/components/index.ts`, `src/modules/index.ts`, `src/widgets/index.ts`, `src/pages/index.ts`, or `src/index.ts`. This includes explicit `/index` paths, aliases, and self-imports from `@gravity-ui/querieskit`.
- Use `import type` for type-only dependencies, importing from the relevant file in `src/types` or a concrete unit entrypoint. The same restriction on common barrels applies to type imports.
- Preserve public barrels and their re-exports: the root entrypoint may re-export the level barrels, and level barrels may re-export units. Consumer-facing examples, stories, and tests may use public barrels to exercise the public API.
- When changing imports or adding dependencies, check that the affected production dependency chain does not introduce common barrel imports. Existing legacy imports are not examples to copy; unrelated units do not need to be migrated as part of the same change.

Common barrel imports broaden the dependency graph and can pull unrelated units and their generated polyfills into consumer builds. Direct unit imports complement the package's `sideEffects` configuration.

```ts
// Internal production imports
import {QueriesList} from '../../modules/QueriesList';
import {FieldsSelector} from '../../components/FieldsSelector';
import type {QueryHistoryRow} from '../../types/history';
```

## Naming

- `components` / `modules` / `widgets` / `pages` are fixed level names. Do not use `blocks` (conflicts with the project's BEM terminology, see `bem-cn-lite`), and do not use `compositions` or `features` (less conventional / do not match the meaning of the entities).
- Every unit at any level is a `PascalCase` folder with an implementation file of the same name and a mandatory `index.ts` that re-exports the folder's public API.

## Barrel exports

- Each level (`components`, `modules`, `widgets`, `pages`) must have its own `index.ts` that explicitly re-exports the public units of that level. Do not use self-referencing or circular constructs like `export * from '.'`.
- [`src/index.ts`](src/index.ts:1) is the entry point, re-exporting the public parts of all four levels and the public types from `src/types`.

## Types

Public types that are part of the props contract of components/modules/widgets/pages must live in `src/types` and be re-exported via `src/index.ts` if the library consumer needs them to type their own data (e.g. `QueryHistoryRow`, `QueryHistoryItem`).

## Styles

Every component/module/widget/page that needs styles owns an eponymous `.scss` file next to its `.tsx` file and imports that stylesheet itself. A parent stylesheet must not define a child's BEM block or act as the shared loading point for child styles.

- Internal appearance and layout belong to the component's own stylesheet.
- External positioning relative to a parent or siblings belongs to the parent. When a parent needs to apply such styles directly to a child, the child accepts `className` and merges it with its root BEM class; the parent passes its own BEM element, e.g. `className={block('child')}`.
- Prefer `Flex` from `@gravity-ui/uikit` for flexbox layouts when its props can express the required behavior. Use props such as `direction`, `gap`, and `alignItems` instead of duplicating them with `display: flex` in SCSS.
- Prefer container layout such as `Flex` with `gap` when it expresses the relationship; do not add a child class solely to duplicate container spacing. Keep flex rules in SCSS only when the `Flex` API cannot express the required selectors or behavior.
- Do not copy the current legacy patterns where `ClustersList.scss` defines `ClusterRow` styles or `NavigationItemsList.scss` defines `NavigationItemRow` styles. These are existing violations, not examples to follow.

For the full ownership rules, examples, and review checklist, see [`plans/styles-rules.md`](plans/styles-rules.md).

## i18n

Every page/widget/module/component with its own reusable scenario keeps its localization in an `i18n/` subfolder (`en.json`, `ru.json`, `dicts.ts`, `index.ts`), registers its keyset via [`addI18Keysets`](src/i18n/index.ts:11) with a name like `` `qp:widget-name` ``, and uses the typed `t`/`i18n(...)` function — see the example in [`QueriesHistory`](src/modules/QueriesHistory/i18n/index.ts:1).

Brief naming notes:

- Keysets: do not spread one keyset across multiple keys, keep names as short as possible (`queries.filters`, not `queries.history.filters`), and do not start a reusable component's name with the word `component.`.
- Keys: format `<context>_<text-content>` (kebab-case), e.g. `alert_query-execution-error`, `action_query-rerun`, `title_history`. Do not use the `label_` context. Recommended contexts: `context`, `alert`, `action`, `field`, `title`, `confirm`, `value`.
- Technical prefixes: `raw_` — disables the typograf; `md_` — markup via YFM (bold/italic/link), HTML in texts is forbidden.
- All strings must pass validation for allowed characters (Cyrillic, Latin, digits, standard punctuation, and currency symbols).

For the full keyset and key naming rules with an example table, see [`plans/i18n-rules.md`](plans/i18n-rules.md).

## Checklist when adding a new widget or page

When adding a new widget or page to the library:

1. Determine which parts are standalone `components`, which are `modules`, and what belongs only to the `widget` itself, and whether a composition of independent widgets belongs in `pages`.
2. Do not move internal details into `components` without a real standalone usage scenario.
3. Create/update `index.ts` at every affected level.
4. Make sure cross-level imports flow in a single direction only: `pages → widgets → modules → components`, module composition has no dependency cycles, and internal imports use concrete units rather than common barrels.
5. Verify the build and Storybook after the changes.

For a detailed example of applying these rules to the existing `QueriesHistory` widget, see [`plans/queries-history-structure.md`](plans/queries-history-structure.md).
