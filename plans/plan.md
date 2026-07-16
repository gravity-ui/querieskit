# Рефакторинг нейминга компонентов QueriesHistory

## Проблема

В директории `src/components/QueriesHistory/` все внутренние компоненты несут избыточный префикс `QueriesHistory`/`QueryHistory`, который дублирует контекст папки. Также присутствует несогласованность: часть компонентов использует `Queries` (множественное число), часть — `Query` (единственное).

## Решение

Оставить полный префикс `QueriesHistory` только у **публичного корневого компонента**. Все приватные компоненты переименовать с коротким префиксом `History`.

`QueryStatusIcon` не переименовывается — это generic-компонент, не специфичный для истории.

## Таблица переименований

| Было | Станет | Файлы |
|------|--------|-------|
| `QueriesHistory` | `QueriesHistory` ✅ | `QueriesHistory.tsx` (без изменений) |
| `QueriesHistoryList` | `HistoryList` | `QueriesHistoryList.tsx` → `HistoryList.tsx` |
| `QueriesHistoryListHeader` | `HistoryGroupHeader` | `QueriesHistoryListHeader.tsx/.scss` → `HistoryGroupHeader.tsx/.scss` |
| `QueriesHistoryRow` | `HistoryRow` | `QueriesHistoryRow.tsx/.scss` → `HistoryRow.tsx/.scss` |
| `QueryHistoryDuration` | `HistoryDuration` | `QueryHistoryDuration.tsx/.scss` → `HistoryDuration.tsx/.scss` |
| `QueryHistoryHeader` | `HistoryHeader` | `QueryHistoryHeader.tsx` → `HistoryHeader.tsx` |
| `QueryHistoryRowMenu` | `HistoryRowMenu` | `QueryHistoryRowMenu.tsx` → `HistoryRowMenu.tsx` |
| `QueryStatusIcon` | `QueryStatusIcon` ✅ | без изменений |

## Шаги реализации

1. **Переименовать файлы и компоненты:**
   - `QueriesHistoryList.tsx` → `HistoryList.tsx`, экспорт `QueriesHistoryList` → `HistoryList`
   - `QueriesHistoryListHeader.tsx/.scss` → `HistoryGroupHeader.tsx/.scss`, экспорт → `HistoryGroupHeader`
   - `QueriesHistoryRow.tsx/.scss` → `HistoryRow.tsx/.scss`, экспорт → `HistoryRow`
   - `QueryHistoryDuration.tsx/.scss` → `HistoryDuration.tsx/.scss`, экспорт → `HistoryDuration`
   - `QueryHistoryHeader.tsx` → `HistoryHeader.tsx`, экспорт → `HistoryHeader`
   - `QueryHistoryRowMenu.tsx` → `HistoryRowMenu.tsx`, экспорт → `HistoryRowMenu`

2. **Обновить импорты в `QueriesHistory.tsx`:**
   - `QueryHistoryHeader` → `HistoryHeader` (из `./HistoryHeader`)
   - `QueriesHistoryList` → `HistoryList` (из `./HistoryList`)

3. **Обновить импорты в `HistoryList.tsx`:**
   - `QueriesHistoryRow` → `HistoryRow` (из `./HistoryRow`)

4. **Обновить импорты в `HistoryRow.tsx`:**
   - `QueriesHistoryListHeader` → `HistoryGroupHeader` (из `./HistoryGroupHeader`)
   - `QueryHistoryRowMenu` → `HistoryRowMenu` (из `./HistoryRowMenu`)
   - `QueryHistoryDuration` → `HistoryDuration` (из `./HistoryDuration`)

## Итоговая структура директории

```
src/components/QueriesHistory/
├── index.ts                  (без изменений)
├── QueriesHistory.tsx        (без изменений, публичный компонент)
├── QueriesHistory.stories.tsx
├── HistoryList.tsx           (было: QueriesHistoryList)
├── HistoryGroupHeader.tsx    (было: QueriesHistoryListHeader)
├── HistoryGroupHeader.scss
├── HistoryRow.tsx            (было: QueriesHistoryRow)
├── HistoryRow.scss
├── HistoryDuration.tsx       (было: QueryHistoryDuration)
├── HistoryDuration.scss
├── HistoryHeader.tsx         (было: QueryHistoryHeader)
├── HistoryRowMenu.tsx        (было: QueryHistoryRowMenu)
├── QueryStatusIcon.tsx       (без изменений)
├── QueryStatusIcon.scss
├── hooks/
└── i18n/
```
