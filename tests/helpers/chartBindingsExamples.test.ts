import {describe, expect, it} from 'vitest';
import {
    aggregateCategories,
    aggregateFlows,
    aggregateHierarchy,
    fieldsChartItems,
    getChartData,
    getInitialFormValues,
} from '../../src/widgets/DashboardCharts/story/fieldsData';

describe('chart binding example adapters', () => {
    it('sums duplicate categories without sorting away first-seen order', () => {
        expect(
            aggregateCategories(
                [
                    {category: 'B', value: 2},
                    {category: 'A', value: 3},
                    {category: 'B', value: 4},
                ],
                'category',
                'value',
            ),
        ).toEqual([
            {name: 'B', value: 6},
            {name: 'A', value: 3},
        ]);
    });

    it('builds ordered hierarchy paths without separator collisions and sums repeated leaves', () => {
        const rows = [
            {outer: 'a/b', inner: 'c', value: 2},
            {outer: 'a', inner: 'b/c', value: 3},
            {outer: 'a/b', inner: 'c', value: 4},
        ];
        const nodes = aggregateHierarchy(rows, ['outer', 'inner'], 'value');
        expect(nodes).toEqual([
            {id: '["a/b"]', parentId: undefined, name: 'a/b'},
            {id: '["a/b","c"]', parentId: '["a/b"]', name: 'c', value: 6},
            {id: '["a"]', parentId: undefined, name: 'a'},
            {id: '["a","b/c"]', parentId: '["a"]', name: 'b/c', value: 3},
        ]);
        const reordered = aggregateHierarchy(rows, ['inner', 'outer'], 'value');
        expect(reordered[0]).toEqual({id: '["c"]', parentId: undefined, name: 'c'});
        expect(reordered[1]).toEqual({id: '["c","a/b"]', parentId: '["c"]', name: 'a/b', value: 6});
    });

    it('merges duplicate flows and includes sinks with no outgoing links', () => {
        expect(
            aggregateFlows(
                [
                    {source: 'A', target: 'B', value: 2},
                    {source: 'A', target: 'B', value: 3},
                    {source: 'B', target: 'C', value: 5},
                ],
                'source',
                'target',
                'value',
            ),
        ).toEqual([
            {name: 'A', links: [{name: 'B', value: 5}]},
            {name: 'B', links: [{name: 'C', value: 5}]},
            {name: 'C', links: []},
        ]);
    });

    it('places numeric measures on X for horizontal bars and time on Y', () => {
        const data = getChartData(getInitialFormValues('bar-y'));
        if (!data) throw new Error('Expected horizontal bar chart data');
        expect(data.xAxis?.type).toBe('linear');
        expect(data.yAxis?.[0].type).toBe('datetime');
        expect(data.series.data[0].data[0]).toEqual({x: 620, y: Date.UTC(2026, 7, 10)});
    });

    it('provides editable saved values for all eight supported chart types', () => {
        expect(fieldsChartItems.map(({fieldsFormValues}) => fieldsFormValues?.chartType)).toEqual([
            'line',
            'area',
            'scatter',
            'bar-x',
            'bar-y',
            'pie',
            'treemap',
            'sankey',
        ]);
        for (const item of fieldsChartItems) {
            expect(item.chartData.series.data.length).toBeGreaterThan(0);
            expect(item.chartData.series.data[0].type).toBe(item.fieldsFormValues?.chartType);
        }
    });
});
