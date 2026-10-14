import assert from 'node:assert/strict';
import {test} from 'vitest';

import {QueryGraphConnection} from '../../src/components/QueryGraph/internal/QueryGraphConnection';

function createConnection(scale: number, selected = false, hovered = false) {
    const connection = Object.create(QueryGraphConnection.prototype) as QueryGraphConnection;
    Object.defineProperties(connection, {
        state: {value: {selected, hovered, dashed: true, styles: {dashes: [3, 5]}}},
        context: {
            value: {
                camera: {getCameraScale: () => scale},
                colors: {connection: {background: 'normal', selectedBackground: 'selected'}},
            },
        },
    });
    return connection;
}

for (const scale of [0.1, 0.25, 0.5, 1, 2]) {
    for (const [selected, hovered] of [
        [false, false],
        [true, false],
        [false, true],
    ]) {
        test(`connection strokes remain visible at scale ${scale}, selected=${selected}, hovered=${hovered}`, () => {
            const connection = createConnection(scale, selected, hovered);
            let dashes: number[] = [];
            const ctx = {
                lineWidth: 1,
                strokeStyle: '',
                setLineDash: (value: number[]) => {
                    dashes = value;
                },
            } as unknown as CanvasRenderingContext2D;

            assert.deepEqual(connection.style(ctx), {type: 'stroke'});
            assert.equal(
                ctx.lineWidth * scale,
                Math.max((selected || hovered ? 4 : 2) * scale, selected || hovered ? 2 : 1),
            );
            assert.equal(ctx.strokeStyle, selected ? 'selected' : 'normal');
            assert.deepEqual(dashes, [3, 5]);

            assert.deepEqual(connection.styleArrow(ctx), {type: 'both'});
            assert.equal(ctx.lineWidth * scale, Math.max(scale, 1));
            assert.equal(ctx.fillStyle, selected ? 'selected' : 'normal');
            assert.equal(ctx.strokeStyle, ctx.fillStyle);
        });
    }
}
