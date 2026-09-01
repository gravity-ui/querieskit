# Правила владения SCSS-стилями

Подробные правила для агентов, работающих со стилями в `@gravity-ui/querieskit`. Краткая обязательная выжимка находится в разделе [`## Styles`](../AGENTS.md) файла `AGENTS.md`.

## Структура

Каждый компонент, модуль или виджет, которому нужны стили, хранит одноимённый SCSS-файл рядом с файлом реализации и самостоятельно импортирует его:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.scss
  index.ts
```

```tsx
// Child.tsx
import cn from 'bem-cn-lite';

import './Child.scss';

const block = cn('qp-child');

export type ChildProps = {
    className?: string;
};

export const Child = ({className}: ChildProps) => (
    <div className={block(null, className)}>...</div>
);
```

```scss
// Child.scss
.qp-child {
  // Внутренние стили Child.
}
```

Если компоненту не нужны собственные стили, создавать пустой SCSS-файл не требуется.

## Flex-раскладка

Для flexbox-раскладки в приоритете компонент `Flex` из `@gravity-ui/uikit`. Если нужное поведение выражается его пропсами, следует задать направление, расстояние между детьми и выравнивание прямо в JSX, не дублируя их через `display: flex` в SCSS:

```tsx
import {Flex} from '@gravity-ui/uikit';

export const Parent = () => (
    <Flex direction="column" gap={2} alignItems="center">
        <Child />
        <AnotherChild />
    </Flex>
);
```

Не следует без необходимости заменять такую раскладку отдельным классом:

```scss
// Parent.scss — не нужно, если достаточно пропсов Flex
.qp-parent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--g-spacing-2);
}
```

SCSS остаётся допустимым, когда API `Flex` не может выразить требуемое поведение: например, для псевдоклассов, вложенных селекторов, BEM-модификаторов состояния или отдельных правил внешней геометрии дочернего компонента. В таких случаях продолжают действовать правила владения стилями и передачи `className`.

## Владение стилями

Компонент владеет своим внутренним оформлением: размерами и расположением собственных элементов, цветами, состояниями, внутренними отступами и своим BEM-блоком. Его SCSS импортируется из его же файла реализации, поэтому компонент корректно выглядит независимо от того, через какого родителя он был отрендерен.

Родитель владеет компоновкой своих детей: расположением относительно контейнера и соседних элементов, участием в grid/flex-раскладке и внешней геометрией, необходимой конкретному сценарию. Сначала следует использовать `Flex` и возможности его API, например `gap` и `alignItems`; для grid-раскладки — подходящий контейнер. Если стиль нужно применить непосредственно к корневому элементу ребёнка, родитель передаёт собственный BEM-элемент через `className`:

```tsx
// Parent.tsx
import cn from 'bem-cn-lite';

import {Child} from '../Child';
import './Parent.scss';

const block = cn('qp-parent');

export const Parent = () => <Child className={block('child')} />;
```

```scss
// Parent.scss
.qp-parent {
  &__child {
    flex-shrink: 0;
  }
}
```

`Child` обязан объединить переданный `className` со своим корневым классом, а не заменить один класс другим. Текущий пример такого взаимодействия — [`HistorySearchRow`](../src/modules/HistorySearchRow/HistorySearchRow.tsx), который передаёт `className={block('icon')}` в [`QueryStatusIcon`](../src/components/QueryStatusIcon/QueryStatusIcon.tsx), а правило внешней компоновки хранит в [`HistorySearchRow.scss`](../src/modules/HistorySearchRow/HistorySearchRow.scss).

## Запрещённый паттерн

Нельзя складывать собственные стили дочерних компонентов в один SCSS-файл родителя и рассчитывать, что они загрузятся только потому, что родитель импортирует этот файл:

```scss
// Parent.scss — запрещено
.qp-child {
  width: 100%;

  &__title {
    min-width: 0;
  }
}

.qp-another-child {
  padding: var(--g-spacing-2);
}
```

Такой подход связывает внешний вид ребёнка с конкретным родителем: при самостоятельном использовании или переносе ребёнка его стили не загрузятся. Родительский SCSS должен описывать BEM-блок родителя и его элементы, но не BEM-блоки самостоятельных дочерних компонентов.

В текущем коде есть исторические нарушения этого правила:

- [`ClustersList.scss`](../src/modules/ClustersList/ClustersList.scss) объявляет блок `.qp-cluster-row`, принадлежащий [`ClusterRow`](../src/components/ClusterRow/ClusterRow.tsx).
- [`NavigationItemsList.scss`](../src/modules/NavigationItemsList/NavigationItemsList.scss) объявляет блок `.qp-navigation-item-row`, принадлежащий [`NavigationItemRow`](../src/components/NavigationItemRow/NavigationItemRow.tsx).

Эти места зафиксированы как анти-примеры и не должны использоваться как образец для нового кода. Их исправление выполняется отдельно.

## Чек-лист

1. У каждого компонента со своими стилями есть одноимённый SCSS-файл рядом с `.tsx`.
2. Компонент самостоятельно импортирует свой SCSS-файл.
3. SCSS компонента объявляет его собственный BEM-блок, а не блоки самостоятельных дочерних компонентов.
4. Внутреннее оформление ребёнка остаётся у ребёнка; родитель описывает только компоновку своего сценария.
5. Flexbox-раскладка сначала выражается через `Flex` из `@gravity-ui/uikit`; `display: flex` в SCSS используется только при недостаточности его API.
6. Для расстояний между детьми сначала используется `gap` компонента `Flex` или другое свойство подходящего контейнера.
7. Если родителю нужен класс на корневом элементе ребёнка, ребёнок принимает `className` и объединяет его со своим BEM-классом.
8. Переданный родителем класс является элементом BEM-блока родителя, например `qp-parent__child`.
