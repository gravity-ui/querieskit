# План трёхуровневой структуры QueriesKit

## Контекст

Текущая структура держит почти всё внутри [`src/components/QueriesHistory`](src/components/QueriesHistory). Из-за этого [`QueriesHistory`](src/components/QueriesHistory/QueriesHistory.tsx:28) одновременно выглядит и как публичный виджет, и как контейнер для всех внутренних частей: [`HistoryList`](src/components/QueriesHistory/HistoryList.tsx:26), [`HistoryHeader`](src/components/QueriesHistory/HistoryHeader/HistoryHeader.tsx:13), [`HistoryRow`](src/components/QueriesHistory/HistoryRow/HistoryRow.tsx:17), [`HistoryRowHeader`](src/components/QueriesHistory/HistoryRow/HistoryRowHeader.tsx:19), [`HistoryDuration`](src/components/QueriesHistory/HistoryRow/HistoryDuration.tsx), [`QueryStatusIcon`](src/components/QueriesHistory/HistoryRow/QueryStatusIcon.tsx:27), [`HistoryRowContent`](src/components/QueriesHistory/HistoryRowContent.tsx:1), [`HistoryGroupHeader`](src/components/QueriesHistory/HistoryGroupHeader.tsx:1).

Библиотека `@gravity-ui/querieskit` находится в начале развития: сейчас в ней один публичный виджет ([`QueriesHistory`](src/components/QueriesHistory/QueriesHistory.tsx:28)), но в дальнейшем планируется добавление ещё многих виджетов. Это подтверждает целесообразность трёхуровневого деления сразу, а не откладывания его "на потом".

Также обнаружен реальный баг: [`src/components/index.ts`](src/components/index.ts:1) содержит самоссылающийся экспорт `export * from '.'`, который не реэкспортирует ничего полезного из [`src/components/QueriesHistory/index.ts`](src/components/QueriesHistory/index.ts:1). Это нужно исправить в рамках реструктуризации.

Цель — сделать структуру библиотеки читаемой для потребителей: отдельно базовые building blocks, отдельно сборки из них, отдельно готовые виджеты — с расчётом на рост числа виджетов.

## Модель трёх уровней

1. [`src/components`](src/components) — базовые атомарные или малые доменные компоненты.
2. [`src/modules`](src/modules) — компоненты, собирающие несколько базовых компонентов в переиспользуемый сценарный блок внутри одного виджета.
3. [`src/widgets`](src/widgets) — готовые продуктовые виджеты, которые можно поставить в приложение как цельный feature.

### Почему `modules`, а не `compositions`/`blocks`

- `compositions` точно передаёт смысл, но менее привычно в JS/React-экосистеме.
- `blocks` короче и привычнее для UI-библиотек в целом, но в этом проекте уже активно используется BEM через `bem-cn-lite` (`const block = cn('qp-history-row')` в [`HistoryRow.tsx`](src/components/QueriesHistory/HistoryRow/HistoryRow.tsx:15), [`HistoryList.tsx`](src/components/QueriesHistory/HistoryList.tsx:24) и др.) — термин "block" уже занят под BEM-блок в CSS-классах, и папка `src/blocks` создавала бы двусмысленность.
- `modules` — нейтральный и привычный термин, не конфликтует с BEM-терминологией проекта и не тянет за собой чужую методологию (Atomic Design, Feature-Sliced Design), названия которой не совсем подходят под текущие сущности.

Главное ограничение: не нужно автоматически выносить каждую маленькую внутреннюю часть в публичный атом. Атом должен попадать в [`src/components`](src/components), только если потребитель библиотеки действительно может использовать его отдельно и если у него есть стабильный props-контракт.

## Классификация текущих компонентов

### Базовые компоненты

В [`src/components`](src/components) стоит держать малые компоненты, которые не управляют большим сценарием:

- [`QueryStatusIcon`](src/components/QueriesHistory/HistoryRow/QueryStatusIcon.tsx:27) — хороший кандидат в base component.
- [`QueryDuration`](src/components/QueryDuration/QueryDuration.tsx) — base component для отображения длительности запроса. Переименован из `HistoryDuration` — может переиспользоваться за пределами `QueriesHistory`. Использует хук [`useQueryDuration`](src/components/QueryDuration/useQueryDuration.ts), который лежит рядом.
- [`HistoryRowMenu`](src/components/QueriesHistory/HistoryRow/HistoryRowMenu.tsx) — скорее малый доменный component, но его можно оставить рядом с [`HistoryRow`](src/modules/HistoryRow), если самостоятельного использования почти нет.
- [`HistoryRowHeader`](src/components/QueriesHistory/HistoryRow/HistoryRowHeader.tsx:19) — пограничный случай: если header нужен отдельно, он может быть component; если только как часть строки, лучше держать внутри [`src/modules/HistoryRow`](src/modules/HistoryRow).
- [`HistoryGroupHeader`](src/components/QueriesHistory/HistoryGroupHeader.tsx:1) — маленький визуальный компонент заголовка группы, физически сейчас лежит в корне `QueriesHistory/`, используется только из [`HistoryRowContent`](src/components/QueriesHistory/HistoryRowContent.tsx:1).

### Модули

В [`src/modules`](src/modules) стоит держать блоки, которые собирают несколько components и задают сценарий взаимодействия внутри конкретного виджета:

- [`HistoryHeader`](src/components/QueriesHistory/HistoryHeader/HistoryHeader.tsx:13) — сборка поиска, фильтра и действий над историей.
- [`HistoryList`](src/components/QueriesHistory/HistoryList.tsx:26) — сборка списка, групп, строк, selection, editing и render pipeline. Включает внутренние [`HistoryRowContent`](src/components/QueriesHistory/HistoryRowContent.tsx:1) и хелпер [`prepareRowData`](src/components/QueriesHistory/helpers/prepareRowData.ts).
- [`HistoryRow`](src/components/QueriesHistory/HistoryRow/HistoryRow.tsx:17) — сборка строки из статуса, title/header, duration, metadata, checkbox и меню.

### Виджеты

В [`src/widgets`](src/widgets) стоит держать законченные feature-блоки:

- [`QueriesHistory`](src/components/QueriesHistory/QueriesHistory.tsx:28) — готовый виджет истории запросов, который собирает [`HistoryHeader`](src/modules/HistoryHeader), [`HistoryList`](src/modules/HistoryList), i18n и widget-level настройки.
- В будущем сюда же будут добавляться новые виджеты библиотеки (например, редактор запроса, результат запроса и т.п.) по той же трёхуровневой схеме.

## Рекомендуемая целевая структура

```text
src/
  components/
    QueryStatusIcon/
      QueryStatusIcon.tsx
      QueryStatusIcon.scss
      index.ts
    QueryDuration/
      QueryDuration.tsx
      QueryDuration.scss
      useQueryDuration.ts
      index.ts
    HistoryGroupHeader/
      HistoryGroupHeader.tsx
      HistoryGroupHeader.scss
      index.ts
  modules/
    HistoryHeader/
      HistoryHeader.tsx
      internal/
        HistorySearch.tsx
        HistoryFilter.tsx
      index.ts
    HistoryRow/
      HistoryRow.tsx
      HistoryRowHeader.tsx
      HistoryRowMenu.tsx
      HistoryRow.scss
      index.ts
    HistoryList/
      HistoryList.tsx
      internal/
        HistoryRowContent.tsx
      helpers/
        prepareRowData.ts
      index.ts
  widgets/
    QueriesHistory/
      QueriesHistory.tsx
      i18n/
      index.ts
  types/
    history.ts
  helpers/
    time.ts
  index.ts
```

## Почему не слишком мелко

Это не слишком мелко, потому что деление идёт по уровню ответственности:

- [`src/components`](src/components) отвечает за малые визуальные building blocks.
- [`src/modules`](src/modules) отвечает за переиспользуемые сценарные блоки внутри виджета.
- [`src/widgets`](src/widgets) отвечает за готовые feature-пакеты.

Но будет слишком мелко, если вынести [`HistorySearch`](src/components/QueriesHistory/HistoryHeader/HistorySearch.tsx:16), [`HistoryFilter`](src/components/QueriesHistory/HistoryHeader/HistoryFilter.tsx:16), [`HistoryRowHeader`](src/components/QueriesHistory/HistoryRow/HistoryRowHeader.tsx:19), [`HistoryRowMenu`](src/components/QueriesHistory/HistoryRow/HistoryRowMenu.tsx) в top-level components только ради симметрии. Если эти части не имеют самостоятельного сценария использования, лучше оставить их в [`internal`](src/modules/HistoryHeader/internal) или рядом с модулем [`HistoryRow`](src/modules/HistoryRow).

## Публичные entrypoints

Минимальный публичный API:

- [`src/index.ts`](src/index.ts:1) — общий экспорт библиотеки.
- [`src/components/index.ts`](src/components/index.ts:1) — базовые components.
- [`src/modules/index.ts`](src/modules/index.ts) — модули.
- [`src/widgets/index.ts`](src/widgets/index.ts) — готовые виджеты.

Если package exports будут настраиваться отдельно, можно дать потребителям импортировать уровни напрямую:

- [`src/components/index.ts`](src/components/index.ts:1) для base components.
- [`src/modules/index.ts`](src/modules/index.ts) для modules.
- [`src/widgets/index.ts`](src/widgets/index.ts) для widgets.

## Предлагаемый порядок реализации

1. Создать папки [`src/components`](src/components), [`src/modules`](src/modules), [`src/widgets`](src/widgets) как публичные уровни библиотеки.
2. Перенести [`QueriesHistory`](src/components/QueriesHistory/QueriesHistory.tsx:28) и его i18n в [`src/widgets/QueriesHistory`](src/widgets/QueriesHistory).
3. Перенести [`HistoryHeader`](src/components/QueriesHistory/HistoryHeader/HistoryHeader.tsx:13), [`HistoryList`](src/components/QueriesHistory/HistoryList.tsx:26) (вместе с [`HistoryRowContent`](src/components/QueriesHistory/HistoryRowContent.tsx:1) и [`prepareRowData`](src/components/QueriesHistory/helpers/prepareRowData.ts)), [`HistoryRow`](src/components/QueriesHistory/HistoryRow/HistoryRow.tsx:17) в [`src/modules`](src/modules).
4. Вынести [`QueryStatusIcon`](src/components/QueryStatusIcon/QueryStatusIcon.tsx:27), [`QueryDuration`](src/components/QueryDuration/QueryDuration.tsx) (вместе с хуком [`useQueryDuration`](src/components/QueryDuration/useQueryDuration.ts)) и [`HistoryGroupHeader`](src/components/HistoryGroupHeader/HistoryGroupHeader.tsx:1) в [`src/components`](src/components).
5. Оставить [`HistorySearch`](src/components/QueriesHistory/HistoryHeader/HistorySearch.tsx:16), [`HistoryFilter`](src/components/QueriesHistory/HistoryHeader/HistoryFilter.tsx:16), [`HistoryRowHeader`](src/components/QueriesHistory/HistoryRow/HistoryRowHeader.tsx:19), [`HistoryRowMenu`](src/components/QueriesHistory/HistoryRow/HistoryRowMenu.tsx) внутри соответствующих modules, пока нет явной потребности в самостоятельном использовании.
6. Обновить imports между уровнями: widgets импортируют modules и components, modules импортируют components, components не импортируют modules или widgets.
7. Исправить сломанный barrel-экспорт [`src/components/index.ts`](src/components/index.ts:1) (сейчас там `export * from '.'` — самоссылающийся экспорт) и создать корректные `index.ts` для всех трёх уровней.
8. Реэкспортировать публичные типы из [`src/types/history.ts`](src/types/history.ts:3) через [`src/index.ts`](src/index.ts:1), если они являются частью контракта.
9. Проверить сборку и storybook после переноса файлов (сейчас `.stories.tsx` файлов в проекте нет — добавить их отдельной задачей при необходимости).

## Итоговая рекомендация

Трёхуровневая структура [`components`](src/components) / [`modules`](src/modules) / [`widgets`](src/widgets) оправдана, так как библиотека находится в начале развития и в неё планируется добавление многих новых виджетов — закладывать деление по уровню абстракции нужно сразу, а не переделывать структуру повторно в будущем. При этом не стоит выносить каждую внутреннюю часть в top-level atom: маленькие детали должны становиться base components только при наличии самостоятельного публичного сценария использования.
