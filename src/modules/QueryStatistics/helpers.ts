import type {
    QueryStatisticsGroup,
    QueryStatisticsItem,
    QueryStatisticsMetric,
} from '../../types/queryStatistics';

export type QueryStatisticsRow = {item: QueryStatisticsItem; level: number};

export type FilterQueryStatisticsResult = {
    data: QueryStatisticsItem[];
    forcedExpandedIds: Set<string>;
};

export function isQueryStatisticsGroup(item: QueryStatisticsItem): item is QueryStatisticsGroup {
    return Array.isArray(item.children);
}

export function isQueryStatisticsMetric(item: QueryStatisticsItem): item is QueryStatisticsMetric {
    return !isQueryStatisticsGroup(item);
}

export function getQueryStatisticsValue(
    item: QueryStatisticsMetric,
    column: keyof QueryStatisticsMetric['values'],
) {
    if (column !== 'avg' || item.values.avg !== undefined) {
        return item.values[column];
    }

    const {count, sum} = item.values;
    return count === undefined || count === 0 || sum === undefined ? undefined : sum / count;
}

export function collectQueryStatisticsGroupIds(data: QueryStatisticsItem[]): string[] {
    return data.flatMap((item) =>
        isQueryStatisticsGroup(item) && item.children.length > 0
            ? [item.id, ...collectQueryStatisticsGroupIds(item.children)]
            : [],
    );
}

function addSubtreeGroupIds(item: QueryStatisticsGroup, target: Set<string>) {
    if (item.children.length > 0) {
        target.add(item.id);
    }
    item.children.forEach((child) => {
        if (isQueryStatisticsGroup(child)) {
            addSubtreeGroupIds(child, target);
        }
    });
}

function matchesSearch(item: QueryStatisticsItem, search: string) {
    return [item.name, item.description, item.unit]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase().includes(search));
}

export function filterQueryStatistics(
    data: QueryStatisticsItem[],
    search: string,
): FilterQueryStatisticsResult {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return {data, forcedExpandedIds: new Set()};

    const forcedExpandedIds = new Set<string>();
    const filterItems = (items: QueryStatisticsItem[]): QueryStatisticsItem[] =>
        items.flatMap<QueryStatisticsItem>((item) => {
            if (!isQueryStatisticsGroup(item)) {
                return matchesSearch(item, normalizedSearch) ? [item] : [];
            }
            if (matchesSearch(item, normalizedSearch)) {
                addSubtreeGroupIds(item, forcedExpandedIds);
                return [item];
            }
            const children = filterItems(item.children);
            if (!children.length) return [];
            if (item.children.length > 0) forcedExpandedIds.add(item.id);
            return [{...item, children}];
        });

    return {data: filterItems(data), forcedExpandedIds};
}

export function flattenQueryStatistics(
    data: QueryStatisticsItem[],
    expandedIds: Set<string>,
    level = 0,
): QueryStatisticsRow[] {
    return data.flatMap((item) => [
        {item, level},
        ...(isQueryStatisticsGroup(item) && expandedIds.has(item.id)
            ? flattenQueryStatistics(item.children, expandedIds, level + 1)
            : []),
    ]);
}
