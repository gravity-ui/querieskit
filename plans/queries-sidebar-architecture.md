# QueriesSidebar architecture

`QueriesSidebar` is the product widget for the shared aside shown in the updated
design. `QueriesHistory`, `SavedQueries`, `QueriesNavigation`, `TutorialsHistory`
are public scenario modules. They remain useful independently and assemble their
existing lower-level modules and components.

The widget owns the optional header slot, ordered icon tabs, controlled or
uncontrolled selection, and retained content panels. It imports concrete module
entrypoints. Modules do not import the widget. Public contracts live in `src/types`.

`hideTabs` supports application-owned navigation: `activeTab` still selects content,
the header remains available, and the same DOM panels change from tab panels to
named regions. UIKit's public Tab component override supplies explicit IDs linking
the visible tabs to these panels, without changing their React identity.

Each panel mounts its content on first visit. `ListActivityContext`, a shared helper
independent of widget types, pauses the pagination sentinel in retained hidden
panels. It does not change list keys or remove callbacks from module props.

The modules keep their own styles, i18n, internal parts and helpers. The sidebar
owns only shell styles and section labels. Root exports are unchanged; new module
entrypoints are canonical and old widget entrypoints are package export aliases.

See the [API and migration guide](../src/widgets/QueriesSidebar/README.md).
