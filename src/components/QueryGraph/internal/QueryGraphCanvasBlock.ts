/* eslint-disable no-param-reassign -- CanvasRenderingContext2D exposes drawing state as mutable properties. */
import {CanvasBlock, type TBlock} from '@gravity-ui/graph';

import type {QueryGraphNode, QueryGraphNodeStatus} from '../../../types/queryGraph';
import {getQueryGraphProgress} from '../helpers/layout';
import {
    fitCanvasFontSize,
    fitCanvasText,
    getQueryGraphNodeContent,
    getScaleAdjustedFontSize,
} from '../helpers/presentation';
import {getQueryGraphStatusIconSvg} from './queryGraphIcons';

type QueryGraphBlockMeta = {
    node: QueryGraphNode;
    iconSvg: string;
    fallbackIconSvg: string;
    iconColorToken: string;
    fallbackIconColorToken: string;
};

export type QueryGraphBlock = TBlock<QueryGraphBlockMeta>;

type ImageCacheEntry = {
    image: HTMLImageElement;
    state: 'loading' | 'loaded' | 'failed';
    listeners: Set<() => void>;
};

const imageCache = new Map<string, ImageCacheEntry>();
const statusTokens = {
    'not-started': ['--g-color-line-generic', '--g-color-base-float'],
    waiting: ['--g-color-text-misc-heavy', '--g-color-base-misc-light'],
    running: ['--g-color-line-generic', '--g-color-line-generic'],
    completed: ['--g-color-text-positive-heavy', '--g-color-base-positive-light'],
    failed: ['--g-color-text-danger-heavy', '--g-color-base-danger-light'],
    aborted: ['--g-color-text-complementary', '--g-color-base-generic'],
} as const;
const statusIconTokens: Partial<Record<QueryGraphNodeStatus, string>> = {
    running: '--g-color-text-info',
    completed: '--g-color-text-positive-heavy',
    failed: '--g-color-text-danger-heavy',
    aborted: '--g-color-text-complementary',
};
const resourceTokens = ['--g-color-line-generic', '--g-color-base-float'] as const;
const START_ANGLE = -Math.PI / 2;
const STATUS_ICON_SIZE_RATIO = 1 / 4;
const STATUS_ICON_BACKGROUND_RADIUS_RATIO = 1 / 6;
const PROGRESS_WIDTH_RATIO = 1 / 9;
const INNER_BORDER_WIDTH_RATIO = 1 / 25;
const COUNTER_MAX_WIDTH_RATIO = 7 / 9;
const LABEL_MAX_WIDTH_RATIO = 2;
const COUNTER_FONT_SIZE = 11;
const LABEL_FONT_SIZE = 9;
const LABEL_GAP = 4;
const RESOURCE_ICON_SIZE = 16;

function cssValue(token: string, element?: Element) {
    if (typeof document === 'undefined') return '';
    return getComputedStyle(element ?? document.documentElement)
        .getPropertyValue(token)
        .trim();
}

function coloredSvgDataUrl(svg: string, color: string) {
    const markup = svg.split('currentColor').join(color || '#000');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

function getCanvasImage(svg: string, color: string, onSettled: () => void) {
    if (typeof Image === 'undefined') return undefined;
    const key = `${color}\n${svg}`;
    let entry = imageCache.get(key);
    if (!entry) {
        const image = new Image();
        entry = {image, state: 'loading', listeners: new Set()};
        imageCache.set(key, entry);
        image.onload = () => {
            if (!entry) return;
            entry.state = 'loaded';
            entry.listeners.forEach((listener) => listener());
            entry.listeners.clear();
        };
        image.onerror = () => {
            if (!entry) return;
            entry.state = 'failed';
            entry.listeners.forEach((listener) => listener());
            entry.listeners.clear();
        };
        image.src = coloredSvgDataUrl(svg, color);
    }
    if (entry.state === 'loading') entry.listeners.add(onSettled);
    return entry;
}

export class QueryGraphCanvasBlock extends CanvasBlock<QueryGraphBlock> {
    public override renderMinimalisticBlock(ctx: CanvasRenderingContext2D) {
        this.renderQueryNode(ctx);
    }

    public override renderSchematicView(ctx: CanvasRenderingContext2D) {
        this.renderQueryNode(ctx);
    }

    public override renderDetailedView(ctx: CanvasRenderingContext2D) {
        this.renderQueryNode(ctx);
    }

    private readonly redrawAfterImageLoad = () => this.performRender();

    private renderQueryNode(context: CanvasRenderingContext2D) {
        const {meta} = this.state;
        if (!meta?.node) return;
        const {node} = meta;
        const status = node.status ?? 'not-started';
        const [lineToken, baseToken] =
            node.kind === 'operation' ? statusTokens[status] : resourceTokens;

        context.save();
        if (node.kind === 'operation' && status === 'running') {
            this.drawRunningOperation(context, getQueryGraphProgress(node));
        } else {
            this.drawNodeShape(context, lineToken, baseToken);
        }

        const content = getQueryGraphNodeContent(node);
        if (content.kind === 'icon') {
            const {x, y, width, height} = this.state;
            const side = node.kind === 'operation' ? width / 2 : RESOURCE_ICON_SIZE;
            this.drawIcon(
                context,
                meta.iconSvg,
                meta.fallbackIconSvg,
                x + (width - side) / 2,
                y + (height - side) / 2,
                side,
                cssValue(meta.iconColorToken, context.canvas),
                cssValue(meta.fallbackIconColorToken, context.canvas),
            );
        } else if (content.kind === 'counter') {
            this.drawCounter(context, content.value);
        }

        if (node.kind === 'operation') this.drawStatusIcon(context, status);
        this.drawLabel(context, node.label ?? node.name, node.kind !== 'operation');
        context.restore();
    }

    private drawNodeShape(context: CanvasRenderingContext2D, lineToken: string, baseToken: string) {
        const {x, y, width, height, meta} = this.state;
        context.beginPath();
        if (meta?.node.kind === 'operation') {
            context.arc(x + width / 2, y + height / 2, width / 2 - 1, 0, Math.PI * 2);
        } else {
            context.roundRect(x + 1, y + 1, width - 2, height - 2, 12);
        }
        context.fillStyle = cssValue(baseToken, context.canvas);
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = cssValue(lineToken, context.canvas);
        context.stroke();
    }

    private drawRunningOperation(context: CanvasRenderingContext2D, progress: number) {
        const {x, y, width, height} = this.state;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = width / 2;
        const progressWidth = width * PROGRESS_WIDTH_RATIO;
        const endAngle = START_ANGLE + Math.PI * 2 * progress;
        const runningBase = cssValue('--g-color-line-generic', context.canvas);
        const runningLine = cssValue('--g-color-line-generic', context.canvas);
        const progressBase = cssValue('--g-color-base-info-light', context.canvas);
        const progressLine = cssValue('--g-color-text-info', context.canvas);
        const background = cssValue('--g-color-base-background', context.canvas);

        context.beginPath();
        context.arc(centerX, centerY, radius - progressWidth / 2, 0, Math.PI * 2);
        context.fillStyle = runningBase;
        context.fill();
        context.lineWidth = progressWidth;
        context.strokeStyle = runningLine;
        context.stroke();

        if (progress > 0) {
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.arc(centerX, centerY, radius - progressWidth / 2, START_ANGLE, endAngle);
            context.closePath();
            context.fillStyle = progressBase;
            context.fill();

            context.beginPath();
            context.arc(centerX, centerY, radius - progressWidth / 2, START_ANGLE, endAngle);
            context.lineWidth = progressWidth;
            context.strokeStyle = progressLine;
            context.stroke();
        }

        context.beginPath();
        context.arc(centerX, centerY, radius - progressWidth, 0, Math.PI * 2);
        context.lineWidth = width * INNER_BORDER_WIDTH_RATIO;
        context.strokeStyle = background;
        context.stroke();
    }

    private drawCounter(context: CanvasRenderingContext2D, value: string) {
        const {x, y, width, height} = this.state;
        const maxFontSize = getScaleAdjustedFontSize(
            COUNTER_FONT_SIZE,
            this.context.graph.cameraService.getCameraScale(),
        );
        const fontFamily = cssValue('--g-font-family-sans', context.canvas);
        context.fillStyle = cssValue('--g-color-text-primary', context.canvas);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `500 ${maxFontSize}px ${fontFamily}`;
        const fontSize = fitCanvasFontSize(
            maxFontSize,
            context.measureText(value).width,
            width * COUNTER_MAX_WIDTH_RATIO,
        );
        context.font = `500 ${fontSize}px ${fontFamily}`;
        context.fillText(value, x + width / 2, y + height / 2);
    }

    private drawStatusIcon(context: CanvasRenderingContext2D, status: QueryGraphNodeStatus) {
        const iconSvg = getQueryGraphStatusIconSvg(status);
        const colorToken = statusIconTokens[status];
        if (!iconSvg || !colorToken) return;
        const {x, y, width} = this.state;
        const side = width * STATUS_ICON_SIZE_RATIO;
        const backgroundRadius = width * STATUS_ICON_BACKGROUND_RADIUS_RATIO;
        const iconX = x + width - side;
        const iconY = y;

        context.beginPath();
        context.arc(iconX + side / 2, iconY + side / 2, backgroundRadius, 0, Math.PI * 2);
        context.fillStyle = cssValue('--g-color-base-background', context.canvas);
        context.fill();
        this.drawIcon(
            context,
            iconSvg,
            iconSvg,
            iconX,
            iconY,
            side,
            cssValue(colorToken, context.canvas),
            cssValue(colorToken, context.canvas),
        );
    }

    private drawIcon(
        context: CanvasRenderingContext2D,
        svg: string,
        fallbackSvg: string,
        x: number,
        y: number,
        side: number,
        color: string,
        fallbackColor: string,
    ) {
        let entry = getCanvasImage(svg, color, this.redrawAfterImageLoad);
        if (entry?.state === 'failed' && fallbackSvg !== svg) {
            entry = getCanvasImage(fallbackSvg, fallbackColor, this.redrawAfterImageLoad);
        }
        if (entry?.state === 'loaded') context.drawImage(entry.image, x, y, side, side);
    }

    private drawLabel(context: CanvasRenderingContext2D, label: string, trimStart: boolean) {
        const {x, y, width, height} = this.state;
        const cameraScale = this.context.graph.cameraService.getCameraScale();
        const fontSize = getScaleAdjustedFontSize(LABEL_FONT_SIZE, cameraScale);
        const labelGap = getScaleAdjustedFontSize(LABEL_GAP, cameraScale);
        context.fillStyle = cssValue('--g-color-text-primary', context.canvas);
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = `400 ${fontSize}px ${cssValue('--g-font-family-sans', context.canvas)}`;
        const fitted = fitCanvasText(context, label, width * LABEL_MAX_WIDTH_RATIO, trimStart);
        context.fillText(fitted, x + width / 2, y + height + labelGap);
    }
}
