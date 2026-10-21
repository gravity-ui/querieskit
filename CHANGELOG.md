# Changelog

## Unreleased

### API migration

- `QueryEditorProps.onFormat` and `onValidate` are now optional. Existing component calls remain valid; wrappers that call these properties through `QueryEditorProps` must check their presence or use `?.()`. Visible actions without handlers are disabled.

- Unify `NavigationPreview` and `QueryResults` on `QueryResultsTable`. Preview columns now require YQL types; move `view.tableColumns` / `view.extraColumns` into `data.columns` and use `column.render` for custom cells. Remove `buildPreviewColumns` and replace `NavigationPreviewFormatterConfig` with the shared `NavigationPreviewViewConfig<TRow>`. See the [migration guide](src/modules/NavigationPreview/README.md).
- Separate preview wire rows from `NavigationView` display rows; `createTableDetailConfig` accepts an independent fifth generic for view rows.

### Features

- Add editor `hiddenActions` / `hiddenPanels`, execution-panel `headerActions` / `statusContent`, and per-query `renderWorkspace` composition. The QueryPage `ExternalState` example demonstrates controlled integration with an adjacent file editor while retaining the query workspace.

- Upgrade the standard Result Schema with expandable types, optional markers, tags, parameters, and one-based indices. Share indices, stripes and sticky-header settings with Result. Add optional `column.schemaType` and public `QueryResultSchemaType` for neutral schema descriptions; existing YQL types work automatically and Result value formatting is unchanged.

- Share cell and table settings across results and navigation, including preview callbacks, per-cell metadata, row keys, indices, stripes, and sticky headers. Add `resolvePreviewView` to `createTableDetailConfig`.

## [3.6.1](https://github.com/gravity-ui/querieskit/compare/v3.6.0...v3.6.1) (2026-10-21)


### Bug Fixes

* **Attachments:** support creation in insecure HTTP contexts ([595c00c](https://github.com/gravity-ui/querieskit/commit/595c00c1793adc1b88f889aa9d8f8ac4beeec1de))

## [3.6.0](https://github.com/gravity-ui/querieskit/compare/v3.5.0...v3.6.0) (2026-10-20)


### Features

* support custom row menus and validate attachment restore ([fda67ee](https://github.com/gravity-ui/querieskit/commit/fda67eeaac4e78f50313129e39383f3f9c170904))

## [3.5.0](https://github.com/gravity-ui/querieskit/compare/v3.4.0...v3.5.0) (2026-10-20)


### Features

* extend standard query panels with compatible customization ([cf3c7c7](https://github.com/gravity-ui/querieskit/commit/cf3c7c7984d34df0d00c9bc6c8d934278a85907f))

## [3.4.0](https://github.com/gravity-ui/querieskit/compare/v3.3.0...v3.4.0) (2026-10-19)


### Features

* **QueriesVcs:** add optional repository selection ([0a59962](https://github.com/gravity-ui/querieskit/commit/0a5996297f29ab1bfc4381e234c2f70f313186e8))

## [3.3.0](https://github.com/gravity-ui/querieskit/compare/v3.2.0...v3.3.0) (2026-10-19)


### Features

* **QueriesVcs:** add customizable VCS navigation ([662701f](https://github.com/gravity-ui/querieskit/commit/662701fc1aaa8058ffb4760b90ddedf0c0bc8605))

## [3.2.0](https://github.com/gravity-ui/querieskit/compare/v3.1.1...v3.2.0) (2026-10-19)


### Features

* consolidate parameter editing in QueryParameters ([fd30449](https://github.com/gravity-ui/querieskit/commit/fd30449ebd5ddba240a65bee784aea34ece9d5ea))
* **QueryPage:** confirm history query deletion ([239dc10](https://github.com/gravity-ui/querieskit/commit/239dc10cad0ee95600aa13b4826fd1993476871a))


### Bug Fixes

* restore parameter validation and accessible feedback ([9191081](https://github.com/gravity-ui/querieskit/commit/9191081c4d1338526755e1516e645cab9e8d80d0))

## [3.1.1](https://github.com/gravity-ui/querieskit/compare/v3.1.0...v3.1.1) (2026-10-15)


### Bug Fixes

* **QueryPage:** hide empty execution panels and balance tab spacing ([80634e6](https://github.com/gravity-ui/querieskit/commit/80634e68a19e4e9f796e6b57bc62532b435e0132))

## [3.1.0](https://github.com/gravity-ui/querieskit/compare/v3.0.0...v3.1.0) (2026-10-15)


### Features

* **QueryPage:** add application integration extension points ([acb71b5](https://github.com/gravity-ui/querieskit/commit/acb71b5155bd1eaa5fef061813e78080dc517f86))


### Bug Fixes

* **deps:** pin charts to 1.57.2 for browser CJS consumers ([c98389f](https://github.com/gravity-ui/querieskit/commit/c98389fcbbbae0abe44c0954e427bfec2fc33aec))

## [3.0.0](https://github.com/gravity-ui/querieskit/compare/v2.6.0...v3.0.0) (2026-10-15)


### ⚠ BREAKING CHANGES

* **bundling:** only query languages and JSON are registered automatically; applications must register additional Monaco languages explicitly.
* **editor:** rename built-in engine UI presets
* **editor:** align engine presets and wire QueryPage integration
* **types:** centralize public component contracts

### refactor

* **editor:** rename built-in engine UI presets ([4c7f7ae](https://github.com/gravity-ui/querieskit/commit/4c7f7ae94272eaf05acb37238338aa15e37d4a58))
* **types:** centralize public component contracts ([d19df51](https://github.com/gravity-ui/querieskit/commit/d19df51142b08fc5eb32c6b47a26fab144a5e1b5))


### Bug Fixes

* **bundling:** isolate exports and lazy-load Monaco previews ([9e0d961](https://github.com/gravity-ui/querieskit/commit/9e0d96166a6239c2ba60d27609b8e504a5557a9f))
* **composition:** preserve filter drafts and dynamic selection ([703b386](https://github.com/gravity-ui/querieskit/commit/703b3863300e0a23a4306bf40b187026fae9d233))
* **editor:** align engine presets and wire QueryPage integration ([def5843](https://github.com/gravity-ui/querieskit/commit/def5843f28e0f34e2b0b4637ea7672b3d201f517))
* **i18n:** localize charts and improve Storybook coverage ([2562dd1](https://github.com/gravity-ui/querieskit/commit/2562dd16286d40ba97c86690e3e2facf527ed652))
* preserve FormField component root export ([90edae6](https://github.com/gravity-ui/querieskit/commit/90edae603cfca11682e1ac17b05624d1a0a9dc81))
* **QueryPage:** remove Notes tab from stories ([34bf793](https://github.com/gravity-ui/querieskit/commit/34bf793e9b2adfac34b2ec3bafd84ee2d9e80b55))

## [2.6.0](https://github.com/gravity-ui/querieskit/compare/v2.5.0...v2.6.0) (2026-10-14)


### Features

* **QueryComparison:** add multi-block code comparison module ([340ed6d](https://github.com/gravity-ui/querieskit/commit/340ed6de4131a67c05e8f3c9827cf07c64a6812d))
* **QueryComparison:** add version selection and header actions ([9817720](https://github.com/gravity-ui/querieskit/commit/98177203cbf90bf91b5ef1651f5d87b098bbaa7a))
* **QueryEditor:** integrate parameters side panel ([c603a98](https://github.com/gravity-ui/querieskit/commit/c603a984592015e32db9b8a9023a0abfa79f0eec))
* **QueryPage:** add tabbed query workspaces with resizable layout ([01a580b](https://github.com/gravity-ui/querieskit/commit/01a580ba8af3158ed4ad863fdfd72c336cb8f389))
* **QueryPage:** integrate editable history comparisons ([d395567](https://github.com/gravity-ui/querieskit/commit/d3955671597f5421e47743fb24c3cc56c1ca3413))
* **QueryParameters:** add expanded panel and view layouts ([6d9c6ef](https://github.com/gravity-ui/querieskit/commit/6d9c6ef10b4705596d6cdda74831bf2da4e9ea52))
* **QueryParameters:** add query parameter editor ([795fa06](https://github.com/gravity-ui/querieskit/commit/795fa06731fd2323e77254fb72b77024373cb8a5))
* **QueryParameters:** align editors and nullable values with design ([ba953cb](https://github.com/gravity-ui/querieskit/commit/ba953cbceec889980d30a0c851c4619b2aa3c993))
* **QueryParameters:** support all parameter field types ([4c1bbc0](https://github.com/gravity-ui/querieskit/commit/4c1bbc061220b333bf80b1f5b6bc6e0441774e15))
* **QueryParameters:** use date picker for Date and Datetime ([2453fde](https://github.com/gravity-ui/querieskit/commit/2453fde7ae9640214aae7c57283551381bb2d9b8))


### Bug Fixes

* keep Monaco hover service alive after diff editor disposal ([6a04298](https://github.com/gravity-ui/querieskit/commit/6a04298b139be40991f3f1db7d984f2b3895e449))
* reserve space for history row actions ([c817173](https://github.com/gravity-ui/querieskit/commit/c817173b912457ac93f5525692864bc4ee8c2eba))

## [2.5.0](https://github.com/gravity-ui/querieskit/compare/v2.4.0...v2.5.0) (2026-10-13)


### Features

* **QueryEditor:** add query link sharing dialog ([47c454d](https://github.com/gravity-ui/querieskit/commit/47c454daca5d1cfb9fb2001371701240585a53b9))
* **QueryEditor:** add save menu and simplify stories ([3062817](https://github.com/gravity-ui/querieskit/commit/3062817b75c080987726e1dda20788017c02767c))
* **QueryEditor:** integrate attachments in shared side panel ([c9e7c62](https://github.com/gravity-ui/querieskit/commit/c9e7c6298bd773efd435bc31762945f7c79f7f51))
* **QueryEditor:** integrate settings and built-in engine preset ([9c5a040](https://github.com/gravity-ui/querieskit/commit/9c5a0409de1ad51766b50b8572f9e4b448455886))
* **QuerySettings:** add extensible query settings form ([5d7321d](https://github.com/gravity-ui/querieskit/commit/5d7321db8b34f54a37f1ac18d3a7287ed40aa791))


### Bug Fixes

* **ci:** resolve jsdom test timeouts before release ([033daca](https://github.com/gravity-ui/querieskit/commit/033daca9fd52d7aa9f4627113b619b4ff6a2dea7))
* **QueryEditor:** anchor sharing popup and update bundle checks ([ebe4f71](https://github.com/gravity-ui/querieskit/commit/ebe4f71b5fcd83dbd9e4bb6dfd29f20eb219f5fe))

## [2.4.0](https://github.com/gravity-ui/querieskit/compare/v2.3.1...v2.4.0) (2026-10-09)


### Features

* **editors:** add extensible providers and query language preset ([36fa5f2](https://github.com/gravity-ui/querieskit/commit/36fa5f2cbf97769710f17a91ad58979395b157a4))


### Bug Fixes

* deduplicate form fields and row metadata logic ([7abe1c0](https://github.com/gravity-ui/querieskit/commit/7abe1c0abb263c58b7cdc11f3bd36ef6080e26ca))

## [2.3.1](https://github.com/gravity-ui/querieskit/compare/v2.3.0...v2.3.1) (2026-10-07)


### Bug Fixes

* **ChartFieldsEditor:** preserve preview with empty measure rows ([b020671](https://github.com/gravity-ui/querieskit/commit/b0206711ba8253832471905f902fd7afc787d951))

## [2.3.0](https://github.com/gravity-ui/querieskit/compare/v2.2.0...v2.3.0) (2026-10-07)


### Features

* **ChartFieldsForm:** add chart-specific column bindings ([8a68653](https://github.com/gravity-ui/querieskit/commit/8a68653dae0f3742a30e443fdecf9508d2f3703a))
* **DashboardCharts:** add column-based chart editor ([468981b](https://github.com/gravity-ui/querieskit/commit/468981b3500c306aa95c609fd8caa90b6e413697))
* **QueryEditor:** add query editor with resizable settings panel ([446c041](https://github.com/gravity-ui/querieskit/commit/446c041780304ea505ce50264ec88d36c59f8e09))
* **QueryExecutionPanel:** integrate dashboard charts tab ([1a11117](https://github.com/gravity-ui/querieskit/commit/1a11117ac1c136762bffb8cbedda28cd55e201af))
* **QueryTabs:** add query and comparison tabs ([3d349ee](https://github.com/gravity-ui/querieskit/commit/3d349ee93770c10246ba59d560e27328afca3106))

## [2.2.0](https://github.com/gravity-ui/querieskit/compare/v2.1.1...v2.2.0) (2026-10-06)


### Features

* **QueryResults:** add structured expandable schema types ([a3583f7](https://github.com/gravity-ui/querieskit/commit/a3583f7a53f84e498f93ec20790ff2f1f8f50b14))


### Bug Fixes

* **QueryGraph:** correct toolbox button corner radii ([0c53da8](https://github.com/gravity-ui/querieskit/commit/0c53da835f5462f34fc0ec37dc1e9320c3468dc0))
* **QueryGraph:** lighten connection lines ([877e575](https://github.com/gravity-ui/querieskit/commit/877e57513b015c6255bdbb33978d38e7525ab15c))
* **QueryGraph:** reduce vertical layout spacing ([d707e77](https://github.com/gravity-ui/querieskit/commit/d707e77ea3cf45cd1a2cb4e3a0ac94bc4246a6ea))

## [2.1.1](https://github.com/gravity-ui/querieskit/compare/v2.1.0...v2.1.1) (2026-10-05)


### Bug Fixes

* **QueryGraph:** improve layout density and zoom readability ([0bb6cd0](https://github.com/gravity-ui/querieskit/commit/0bb6cd00488d1aef3680d4906c098f08bcdf12a9))

## [2.1.0](https://github.com/gravity-ui/querieskit/compare/v2.0.2...v2.1.0) (2026-10-05)


### Features

* **NavigationPreview:** unify result table rendering ([a499265](https://github.com/gravity-ui/querieskit/commit/a499265a469980eb88b5ec77449e6b7bc75cd340))
* **QueryResults:** add standard cell rendering ([19fb659](https://github.com/gravity-ui/querieskit/commit/19fb6591e2a431f7e9736cb43faacade23592e64))

## [2.0.2](https://github.com/gravity-ui/querieskit/compare/v2.0.1...v2.0.2) (2026-10-03)


### Bug Fixes

* **deps:** update @gravity-ui/graph to 1.12.2 ([edadda4](https://github.com/gravity-ui/querieskit/commit/edadda4785e59c974feb65faaaa539d12b9d61e8))

## [2.0.1](https://github.com/gravity-ui/querieskit/compare/v2.0.0...v2.0.1) (2026-10-02)


### Bug Fixes

* **QueriesList:** unify panels and preserve uncontrolled search ([50efc85](https://github.com/gravity-ui/querieskit/commit/50efc8573c71d2060ce61c12979a094983e651e3))
* **QueriesNavigation:** add View search and constrain tabs width ([454eb12](https://github.com/gravity-ui/querieskit/commit/454eb12844187b37e60e90ba0b13142cd78eb791))
* **QueriesNavigation:** align navigation layout and schema with design ([a054e92](https://github.com/gravity-ui/querieskit/commit/a054e92802c9af54da4d6056fdbcf1048cd962f6))
* **QueriesNavigation:** align rows and spacing with design ([5b18a18](https://github.com/gravity-ui/querieskit/commit/5b18a18b406e42cdc636faf834ce8327cd4b8caa))
* **RowsList:** disable hover highlighting for group headers ([3e3c3f6](https://github.com/gravity-ui/querieskit/commit/3e3c3f6bea5035e407cefd87b9355031e8cc0bc0))
* **RowsList:** preserve original items in row renderers ([247f4ef](https://github.com/gravity-ui/querieskit/commit/247f4ef7a7539495a3f413672e4fcda02d035250))
* **TutorialsHistory:** align layout and controls with design ([ccfc1f7](https://github.com/gravity-ui/querieskit/commit/ccfc1f7de04ed3def1ddd0eac9e8db1d4d0f1fac))
* **TutorialsHistory:** scope design changes and preserve long numbers ([2b4085d](https://github.com/gravity-ui/querieskit/commit/2b4085dc11d5f6e9964b3e26c4f6ca4c81b1f2f6))

## [2.0.0](https://github.com/gravity-ui/querieskit/compare/v1.11.0...v2.0.0) (2026-09-29)


### ⚠ BREAKING CHANGES

* unmount inactive queries sidebar tabs by default

### Features

* unmount inactive queries sidebar tabs by default ([5cfc6aa](https://github.com/gravity-ui/querieskit/commit/5cfc6aaa261ddc82037ddf994e3b2c26a94c4a37))

## [1.11.0](https://github.com/gravity-ui/querieskit/compare/v1.10.0...v1.11.0) (2026-09-29)


### Features

* add queries sidebar with configurable tabs ([333f20a](https://github.com/gravity-ui/querieskit/commit/333f20a4cb7afaab7b3a1efd54c61e9facabead0))


### Bug Fixes

* align query execution panel with design ([c872ef1](https://github.com/gravity-ui/querieskit/commit/c872ef111687a9067a153f5e2936377506da4d2d))
* allow horizontal scrolling in narrow query history ([91595f8](https://github.com/gravity-ui/querieskit/commit/91595f845f9bfc4c444b871a38d98f974d79f014))
* collapse query execution panel to header ([ba456c5](https://github.com/gravity-ui/querieskit/commit/ba456c5b726a46ed79a0920ed722bc48d0895f00))

## [1.10.0](https://github.com/gravity-ui/querieskit/compare/v1.9.0...v1.10.0) (2026-09-28)


### Features

* add extensible query execution panel ([cd2855e](https://github.com/gravity-ui/querieskit/commit/cd2855e43a8626370ce5bda6b0839ebd14867d54))

## [1.9.0](https://github.com/gravity-ui/querieskit/compare/v1.8.0...v1.9.0) (2026-09-28)


### Features

* add configurable query execution timeline ([95c9ebc](https://github.com/gravity-ui/querieskit/commit/95c9ebcd8d6033bb162a1d5a32432f74add6c457))
* extend SavedQueries integration API ([450e538](https://github.com/gravity-ui/querieskit/commit/450e5385f5c5e295ed9b396e05a381a6916197ea))


### Bug Fixes

* fix dashboard layout grid on item dynamic added ([81c9922](https://github.com/gravity-ui/querieskit/commit/81c9922386250273e458b06cf5101e9b235b6ee2))

## [1.8.0](https://github.com/gravity-ui/querieskit/compare/v1.7.0...v1.8.0) (2026-09-22)


### Features

* extend QueriesNavigation integration API ([531ced5](https://github.com/gravity-ui/querieskit/commit/531ced5e273afe5842d5dd85298ce7824c83129e))

## [1.7.0](https://github.com/gravity-ui/querieskit/compare/v1.6.0...v1.7.0) (2026-09-22)


### Features

* extend TutorialsHistory integration API ([6b5bb81](https://github.com/gravity-ui/querieskit/commit/6b5bb8198e937da51d0c26b5b52599b2a7c5c3c7))


### Bug Fixes

* **Graph:** text under block ([93de8d9](https://github.com/gravity-ui/querieskit/commit/93de8d93ac148ef430f23b3cb00ab77aceef9a00))

## [1.6.0](https://github.com/gravity-ui/querieskit/compare/v1.5.1...v1.6.0) (2026-09-21)


### Features

* **QueriesResult:** add query graph [YTFRONT-5935] ([470874e](https://github.com/gravity-ui/querieskit/commit/470874e182161c0db1bfae559fa5726b877da43a))


### Bug Fixes

* improve tree-shaking ([7674363](https://github.com/gravity-ui/querieskit/commit/7674363526f521870de4a9e6fe2d317c0919fcb7))

## [1.5.1](https://github.com/gravity-ui/querieskit/compare/v1.5.0...v1.5.1) (2026-09-18)


### Bug Fixes

* fix scroll attachment list ([58a8417](https://github.com/gravity-ui/querieskit/commit/58a84178c2c0940225baa225651eae574b6b33fd))

## [1.5.0](https://github.com/gravity-ui/querieskit/compare/v1.4.0...v1.5.0) (2026-09-17)


### Features

* show loader while loading more [YTFRONT-5935] ([055b108](https://github.com/gravity-ui/querieskit/commit/055b1086f1212e72b6c07022109bae9b5fff65bd))


### Bug Fixes

* center load more indicator ([aaf0154](https://github.com/gravity-ui/querieskit/commit/aaf015405b4e95cf300447631e4398af68b05f91))
* correct query duration calculation [YTFRONT-5935] ([a47c186](https://github.com/gravity-ui/querieskit/commit/a47c1868345ac1546b1b4f85e2c7e78287365692))

## [1.4.0](https://github.com/gravity-ui/querieskit/compare/v1.3.2...v1.4.0) (2026-09-17)


### Features

* extend QueriesHistory integration API ([4a2986b](https://github.com/gravity-ui/querieskit/commit/4a2986b9fb2814a7ffe0a9464b0f2aaa240587de))

## [1.3.2](https://github.com/gravity-ui/querieskit/compare/v1.3.1...v1.3.2) (2026-09-17)


### Bug Fixes

* fix onItemClick prop in Attachments, fix paddings ([af4198f](https://github.com/gravity-ui/querieskit/commit/af4198f1109755e0aace9e2e752db85fcf7dc070))
* fix types and add const ([2a53be6](https://github.com/gravity-ui/querieskit/commit/2a53be6ae71f87f0937bccd1a78a6ce83e811caf))

## [1.3.1](https://github.com/gravity-ui/querieskit/compare/v1.3.0...v1.3.1) (2026-09-15)


### Bug Fixes

* fix folder width ([dd6e5b2](https://github.com/gravity-ui/querieskit/commit/dd6e5b27d742726de38993d50a58484555de7292))
* fix imports in attachments, import from package, change api of queryhistory ([83d81b3](https://github.com/gravity-ui/querieskit/commit/83d81b362216133a603a5768d2fda59de6e252af))
* fix title in mock data ([af3ecd1](https://github.com/gravity-ui/querieskit/commit/af3ecd18d4628609e1d73657f28ee5edf1977761))

## [1.3.0](https://github.com/gravity-ui/querieskit/compare/v1.2.0...v1.3.0) (2026-09-04)


### Features

* add i18n translate ([fadb155](https://github.com/gravity-ui/querieskit/commit/fadb155dccb64da5a57a0def2c886bf75204150b))
* add validation for forms ([227e2ee](https://github.com/gravity-ui/querieskit/commit/227e2eea391645b9763e83ccf7982f363c4da4a1))
* **UI:** add result table [YTFRONT-5935] ([508bcdb](https://github.com/gravity-ui/querieskit/commit/508bcdb8a77530a4a6f0c4504c43f8d9480813aa))
* **UI:** add static table [YTFRONT-5935] ([065e8f1](https://github.com/gravity-ui/querieskit/commit/065e8f15557ea16a8d1ca8ca9bd0d90fae8ba76e))
* **UI:** error tree [YTFRONT-5935] ([50b20da](https://github.com/gravity-ui/querieskit/commit/50b20da21d02649a70fa0746933ab70c397b0eb3))


### Bug Fixes

* fix control of adding new attachments ([b5a0985](https://github.com/gravity-ui/querieskit/commit/b5a0985c2b1b5621c72347addcdcfd296bb4826f))
* **QueryResult:** change colors [YTFRONT-5935] ([58c1550](https://github.com/gravity-ui/querieskit/commit/58c1550e0e14f9e03c270850577127c0ede59b01))

## [1.2.0](https://github.com/gravity-ui/querieskit/compare/v1.1.0...v1.2.0) (2026-08-31)


### Features

* **UI:** saved queries [YTFRONT-5935] ([6d7094e](https://github.com/gravity-ui/querieskit/commit/6d7094ee8916a85c04f564972d43537f01295c4b))


### Bug Fixes

* **UI:** navigation [YTFRONT-5935] ([b00c29f](https://github.com/gravity-ui/querieskit/commit/b00c29f0f45dc1e324a84bbf80c0c5e9d7e94a5d))

## [1.1.0](https://github.com/gravity-ui/querieskit/compare/v1.0.4...v1.1.0) (2026-08-28)


### Features

* add icons for new graphs ([0252880](https://github.com/gravity-ui/querieskit/commit/0252880ff89c2c3d1edfc725308785212fdf380d))
* add possible control chartItems state outside DashboardCharts ([a3e2884](https://github.com/gravity-ui/querieskit/commit/a3e288435bc474652b80a2da65c3b4639aaf5c3e))
* init DashboardCharts ([1d166a8](https://github.com/gravity-ui/querieskit/commit/1d166a8d106ae03e6005acea254f1572a42ebc36))
* init DashboardCharts ([806147a](https://github.com/gravity-ui/querieskit/commit/806147aefe39220f37fed27e95821e1a680e5f57))
* refactor component Dashboard ([42eceff](https://github.com/gravity-ui/querieskit/commit/42ecefff63e054d2048f882f732c1382a9086e1f))
* **UI:** add common search component [YTFRONT-5935] ([a21c39e](https://github.com/gravity-ui/querieskit/commit/a21c39e5ea4373bc871db1d50803da2dc53223ea))
* **UI:** navigation [YTFRONT-5935] ([cd83b36](https://github.com/gravity-ui/querieskit/commit/cd83b36377f3dce6fae1c62dc1377411b45620c7))


### Bug Fixes

* fix i18n in DashboardCharts ([9ebc11a](https://github.com/gravity-ui/querieskit/commit/9ebc11ad1b11825908b197d7caf7cb4ccaf6dca2))
* fix opening chart ([9988324](https://github.com/gravity-ui/querieskit/commit/99883243d6102222555a6bfb29164bff3df6d2ad))
* fix TS types errors ([bd9cff7](https://github.com/gravity-ui/querieskit/commit/bd9cff7f33924dcea598967df8eb6b36b3e5c1f7))
* fix types ([2b23ff7](https://github.com/gravity-ui/querieskit/commit/2b23ff7f4c79f320c9222311e5b15fcd448f2958))
* **History:** wrong paddings [YTFRONT-5935] ([fb1b815](https://github.com/gravity-ui/querieskit/commit/fb1b815f7bda61d66de5393c67ad7565df344946))

## [1.0.4](https://github.com/gravity-ui/querieskit/compare/v1.0.3...v1.0.4) (2026-08-12)


### Bug Fixes

* **CI:** wrong deploy directory [YTFRONT-5935] ([30a5621](https://github.com/gravity-ui/querieskit/commit/30a5621659acc20e7439a7a3f5eeade033ad1a5e))

## [1.0.3](https://github.com/gravity-ui/querieskit/compare/v1.0.2...v1.0.3) (2026-08-12)


### Bug Fixes

* **CI:** wrong deploy directory [YTFRONT-5935] ([5eae194](https://github.com/gravity-ui/querieskit/commit/5eae19411004b979fba162d805bf8b83534815e5))

## [1.0.2](https://github.com/gravity-ui/querieskit/compare/v1.0.1...v1.0.2) (2026-08-12)


### Bug Fixes

* **CI:** storybook build problem [YTFRONT-5935] ([f0db180](https://github.com/gravity-ui/querieskit/commit/f0db180fd6c5c5974db28259d41205e97a655cf9))

## [1.0.1](https://github.com/gravity-ui/querieskit/compare/v1.0.0...v1.0.1) (2026-08-12)


### Bug Fixes

* **CI:** lost typecheck [YTFRONT-5935] ([aca9f5c](https://github.com/gravity-ui/querieskit/commit/aca9f5cee9868d8d75d628d34b831cfa04e0d2a7))

## 1.0.0 (2026-08-12)


### Features

* **History:** add queries history component [YTFRONT-5935] ([81f7bb8](https://github.com/gravity-ui/querieskit/commit/81f7bb82927220c4e899419a0ef88570bc40afd5))
* **History:** filter [YTFRONT-5935] ([d708dbd](https://github.com/gravity-ui/querieskit/commit/d708dbd53df974b5fbd839c741e237ad15abb958))
* **History:** search [YTFRONT-5935] ([8b88de5](https://github.com/gravity-ui/querieskit/commit/8b88de55528a2bcdc96431f083816883e9151509))
* **History:** tutorials [YTFRONT-5935] ([fce38d1](https://github.com/gravity-ui/querieskit/commit/fce38d1ea28caeabcdaba119d7f797266cf7f293))
* **UI:** history search [YTFRONT-5935] ([1796a74](https://github.com/gravity-ui/querieskit/commit/1796a74cecbbb576f51b7a39b35d811efc6bf781))
* **UI:** license and readme [YTFRONT-5935] ([88c0335](https://github.com/gravity-ui/querieskit/commit/88c0335f5241819e8823338e66cceaeb2c6ac2f7))
* **UI:** simple form [YTFRONT-5935] ([8278eb4](https://github.com/gravity-ui/querieskit/commit/8278eb41e4f6d2dbccab88e6fd8077527d0c579e))


### Bug Fixes

* **Eslint:** correct import resolve ([f02bc09](https://github.com/gravity-ui/querieskit/commit/f02bc09f19ab1b4e17a6f5b0ada4e456f9c875bd))
* **History:** wrong hover color [YTFRONT-5935] ([98f3d4c](https://github.com/gravity-ui/querieskit/commit/98f3d4c1b987e4aa127627aaec55cb27cfa1e2fa))
* **UI:** add monaco languages [YTFRONT-5935] ([6f662ca](https://github.com/gravity-ui/querieskit/commit/6f662caff793d27f089424dda3251823f70fc842))
* **UI:** change agents language [YTFRONT-5935] ([f249e7d](https://github.com/gravity-ui/querieskit/commit/f249e7d4590b99f042cc7a58f4ec5752078ff45c))
* **UI:** comparison mode [YTFRONT-5935] ([7854478](https://github.com/gravity-ui/querieskit/commit/7854478d2b99f2d5c7f9c2f7f5f2caa55db0155c))
* **UI:** history empty list [YTFRONT-5935] ([7bddc2d](https://github.com/gravity-ui/querieskit/commit/7bddc2d14915bcf16128a9cb9fc0aa902723d1d7))
