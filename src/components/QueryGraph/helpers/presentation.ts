import type {QueryGraphNode} from '../../../types/queryGraph';

export function getQueryGraphNodeContent(node: QueryGraphNode) {
    const status = node.status ?? 'not-started';
    if (status === 'not-started') return {kind: 'icon'} as const;
    const total = node.progress?.total;
    return typeof total === 'number' && total > 0
        ? ({kind: 'counter', value: String(total)} as const)
        : ({kind: 'empty'} as const);
}

export function getScaleAdjustedFontSize(fontSize: number, cameraScale: number) {
    return cameraScale > 0 ? fontSize / cameraScale : fontSize;
}

export function fitCanvasFontSize(fontSize: number, measuredWidth: number, maxWidth: number) {
    if (measuredWidth <= 0 || measuredWidth <= maxWidth) return fontSize;
    return fontSize * (maxWidth / measuredWidth);
}

export function fitCanvasText(
    context: {measureText: (text: string) => {width: number}},
    text: string,
    maxWidth: number,
    trimStart: boolean,
) {
    if (context.measureText(text).width <= maxWidth) return text;
    const ellipsis = '…';
    let low = 0;
    let high = text.length;
    while (low < high) {
        const length = Math.ceil((low + high) / 2);
        const candidate = trimStart
            ? ellipsis + text.slice(text.length - length)
            : text.slice(0, length) + ellipsis;
        if (context.measureText(candidate).width <= maxWidth) low = length;
        else high = length - 1;
    }
    return trimStart ? ellipsis + text.slice(text.length - low) : text.slice(0, low) + ellipsis;
}
