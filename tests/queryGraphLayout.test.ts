import assert from 'node:assert/strict';
import test from 'node:test';

// Import the installed algorithm directly: the package root also loads browser-only CSS.
import {layoutGraph} from '../node_modules/@gravity-ui/graph/build/plugins/layered/layout';
import {layeredConverter} from '../node_modules/@gravity-ui/graph/build/plugins/layered/converters/layeredConverter';
import {
    QUERY_GRAPH_LAYOUT_OPTIONS,
    createQueryGraphConnections,
} from '../src/components/QueryGraph/helpers/layout';

const operation = (id: string, level: number) => ({id, level, width: 65, height: 65});

test('keeps the layer step independent of graph height', async () => {
    const createGraph = (branches: number) => {
        const middle = Array.from({length: branches}, (_, index) => operation(`b${index}`, 1));
        return {
            nodes: [operation('a', 0), ...middle, operation('c', 2)],
            edges: middle.flatMap(({id}) => [
                {from: 'a', to: id},
                {from: id, to: 'c'},
            ]),
            options: QUERY_GRAPH_LAYOUT_OPTIONS,
        };
    };
    const narrow = await layoutGraph(createGraph(1));
    const wide = await layoutGraph(createGraph(20));
    const spanY = (nodes: typeof wide.nodes) =>
        Math.max(...nodes.map(({y}) => y)) - Math.min(...nodes.map(({y}) => y));

    assert.ok(spanY(wide.nodes) > spanY(narrow.nodes) + 1000);
    for (const result of [narrow, wide]) {
        for (const node of result.nodes) {
            assert.equal(node.x, node.level * 145);
        }
    }
});

test('preserves long routes, real endpoints, and isolated blocks with compact spacing', async () => {
    const nodes = [
        {...operation('input', 0), width: 36, height: 36},
        operation('first', 1),
        operation('second', 2),
        {...operation('output', 3), width: 36, height: 36},
        operation('isolated', 0),
    ];
    const edges = [
        {id: 'input-first', source: 'input', target: 'first'},
        {id: 'first-second', source: 'first', target: 'second'},
        {id: 'second-output', source: 'second', target: 'output'},
        {id: 'long-route', source: 'input', target: 'output'},
    ];
    const layoutResult = await layoutGraph({
        nodes,
        edges: edges.map(({source, target}) => ({from: source, to: target})),
        options: QUERY_GRAPH_LAYOUT_OPTIONS,
    });
    const converted = layeredConverter({
        layoutResult,
        connectionIdBySourceTarget: new Map(
            edges.map(({id, source, target}) => [`${source}/${target}`, [id]]),
        ),
        blockSizes: new Map(nodes.map(({id, width, height}) => [id, {width, height}])),
        virtualNodeWidth: QUERY_GRAPH_LAYOUT_OPTIONS.defaultNodeWidth,
        virtualNodeHeight: QUERY_GRAPH_LAYOUT_OPTIONS.defaultNodeHeight,
    });

    assert.deepEqual(Object.keys(converted.blocks).sort(), nodes.map(({id}) => id).sort());
    assert.deepEqual(Object.keys(converted.edges).sort(), edges.map(({id}) => id).sort());
    const connections = createQueryGraphConnections(edges, converted.edges);
    for (const edge of connections) {
        const source = nodes.find(({id}) => id === edge.sourceBlockId);
        const target = nodes.find(({id}) => id === edge.targetBlockId);
        assert.ok(source);
        assert.ok(target);
        const sourcePosition = converted.blocks[source.id];
        const targetPosition = converted.blocks[target.id];
        const points = edge.points;
        assert.ok(points);
        assert.deepEqual(points[0], {
            x: sourcePosition.x + source.width,
            y: sourcePosition.y + source.height / 2,
        });
        assert.deepEqual(points.at(-1), {
            x: targetPosition.x,
            y: targetPosition.y + target.height / 2,
        });
        assert.ok(points.every(({x, y}) => Number.isFinite(x) && Number.isFinite(y)));
    }

    const virtualNodes = layoutResult.nodes.filter(
        (node) => 'shape' in node && node.shape === 'dot',
    );
    const longRoute = converted.edges['long-route'].points;
    assert.ok(longRoute);
    assert.ok(virtualNodes.length > 0);
    assert.equal(longRoute.length, virtualNodes.length + 2);
    for (const virtual of virtualNodes) {
        assert.equal(typeof virtual.x, 'number');
        const centerX = (virtual.x ?? 0) + 65 / 2;
        const centerY = virtual.y + QUERY_GRAPH_LAYOUT_OPTIONS.defaultNodeHeight! / 2;
        assert.ok(longRoute.some(({x, y}) => x === centerX && y === centerY));
    }
});
