/* eslint-disable no-param-reassign -- CanvasRenderingContext2D exposes drawing state as mutable properties. */
import {BezierMultipointConnection} from '@gravity-ui/graph';

export class QueryGraphConnection extends BezierMultipointConnection {
    public override style(ctx: CanvasRenderingContext2D) {
        const result = super.style(ctx);
        const minimumScreenWidth = this.state.selected || this.state.hovered ? 2 : 1;
        ctx.lineWidth = Math.max(
            ctx.lineWidth,
            minimumScreenWidth / this.context.camera.getCameraScale(),
        );
        return result;
    }

    public override styleArrow(ctx: CanvasRenderingContext2D) {
        const result = super.styleArrow(ctx);
        // MultipointConnection assigns a negative width for highlighted arrows,
        // which canvas ignores. Always supply a positive, scale-aware stroke.
        ctx.lineWidth = Math.max(1, 1 / this.context.camera.getCameraScale());
        return result;
    }
}
