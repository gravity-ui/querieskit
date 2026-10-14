import {AbstractEventRenderer} from '@gravity-ui/timeline';
import type {TimelineEvent} from '@gravity-ui/timeline';
import type {TimelineRow} from '../helpers/model';

export type QueryTimelineCanvasEvent = TimelineEvent & {
    row: TimelineRow;
    duration: string;
    segments: {from: number; to: number; color: string; opacity: number}[];
    opacity: number;
};

export class TimelineEventRenderer extends AbstractEventRenderer {
    public render(...args: Parameters<AbstractEventRenderer['render']>) {
        const [
            ctx,
            source,
            selected,
            x0,
            x1,
            y,
            height,
            config,
            position,
            hovered,
            resolveColor,
            resolveFont,
        ] = args;
        const event = source as QueryTimelineCanvasEvent;
        const color = (value: string) => resolveColor?.(value) ?? value;
        const h = Math.min(18, height - 8);
        const top = y - h / 2;
        const width = Math.max(4, x1 - x0);
        ctx.save();
        ctx.font = resolveFont?.(config.font ?? 'inherit') ?? ctx.font;
        ctx.fillStyle = color(event.color ?? 'var(--g-color-base-neutral-heavy)');
        ctx.globalAlpha = event.segments.length ? 0.18 : event.opacity;
        ctx.fillRect(x0, top, width, h);
        if (position && event.segments.length) {
            ctx.beginPath();
            ctx.rect(x0, top, width, h);
            ctx.clip();
            for (const segment of event.segments) {
                const left = position(segment.from);
                const right = position(segment.to);
                ctx.fillStyle = color(segment.color);
                ctx.globalAlpha = segment.opacity;
                ctx.fillRect(left, top, Math.max(1, right - left), h);
            }
        }
        ctx.restore();
        ctx.save();
        if (selected || hovered) {
            ctx.strokeStyle = color(
                selected ? 'var(--g-color-line-brand)' : 'var(--g-color-line-generic-active)',
            );
            ctx.lineWidth = selected ? 2 : 1;
            ctx.strokeRect(x0, top, width, h);
        }
        ctx.font = resolveFont?.(config.font ?? 'inherit') ?? ctx.font;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color('var(--g-color-text-primary)');
        ctx.fillText(event.duration, Math.max(0, x0 + width) + 6, y);
        ctx.restore();
    }

    public getHitbox(_event: TimelineEvent, x0: number, x1: number) {
        this.hitboxResult.left = x0;
        this.hitboxResult.right = Math.max(x0 + 4, x1);
        return this.hitboxResult;
    }
}
