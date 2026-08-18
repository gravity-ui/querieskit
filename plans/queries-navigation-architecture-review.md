# Архитектурный анализ `QueriesNavigation` и дочерних компонент

Область анализа: состояние кода после коммита `bcaa6e4c` (анализировалось текущее
состояние рабочей директории — прямого доступа к git-diff в среде нет).

Затронутые единицы:

- Виджет [`QueriesNavigation`](src/widgets/QueriesNavigation/QueriesNavigation.tsx:51) + хелперы
  [`createNavigationDetailResolver`](src/widgets/QueriesNavigation/helpers/createNavigationDetailResolver.ts:13),
  [`createTableDetailConfig`](src/widgets/QueriesNavigation/helpers/createTableDetailConfig.tsx:45),
  [`createEmptyDetailConfig`](src/widgets/QueriesNavigation/helpers/createEmptyDetailConfig.ts:5).
- Модули: [`NavigationDetail`](src/modules/NavigationDetail/NavigationDetail.tsx:39),
  [`NavigationHeader`](src/modules/NavigationHeader/NavigationHeader.tsx:15),
  [`ClustersList`](src/modules/ClustersList/ClustersList.tsx:23),
  [`NavigationItemsList`](src/modules/NavigationItemsList/NavigationItemsList.tsx:31),
  [`NavigationSchema`](src/modules/NavigationSchema/NavigationSchema.tsx:36),
  [`NavigationPreview`](src/modules/NavigationPreview/NavigationPreview.tsx:34),
  [`NavigationMeta`](src/modules/NavigationMeta/NavigationMeta.tsx:25),
  [`NavigationView`](src/modules/NavigationView/NavigationView.tsx:24).
- Типы: [`src/types/navigation.ts`](src/types/navigation.ts:1).

Общая оценка: архитектура зрелая и последовательная. Уровни `components → modules → widgets`
выдержаны, generic-типизация сквозная, controlled/uncontrolled паттерн реализован. Ниже —
конкретные замечания, сгруппированные по 7 пунктам задачи.

---

## 1. Соответствие стилю проекта и Gravity UI

Что хорошо:

- Везде используется `bem-cn-lite` с префиксом `qp-*`, компоновка через `Flex`, spacing через
  `gap`, что совпадает с остальным проектом.
- Detail-табы построены на `SegmentedRadioGroup`, meta-скелетоны на `Skeleton`, секции на
  `Disclosure` — всё нативные примитивы Gravity UI, без самописных аналогов.

Замечания:

- **Инлайн-стили вместо SCSS/токенов в продакшн-коде.** В [`buildSchemaColumns`](src/modules/NavigationSchema/helpers/buildSchemaColumns.tsx:22)
  используется `style={{display:'inline-flex', alignItems:'center', gap:4}}`. По стилю проекта
  раскладка/отступы задаются через `Flex gap` или `--g-spacing-*` в `.scss`. Инлайн-`gap:4` стоит
  заменить на `Flex gap` или CSS-класс с токеном. (Инлайн-стили и текстовые заглушки в сторибуках
  оставляем как есть — для демо это допустимо.)
- **Пустой `title: ''` в конфиге таба.** В [`createEmptyDetailConfig`](src/widgets/QueriesNavigation/helpers/createEmptyDetailConfig.ts:9)
  создаётся таб с пустым заголовком — формально валидация i18n не срабатывает (строка не идёт
  через `t`), но семантически это «фейковый» таб только ради контейнера. См. п.4.

## 2. Размещение новых компонент по уровням

В целом соответствует правилам из [`AGENTS.md`](AGENTS.md:1):

- Списковые/скомпонованные блоки (`ClustersList`, `NavigationItemsList`, `NavigationDetail`,
  `NavigationSchema/Preview/Meta/View`) корректно лежат в `modules`.
- Внутренние части (`ClusterRow`, `NavigationItemRow`, `NavigationDetailTabs`,
  `NavigationViewSectionItem`) — в `internal/`, что верно.
- Хелперы конфигов (`createTableDetailConfig` и пр.) — на уровне виджета, т.к. содержат
  widget-specific i18n. Это оправданно.

Замечания:

- **`ClusterRow` и `NavigationItemRow` реэкспортируются как публичные из
  [`src/modules/index.ts`](src/modules/index.ts:17), но физически лежат в `internal/`.**
  Противоречие: либо это публичный API (тогда вынести из `internal/` на уровень модуля или в
  `components`, т.к. они атомарны и переиспользуются в сторибуке `CustomRows`), либо это внутренняя
  деталь (тогда убрать из barrel). Судя по использованию в кастомном рендере — это публичный
  контракт, и их правильнее поднять до `components` (у них стабильный props-контракт, отдельное
  использование есть).
- **`NavigationDetailTabs` в `internal/` — ок**, но у него нет `index.ts` и он импортируется по
  прямому пути. По правилу «каждая единица — папка с `index.ts`» это допустимо для internal, но
  стоит свериться на консистентность с другими internal-частями.
- **`NavigationDetail` не экспортирует `NavigationDetailConfig`-фабрики** из своего `index.ts`,
  тогда как связанные типы живут в `types/navigation`. Это нормально, но стоит проверить, что
  потребитель может собрать конфиг детали без импортов из `widgets`.

## 3. Кандидаты на вынос в хелперы

- **`visibleActions`-рендер дублируется.** Логика «отфильтровать по `hidden` → отрисовать список
  `Button view=flat size=s` с `title/aria-label/disabled/qa`» повторяется в
  [`NavigationHeader`](src/modules/NavigationHeader/NavigationHeader.tsx:22) и
  [`NavigationViewSectionItem`](src/modules/NavigationView/internal/NavigationViewSectionItem.tsx:29).
  Кандидат на общий компонент `ActionButtons`/`NavigationActions` (в `components`) с generic-типом
  экшена, чтобы `NavigationHeaderAction` и `NavigationViewSectionAction` покрывались одним рендером.
- **Единый тип «action».** См. п.6 — `NavigationHeaderAction` и `NavigationViewSectionAction`
  отличаются только сигнатурой `onClick`. Можно ввести generic `NavigationAction<TCtx>`.
- **`getInitialTab` / фильтр видимых табов.** В [`NavigationDetail`](src/modules/NavigationDetail/NavigationDetail.tsx:30)
  `config.tabs.filter(t => !t.hidden)` считается дважды (в `getInitialTab` и в `useMemo`). Можно
  вынести хелпер `getVisibleTabs`/`resolveInitialTab` в `NavigationDetail/helpers/`.
- **SKELETON-заглушка.** Блок «N `Skeleton` в колонку» полностью повторяется в
  [`NavigationMeta`](src/modules/NavigationMeta/NavigationMeta.tsx:47) и
  [`NavigationView`](src/modules/NavigationView/NavigationView.tsx:40) (одна и та же
  `SKELETON_ROWS_COUNT = 4`). Кандидат на общий `ListSkeleton`/`SkeletonRows` в `components`.

## 4. Удобство использования, гибкость переопределения и типизация

Сильные стороны:

- Сквозные дженерики `<TItem, TCluster>`, `<TColumn>`, `<TRow>` дают типобезопасное расширение
  строк/колонок.
- Паттерн `renderRowItem` + fallback на дефолтный ряд (`ClustersList`, `NavigationItemsList`) —
  гибкий и предсказуемый.
- Controlled/uncontrolled в [`NavigationDetail`](src/modules/NavigationDetail/NavigationDetail.tsx:51)
  реализован аккуратно (search и activeTab независимо).
- `view`-проп у detail-модулей (`tableColumns`/`extraColumns`/`render`) — хороший механизм
  переопределения таблиц.

Замечания:

- **Дженерик теряется в detail-резолверах.** В [`createTableDetailConfig`](src/widgets/QueriesNavigation/helpers/createTableDetailConfig.tsx:19)
  резолверы типизированы как `NavigationSchemaResolver<T>`, но возвращают `NavigationSchemaConfig`
  без `<TColumn>`. Из-за этого `extraColumns`-типизация кастомных колонок в конфиге таблицы теряется.
  Стоит пробросить `TColumn`/`TRow` до `NavigationSchema data`.
- **`createEmptyDetailConfig` через `React.createElement`.** Файл `.ts`, поэтому используется
  `createElement` вместо JSX. Логичнее переименовать в `.tsx` и вернуть JSX, а «пустое состояние»
  моделировать не фейковым табом с `title:''`, а отдельной веткой в `NavigationDetail`
  (например, `config.empty?: ReactNode` или рендер `EmptyContent`, когда `tabs` пуст).
- **`[key: string]: unknown` в типах.** `NavigationSchemaColumn` и `NavigationMetaItem` имеют
  индексную сигнатуру `[key: string]: unknown`. Это ослабляет типизацию расширений (лучше решать
  через дженерик `T extends ...`, который и так есть). Возможная избыточность — см. п.6.
- **`resolvedDetailActions = detailActions ?? actions`** в
  [`QueriesNavigation`](src/widgets/QueriesNavigation/QueriesNavigation.tsx:86): fallback header-экшенов
  на detail неочевиден. Стоит задокументировать поведение в типе `NavigationDetailPanelConfig`.

## 5. Дублирование кода

- **`buildPreviewColumns` и `buildViewColumns` идентичны.**
  [`buildPreviewColumns`](src/modules/NavigationPreview/helpers/buildPreviewColumns.tsx:5) и
  [`buildViewColumns`](src/modules/NavigationView/helpers/buildViewColumns.tsx:5) — побайтово
  одинаковая функция (маппинг `columns → Column` с заглушкой `value_empty`). Разнесены только по
  разным i18n. Кандидат на общий хелпер (например, `buildStringColumns` в `src/helpers/` или
  `components`), принимающий функцию перевода/`emptyText`.
- **Логика «пустого значения» повторяется трижды.** `value === undefined || null || ''` есть в
  `buildPreviewColumns`, `buildViewColumns`, [`buildMetaGroups`](src/modules/NavigationMeta/helpers/buildMetaGroups.tsx:15)
  (`isEmptyValue`). Вынести единый `isEmptyValue` в `src/helpers/`.
- **Скелетоны и action-рендер** — дублирование описано в п.3.
- **Блок `errorContent → <Text color="danger">`** повторяется в Schema/Preview/Meta/View. Можно
  ввести общий `DetailError`/использовать существующий паттерн вывода ошибки.

## 6. Оценка новых типов (избыточность/дублирование)

Файл [`src/types/navigation.ts`](src/types/navigation.ts:1) большой и в целом хорошо
структурирован, но есть избыточность:

- **`NavigationViewRow = NavigationPreviewRow`** ([`строка 109`](src/types/navigation.ts:109)) — псевдоним.
  А `NavigationViewConfig`/`NavigationPreviewConfig` очень близки (secions vs rows). Стоит оценить,
  не свести ли preview к частному случаю view, либо явно задокументировать, что это осознанно разные
  сущности.
- **`NavigationHeaderAction` vs `NavigationViewSectionAction`** — отличаются только типом аргумента
  `onClick` (`NavigationLocation` против `NavigationViewSection`). Кандидат на generic
  `NavigationAction<TArg>` c общими полями `id/title/content/hidden/disabled/qa`.
- **Четыре почти одинаковых `*Config`** (`Schema/Preview/Meta/View`) с общими полями
  `loading/loaded/errorContent`. Можно ввести базовый `NavigationAsyncConfig` и расширять его
  (`& {columns}`, `& {rows}`, `& {groups}`, `& {sections}`).
- **`ResolveNavigationDetail` vs `NavigationDetailConfigFactory`** — обе `(item) => Config`,
  различие только в `| undefined`. Возможно, достаточно одного типа с опциональностью на месте
  использования.
- **`NavigationPreviewCell = ReactNode` и `NavigationMetaValue = ReactNode`** — псевдонимы одного
  и того же. Либо один общий `NavigationCellValue`, либо убрать псевдонимы.
- **Индексные сигнатуры `[key: string]: unknown`** в `NavigationSchemaColumn`/`NavigationMetaItem`
  дублируют возможности дженериков — стоит выбрать один механизм расширения.

## 7. Оценка сторибуков (избыточность, объединение)

Наблюдения:

- **Повторяющиеся `Loading/Empty/Error`-стори у 4 detail-модулей.** У Schema, Preview, Meta, View
  практически идентичные state-стори. Их можно оставить (они полезны для autodocs), но mock-данные
  дублируются между сторибуками и [`QueriesNavigation.stories`](src/widgets/QueriesNavigation/QueriesNavigation.stories.tsx:148)
  (`TABLE_SCHEMA_COLUMNS`, `TABLE_PREVIEW_ROWS`, `TABLE_META_GROUPS`, `TABLE_VIEW_SECTIONS`
  повторяют данные модульных сторибуков). Кандидат на общий `story/mockData.ts`
  (как уже сделано в `DashboardCharts/story/mockData.ts` и `ChartEditor/story/mockData.ts`).
- **`CustomColumns`-стори у Schema и Preview идентичны** (тот же `lock`-паттерн с `Label`+`LockIcon`).
  Можно объединить логически или вынести общий пример.
- **Кандидат на объединение в одно демо.** Отдельные `Loading`/`Empty`/`Error` можно объединить в
  одну «States»-стори через controls/args-матрицу, оставив `Default` и `Custom*` отдельными. Это
  сократит число стори без потери покрытия.
- **Несогласованность с гайдом структуры сторибуков.** Часть модулей (`ChartEditor`,
  `DashboardCharts`) держат стори в подпапке `story/` с `mockData.ts`, а Navigation-модули — рядом
  с компонентом. Стоит привести к единому подходу (вероятно `story/` + вынесенные моки).
- **Мелочь:** опечатки в mock-данных `QueriesNavigation.stories` (`tesdting`, `Prestable`) —
  косметика, но заметна в autodocs.

---

## Приоритизация правок (для последующей реализации в Code mode)

Высокий приоритет (дублирование/типобезопасность):

1. Объединить [`buildPreviewColumns`](src/modules/NavigationPreview/helpers/buildPreviewColumns.tsx:5)
   и [`buildViewColumns`](src/modules/NavigationView/helpers/buildViewColumns.tsx:5) в один хелпер.
2. Вынести общий `isEmptyValue` в `src/helpers/`.
3. Пробросить дженерики `TColumn`/`TRow` в резолверах
   [`createTableDetailConfig`](src/widgets/QueriesNavigation/helpers/createTableDetailConfig.tsx:45).
4. Решить статус `ClusterRow`/`NavigationItemRow`: поднять в `components` либо убрать из
   публичного barrel.

Средний приоритет (переиспользование/типы):

5. Ввести generic `NavigationAction<TArg>` и общий рендер экшенов
   (`NavigationHeader` + `NavigationViewSectionItem`).
6. Ввести базовый `NavigationAsyncConfig` (`loading/loaded/errorContent`) и общий `SkeletonRows`.
7. Убрать псевдонимы-дубликаты типов (`NavigationPreviewCell`/`NavigationMetaValue`,
   `NavigationViewRow`) и пересмотреть индексные сигнатуры.

Низкий приоритет (стиль/сторибуки):

8. Вынести mock-данные detail-модулей в общий `story/mockData.ts`, объединить state-стори,
   унифицировать расположение сторибуков.
9. Заменить инлайн-стиль `gap:4` в продакшн-хелпере [`buildSchemaColumns`](src/modules/NavigationSchema/helpers/buildSchemaColumns.tsx:22)
   на `Flex gap` / CSS-класс с токеном (сторибуков не касается).
10. Переосмыслить `createEmptyDetailConfig` (JSX + отдельная ветка пустого состояния вместо
    таба с `title:''`).

---

Примечание по процессу: анализ выполнен по текущему состоянию файлов. Если нужно строго сверить
именно diff коммита `bcaa6e4c` (какие строки добавлены/удалены), это удобнее сделать в среде с
доступом к `git`/`arc` — тогда часть замечаний можно будет привязать к конкретным ханкам.
