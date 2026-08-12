# AGENTS.md

Instructions for agents on the code structure of `@gravity-ui/querieskit`.

## Three levels of the public API

The library is organized into three levels of abstraction. Every new and existing widget must follow this structure:

```text
src/
  components/   — basic atomic components
  modules/      — assemblies of several components into a reusable scenario block
  widgets/      — ready-made product widgets
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

Blocks that assemble several `components` and define an interaction scenario within a single widget (search, list, a row with its own selection/editing logic, etc.).

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

## Import rules between levels

- `widgets` import `modules` and `components`.
- `modules` import `components`.
- `components` do not import `modules` or `widgets`.

Violating this order (e.g. importing a widget inside a module) is not allowed — it breaks the readability of the abstraction levels.

## Naming

- `components` / `modules` / `widgets` are fixed level names. Do not use `blocks` (conflicts with the project's BEM terminology, see `bem-cn-lite`), and do not use `compositions` or `features` (less conventional / do not match the meaning of the entities).
- Every unit at any level is a `PascalCase` folder with an implementation file of the same name and a mandatory `index.ts` that re-exports the folder's public API.

## Barrel exports

- Each level (`components`, `modules`, `widgets`) must have its own `index.ts` that explicitly re-exports the public units of that level. Do not use self-referencing or circular constructs like `export * from '.'`.
- [`src/index.ts`](src/index.ts:1) is the entry point, re-exporting the public parts of all three levels and the public types from `src/types`.

## Types

Public types that are part of the props contract of components/modules/widgets must live in `src/types` and be re-exported via `src/index.ts` if the library consumer needs them to type their own data (e.g. `QueryHistoryRow`, `QueryHistoryItem`).

## i18n

Every widget/module/component with its own reusable scenario keeps its localization in an `i18n/` subfolder (`en.json`, `ru.json`, `dicts.ts`, `index.ts`), registers its keyset via [`addI18Keysets`](src/i18n/index.ts:11) with a name like `` `qp:widget-name` ``, and uses the typed `t`/`i18n(...)` function — see the example in [`QueriesHistory`](src/widgets/QueriesHistory/i18n/index.ts:1).

Brief naming notes:

- Keysets: do not spread one keyset across multiple keys, keep names as short as possible (`queries.filters`, not `queries.history.filters`), and do not start a reusable component's name with the word `component.`.
- Keys: format `<context>_<text-content>` (kebab-case), e.g. `alert_query-execution-error`, `action_query-rerun`, `title_history`. Do not use the `label_` context. Recommended contexts: `context`, `alert`, `action`, `field`, `title`, `confirm`, `value`.
- Technical prefixes: `raw_` — disables the typograf; `md_` — markup via YFM (bold/italic/link), HTML in texts is forbidden.
- All strings must pass validation for allowed characters (Cyrillic, Latin, digits, standard punctuation, and currency symbols).

For the full keyset and key naming rules with an example table, see [`plans/i18n-rules.md`](plans/i18n-rules.md).

## Checklist when adding a new widget

When adding a new widget to the library:

1. Determine which parts are standalone `components`, which are `modules`, and what belongs only to the `widget` itself.
2. Do not move internal details into `components` without a real standalone usage scenario.
3. Create/update `index.ts` at every affected level.
4. Make sure imports flow in a single direction only: `widgets → modules → components`.
5. Verify the build and Storybook after the changes.

For a detailed example of applying these rules to the existing `QueriesHistory` widget, see [`plans/queries-history-structure.md`](plans/queries-history-structure.md).
