import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';

import type {QueryGraphEdge, QueryGraphNode} from '../src/types/queryGraph';
import {
    createQueryGraphConnections,
    getQueryGraphNodeSize,
    getQueryGraphProgress,
    validateQueryGraph,
} from '../src/components/QueryGraph/helpers/layout';
import {
    fitCanvasFontSize,
    fitCanvasText,
    getQueryGraphNodeContent,
    getScaleAdjustedFontSize,
} from '../src/components/QueryGraph/helpers/presentation';
import {
    getDefaultQueryGraphNodeIcon,
    getQueryGraphNodeIcon,
    getQueryGraphNodeIconSvgs,
    queryGraphIconToSvg,
} from '../src/components/QueryGraph/internal/queryGraphIcons';

const node = (id: string): QueryGraphNode => ({id, kind: 'operation', name: id});

test('uses the design sizes for operation and resource nodes', () => {
    const operation = getQueryGraphNodeSize(node('operation'));
    const resource = getQueryGraphNodeSize({id: 'input', kind: 'input', name: 'Input'});

    assert.equal(operation.width, 65);
    assert.equal(operation.height, 65);
    assert.equal(resource.width, 36);
    assert.equal(resource.height, 36);
});

test('validates duplicate nodes and edges with missing endpoints', () => {
    assert.throws(() => validateQueryGraph([node('a'), node('a')], []), /Duplicate/);
    assert.throws(
        () => validateQueryGraph([node('a')], [{id: 'missing', source: 'a', target: 'b'}]),
        /Unknown target/,
    );
});

test('rejects cycles instead of hanging', () => {
    assert.throws(
        () =>
            validateQueryGraph(
                [node('a'), node('b')],
                [
                    {id: 'a-b', source: 'a', target: 'b'},
                    {id: 'b-a', source: 'b', target: 'a'},
                ],
            ),
        /cycle/,
    );
});

test('keeps every connection and attaches multipoint routes by edge id', () => {
    const edges: QueryGraphEdge[] = [
        {id: 'first', source: 'a', target: 'b'},
        {id: 'second', source: 'a', target: 'b'},
    ];
    const routes = {
        first: {
            points: [
                {x: 1, y: 2},
                {x: 3, y: 4},
            ],
        },
        second: {
            points: [
                {x: 5, y: 6},
                {x: 7, y: 8},
            ],
        },
    };

    assert.deepEqual(createQueryGraphConnections(edges, routes), [
        {
            id: 'first',
            sourceBlockId: 'a',
            targetBlockId: 'b',
            points: routes.first.points,
        },
        {
            id: 'second',
            sourceBlockId: 'a',
            targetBlockId: 'b',
            points: routes.second.points,
        },
    ]);
});

test('uses explicit progress and safely derives completed / total', () => {
    assert.equal(getQueryGraphProgress({...node('a'), progress: {fraction: 1.5}}), 1);
    assert.equal(getQueryGraphProgress({...node('a'), progress: {completed: 3, total: 4}}), 0.75);
    assert.equal(getQueryGraphProgress({...node('a'), progress: {completed: 3, total: 0}}), 0);
});

test('selects built-in operation icons and accepts a static SVG override', () => {
    const mapIcon = queryGraphIconToSvg(
        getDefaultQueryGraphNodeIcon({...node('map'), operationType: 'map'}),
    );
    const reduceIcon = queryGraphIconToSvg(
        getDefaultQueryGraphNodeIcon({...node('reduce'), operationType: 'reduce'}),
    );
    assert.ok(mapIcon?.startsWith('<svg'));
    assert.ok(reduceIcon?.startsWith('<svg'));
    assert.notEqual(mapIcon, reduceIcon);
    assert.equal(
        getQueryGraphNodeIconSvgs({...node('map'), operationType: 'map'}).iconColorToken,
        '--g-color-text-misc',
    );
    assert.equal(
        getQueryGraphNodeIconSvgs({id: 'input', kind: 'input', name: 'Input'}).iconColorToken,
        '--g-color-text-misc',
    );

    const customIcon = React.createElement(
        'svg',
        {viewBox: '0 0 10 10'},
        React.createElement('circle', {cx: 5, cy: 5, r: 4}),
    );
    const selected = queryGraphIconToSvg(
        getQueryGraphNodeIcon({...node('custom'), icon: customIcon}),
    );
    assert.match(selected ?? '', /<circle/);
});

test('shows an icon before start and only a positive counter after status appears', () => {
    assert.deepEqual(getQueryGraphNodeContent(node('new')), {kind: 'icon'});
    assert.deepEqual(
        getQueryGraphNodeContent({...node('waiting'), status: 'waiting', progress: {total: 0}}),
        {kind: 'empty'},
    );
    assert.deepEqual(
        getQueryGraphNodeContent({...node('running'), status: 'running', progress: {total: 42}}),
        {kind: 'counter', value: '42'},
    );
});

test('truncates operation labels at the end and resource labels at the start', () => {
    const context = {measureText: (value: string) => ({width: value.length * 10})};
    assert.equal(fitCanvasText(context, 'abcdefghij', 60, false), 'abcde…');
    assert.equal(fitCanvasText(context, 'abcdefghij', 60, true), '…fghij');
});

test('keeps graph text at its design size across camera scales', () => {
    assert.equal(getScaleAdjustedFontSize(11, 0.5), 22);
    assert.equal(getScaleAdjustedFontSize(4, 0.5), 8);
    assert.equal(getScaleAdjustedFontSize(9, 1), 9);
    assert.equal(getScaleAdjustedFontSize(11, 0), 11);
});

test('shrinks counters that exceed the available node width', () => {
    assert.equal(fitCanvasFontSize(11, 40, 50), 11);
    assert.equal(fitCanvasFontSize(11, 100, 50), 5.5);
});
