# План: детальный просмотр ноды в QueriesNavigation (Schema / Preview / Meta / View)

## Контекст

В коммите `71124b55` в виджет [`QueriesNavigation`](src/widgets/QueriesNavigation/QueriesNavigation.tsx:49)
добавлены список кластеров ([`ClustersList`](src/modules/ClustersList/ClustersList.tsx:23))
и список нод ([`NavigationItemsList`](src/modules/NavigationItemsList/NavigationItemsList.tsx:31)).
Сейчас виджет полностью контролируемый: состояние навигации описывается
[`NavigationLocation`](src/types/navigation.ts:3) = `{cluster, path}`, а тело выбирается
через флаг `isClustersView = !location.cluster`.

Нужно: при клике на ноду (в макете — таблицу) открывать детальный экран, содержащий:

- хлебные крошки как в остальной навигации;
- 4 таба: **Schema / Preview / Meta / View**;
- элемент поиска;
- контент текущего таба (в этой итерации — заглушки).

Дополнительное требование: визуализация должна быть не только у таблиц, но и у файлов
разного типа. Значит, архитектура должна диспетчеризовать по типу ноды, причём
потребитель должен иметь возможность переопределять и расширять эту диспетчеризацию.

## Референс и вывод

Эталон — `NavigationBody` из `ytsaurus-ui`: тело навигации выбирается через
`switch (nodeType)` по веткам `Tree / Table / Cluster / Loading / Error`.

Отличие нашего случая: `querieskit` — переиспользуемая **контролируемая** библиотека,
а не приложение с Redux и заранее известным набором типов. Поэтому тот же принцип
«диспетчеризация по типу ноды» выносим из внутреннего `switch` в **композируемый
резолвер**: дефолт живёт в библиотеке, а потребитель может переопределить/расширить его
для своих типов нод — без правок внутри библиотеки. «Хром» детального экрана
(крошки + табы + поиск + слот контента) остаётся единым для любого типа.

## Архитектура

### 1. Внутренний body-resolver (по мотивам ytsaurus)

Вместо булева `isClustersView` вычисляем дискриминированное тело виджета
(чистая функция над пропсами), с приоритетом:

```text
loading → error → details (открыта нода) → clusters (нет cluster) → items
```

Тип (внутренний, не обязательно публичный):

```ts
type NavigationBody<TItem, TCluster> =
    | {type: 'loading'}
    | {type: 'error'; content: React.ReactNode}
    | {type: 'details'; item: TItem}
    | {type: 'clusters'}
    | {type: 'items'};
```

Это делает текущую логику явной и расширяемой, повторяя идею `switch (nodeType)`,
но без хардкода набора типов.

### 2. Единый «хром» детального экрана — модуль `NavigationDetail`

Новый модуль [`src/modules/NavigationDetail`](src/modules/NavigationDetail) собирает
переиспользуемые части:

- [`NavigationHeader`](src/modules/NavigationHeader/NavigationHeader.tsx:15) — крошки
  ([`Breadcrumbs`](src/components/Breadcrumbs/Breadcrumbs.tsx:23)) + actions
  (экспорт / открыть в новой вкладке) — переиспользуется как есть;
- табы на `@gravity-ui/uikit` (`TabProvider` / `TabList` / `Tab`), управление через
  `value` / `onUpdate`;
- элемент поиска [`SearchWithButtons`](src/components/SearchWithButtons/SearchWithButtons.tsx:21)
  (опционально, по конфигу);
- слот контента активного таба.

Активный таб и значение поиска модуль держит во внутреннем состоянии (uncontrolled),
с возможностью управления снаружи через опциональные пропы. Для этой итерации
достаточно внутреннего состояния.

Структура (по [`AGENTS.md`](AGENTS.md:1)):

```text
modules/
  NavigationDetail/
    NavigationDetail.tsx
    NavigationDetail.scss
    internal/
      NavigationDetailTabs.tsx   # тонкая обёртка над uikit Tabs по массиву табов
    i18n/                        # если появятся собственные строки
    index.ts
```

Крошки в детальном экране строятся из пути открытой ноды: в `NavigationHeader`
передаём `location = {cluster, path: openedItem.path}`, последний сегмент — имя ноды.
Клик по не-последней крошке закрывает детальный экран и переходит в папку
(вызов `onUpdate` + сброс `openedItem`).

### 3. Диспетчеризация по типу ноды — композируемый резолвер `resolveDetail`

Потребитель описывает визуализацию конкретной ноды. Библиотека даёт единый хром,
потребитель — набор табов/поиск/контент под тип. Ключевое требование: потребитель
должен иметь возможность **переопределять/расширять** дефолтную диспетчеризацию,
добавляя собственные виды для тех или иных типов нод.

Типы (в [`src/types/navigation.ts`](src/types/navigation.ts:1)):

```ts
export type NavigationDetailTab = {
    id: string;
    title: string;
    content: React.ReactNode; // в этой итерации — заглушка
    hidden?: boolean;
    disabled?: boolean;
};

export type NavigationDetailConfig = {
    tabs: NavigationDetailTab[];
    defaultTab?: string;
    hasSearch?: boolean;
    searchPlaceholder?: string;
    actions?: NavigationHeaderAction[];
};

// Диспетчеризация по типу ноды. undefined => для этой ноды нет детального вида
// (нода не «открывается», ведёт себя как раньше).
export type ResolveNavigationDetail<T extends NavigationItem = NavigationItem> = (
    item: T,
) => NavigationDetailConfig | undefined;

// Фабрика конфига для конкретного типа ноды (элемент реестра).
export type NavigationDetailConfigFactory<T extends NavigationItem = NavigationItem> = (
    item: T,
) => NavigationDetailConfig;
```

#### Композиция: дефолт + переопределение потребителем

Библиотека предоставляет **дефолтный резолвер** по `kind` и фабрику для его расширения,
чтобы потребитель добавлял свои виды, не переписывая всё с нуля.

Хелпер `createNavigationDetailResolver` ([`src/helpers`](src/helpers)):

```ts
// Реестр «kind → фабрика конфига». Переданный частичный реестр мёржится с дефолтным.
export const createNavigationDetailResolver = <T extends NavigationItem = NavigationItem>(
    registry?: Partial<Record<NavigationItemKind, NavigationDetailConfigFactory<T>>>,
    fallback?: NavigationDetailConfigFactory<T>,
): ResolveNavigationDetail<T> => {
    const merged = {...defaultDetailRegistry, ...registry};
    return (item) => {
        const factory = (item.kind && merged[item.kind]) ?? fallback;
        return factory?.(item);
    };
};
```

Сценарии потребителя:

- **добавить свой тип:** `createNavigationDetailResolver({file: myFileFactory})`
  — `table` остаётся дефолтным, `file` — кастомный;
- **переопределить дефолт:** передать свою фабрику под существующий `kind`
  (`{table: myTableFactory}`) — она перекрывает дефолтную;
- **fallback для неизвестных типов:** второй аргумент фабрики;
- **полный контроль:** передать в виджет собственную функцию `resolveDetail`
  целиком; при желании делегировать дефолту:
  `const base = createNavigationDetailResolver();`
  `resolveDetail = (item) => item.kind === 'special' ? specialConfig : base(item);`.

Дефолтный реестр `defaultDetailRegistry` содержит как минимум `table` с 4 табами
Schema/Preview/Meta/View и заглушечным контентом
([`src/helpers/createTableDetailConfig.ts`](src/helpers)).

Так «диспетчеризация по типу» (идея ytsaurus `switch (nodeType)`) остаётся
расширяемой снаружи: дефолт — в библиотеке, переопределение/добавление — у потребителя.

### 4. Открытие/закрытие детального экрана (состояние)

`NavigationLocation` НЕ трогаем (чтобы не усложнять `Breadcrumbs`/`PathEditor` и
не смешивать навигацию по папкам с просмотром ноды). Вводим отдельный
контролируемый проп открытой ноды:

- `openedItem?: TItem` — какая нода открыта (детальный экран рендерится, если задан);
- `onItemOpen?: (item: TItem) => void` — вызывается при клике на «открываемую» ноду.

Логика клика в виджете (расширение текущего `handleItemClick`):

- если `item.hasChildren` → навигация внутрь (как сейчас, `onUpdate`);
- иначе, если `resolveDetail(item)` вернул конфиг → `onItemOpen(item)`
  (потребитель выставляет `openedItem`);
- в любом случае вызывается пользовательский `onItemClick`.

Закрытие: клик по крошке-папке или по родителю → `onUpdate(...)` + потребитель
сбрасывает `openedItem` (виджет сигнализирует об этом через `onUpdate`; при
необходимости добавим явный `onCloseDetail`).

## Изменения по файлам

### Типы — [`src/types/navigation.ts`](src/types/navigation.ts:1)

- Добавить `NavigationDetailTab`, `NavigationDetailConfig`, `NavigationDetailConfigFactory`,
  `ResolveNavigationDetail`.

### Хелперы — `src/helpers/`

- `createNavigationDetailResolver.ts` — фабрика композируемого резолвера + `defaultDetailRegistry`.
- `createTableDetailConfig.ts` — дефолтная фабрика для `kind: 'table'`
  (4 таба Schema/Preview/Meta/View с заглушками).

### Модуль — `src/modules/NavigationDetail/`

- `NavigationDetail.tsx` — принимает `item`, `config`, `location`, `onUpdate`, actions;
  рендерит `NavigationHeader` + табы + поиск + контент.
- `internal/NavigationDetailTabs.tsx` — рендер `TabProvider/TabList/Tab` по массиву табов.
- `NavigationDetail.scss`, `index.ts`.

### Виджет — [`src/widgets/QueriesNavigation/QueriesNavigation.tsx`](src/widgets/QueriesNavigation/QueriesNavigation.tsx:49)

- Добавить пропы `openedItem?`, `onItemOpen?`, `resolveDetail?`.
- Реализовать внутренний body-resolver и рендерить `NavigationDetail` для ветки `details`.
- Расширить `handleItemClick` (навигация vs открытие детали).
- В детальном режиме прятать общий поиск/списки, показывать `NavigationDetail`
  (свой поиск живёт внутри модуля).

### i18n

- Строки табов/поиска детального экрана: если это дефолт таблицы — держать в
  соответствующем месте (виджет `QueriesNavigation` i18n или отдельный keyset модуля
  по правилам [`plans/i18n-rules.md`](plans/i18n-rules.md:1)). Уточняется на ревью.

### Barrel-экспорты

- [`src/modules/index.ts`](src/modules/index.ts:1) — `NavigationDetail` + типы пропсов.
- [`src/index.ts`](src/index.ts:1) — новые публичные типы из `types/navigation` уже идут
  через `export * from './types/navigation'`; добавить экспорт хелперов
  `createNavigationDetailResolver` / `createTableDetailConfig`.

### Stories

- Добавить в [`QueriesNavigation.stories.tsx`](src/widgets/QueriesNavigation/QueriesNavigation.stories.tsx:1)
  сценарий с `openedItem` + `resolveDetail` (клик по table открывает детальный экран
  с 4 табами-заглушками и поиском) и сценарий кастомного резолвера
  (`createNavigationDetailResolver({file: ...})`).
- При необходимости — отдельная story для модуля `NavigationDetail`.

## Открытые вопросы для ревью

1. Именование: модуль `NavigationDetail` vs `NavigationNodeView`; проп `openedItem`
   vs `activeItem`; резолвер `resolveDetail` vs `getNodeView`; хелпер
   `createNavigationDetailResolver`.
2. Состояние открытой ноды: отдельный проп `openedItem` (рекомендуется) vs расширение
   `NavigationLocation` дискриминатором `view: 'list' | 'detail'`.
3. Управление активным табом/поиском: uncontrolled внутри модуля (рекомендуется для
   итерации) vs контролируемые пропы сразу.
4. Экспортировать ли `createTableDetailConfig` из публичного API или держать как
   внутреннюю часть дефолтного реестра (наружу — только `createNavigationDetailResolver`).
5. Где хранить i18n строк дефолтных табов таблицы.

## Порядок реализации

1. Добавить типы `NavigationDetailTab` / `NavigationDetailConfig` /
   `NavigationDetailConfigFactory` / `ResolveNavigationDetail`
   в [`src/types/navigation.ts`](src/types/navigation.ts:1).
2. Добавить хелперы `createTableDetailConfig` (дефолт таблицы) и
   `createNavigationDetailResolver` (композируемый резолвер + `defaultDetailRegistry`).
3. Создать модуль `NavigationDetail` (хром: header + tabs + search + слот контента),
   `internal/NavigationDetailTabs`, `.scss`, `index.ts`.
4. Реализовать body-resolver и ветку `details` в
   [`QueriesNavigation`](src/widgets/QueriesNavigation/QueriesNavigation.tsx:49);
   добавить пропы `openedItem` / `onItemOpen` / `resolveDetail`; расширить `handleItemClick`.
5. Обновить barrel-экспорты (`modules/index.ts`, `src/index.ts` — хелперы).
6. Добавить/обновить i18n согласно [`plans/i18n-rules.md`](plans/i18n-rules.md:1).
7. Добавить stories (клик по table → детальный экран; кастомный резолвер).
8. Проверить сборку и Storybook.
