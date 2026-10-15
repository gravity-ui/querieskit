import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {ECanDrag, GraphState, type TMultipointConnection} from '@gravity-ui/graph';
import {GraphCanvas, useGraph, useGraphEvent} from '@gravity-ui/graph/react';
import {MagnifierMinus, MagnifierPlus, SquareDashed} from '@gravity-ui/icons';
import {Button, Icon, Tooltip, useThemeValue} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {QueryGraphNode, QueryGraphProps} from '../../../types/queryGraph';
import i18n from '../i18n';
import {type QueryGraphBlock, QueryGraphCanvasBlock} from './QueryGraphCanvasBlock';
import {QueryGraphConnection} from './QueryGraphConnection';
import {QueryGraphPopup} from './QueryGraphPopup';
import type {PopupState} from './queryGraphTypes';
import './QueryGraphRenderer.scss';
const block = cn('qp-query-graph');
const FIT_PADDING = 120;
const ZOOM_STEP = 0.08;
const renderEmptyBlock = () => <React.Fragment />;

type RendererProps = Pick<
    QueryGraphProps,
    'autoCenter' | 'active' | 'renderNodePopup' | 'onNodeClick' | 'className'
> & {
    blocks: QueryGraphBlock[];
    connections: TMultipointConnection[];
    nodes: QueryGraphNode[];
    structureKey: string;
    popup?: PopupState;
    setPopup: React.Dispatch<React.SetStateAction<PopupState | undefined>>;
};

export const QueryGraphRenderer = React.forwardRef<HTMLDivElement, RendererProps>(
    function QueryGraphRendererComponent(
        {
            blocks,
            connections,
            nodes,
            structureKey,
            autoCenter,
            active,
            popup,
            setPopup,
            renderNodePopup,
            onNodeClick,
            className,
        },
        forwardedRef,
    ) {
        const rootRef = useRef<HTMLDivElement | null>(null);
        useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);
        const attachedRef = useRef(false);
        const centeredRef = useRef(false);
        const previousActiveRef = useRef(false);
        const previousStructureRef = useRef(structureKey);
        const [attached, setAttached] = useState(false);
        const [hoveredNodeId, setHoveredNodeId] = useState<string>();
        const [hoverAnchor, setHoverAnchor] = useState<{left: number; top: number}>();
        const themeValue = useThemeValue();
        const {graph, api, setEntities, start, stop} = useGraph({
            name: 'query-graph',
            settings: {
                connection: QueryGraphConnection,
                canDrag: ECanDrag.NONE,
                canDragCamera: true,
                canZoomCamera: true,
                canCreateNewConnections: false,
                useBezierConnections: true,
                bezierConnectionDirection: 'horizontal',
                showConnectionArrows: true,
                useBlocksAnchors: false,
                blockComponents: {'query-node': QueryGraphCanvasBlock},
            },
        });
        const [scale, setScale] = useState(graph.cameraService.getCameraState().scale);
        const {scaleMin, scaleMax} = graph.cameraService.getCameraState();
        useGraphEvent(graph, 'camera-change', ({scale: nextScale}) => {
            setScale(nextScale);
            setHoverAnchor(undefined);
            setHoveredNodeId(undefined);
        });
        useGraphEvent(graph, 'mouseenter', ({target, sourceEvent}) => {
            const state = (target as {state?: QueryGraphBlock} | undefined)?.state;
            if (!state?.meta?.node) return;
            setHoveredNodeId(state.meta.node.id);
            // GraphLayer wraps synthetic mouseenter events around the original pointer event.
            const mouseEvent =
                sourceEvent instanceof CustomEvent ? sourceEvent.detail?.sourceEvent : sourceEvent;
            if (rootRef.current && mouseEvent instanceof MouseEvent) {
                const rect = rootRef.current.getBoundingClientRect();
                setHoverAnchor({
                    left: mouseEvent.clientX - rect.left,
                    top: mouseEvent.clientY - rect.top,
                });
            }
        });
        useGraphEvent(graph, 'mouseleave', ({target}) => {
            const state = (target as {state?: QueryGraphBlock} | undefined)?.state;
            if (state?.meta?.node) {
                setHoveredNodeId(undefined);
                setHoverAnchor(undefined);
            }
        });

        useEffect(() => {
            if (!rootRef.current) return;

            const background = getComputedStyle(rootRef.current)
                .getPropertyValue('--g-color-base-background')
                .trim();
            const connection = getComputedStyle(rootRef.current)
                .getPropertyValue('--g-color-line-generic')
                .trim();
            if (!background || !connection) return;

            const colors = api.getGraphColors();
            api.updateGraphColors({
                ...colors,
                canvas: {
                    ...colors.canvas,
                    belowLayerBackground: background,
                    layerBackground: background,
                    border: background,
                    dots: background,
                },
                connection: {
                    ...colors.connection,
                    background: connection,
                },
            });
        }, [api, themeValue]);

        const visibleConnections = useMemo(
            () =>
                connections.map((connection) => ({
                    ...connection,
                    selected: Boolean(
                        hoveredNodeId &&
                        (connection.sourceBlockId === hoveredNodeId ||
                            connection.targetBlockId === hoveredNodeId),
                    ),
                })),
            [connections, hoveredNodeId],
        );
        useEffect(
            () => setEntities({blocks, connections: visibleConnections}),
            [blocks, setEntities, visibleConnections],
        );
        useEffect(() => {
            if (!attachedRef.current) return;
            if (active) start();
            else stop();
        }, [active, start, stop]);
        useEffect(() => {
            const changed = previousStructureRef.current !== structureKey;
            const becameActive = active && !previousActiveRef.current;
            let frame: number | undefined;
            if (
                attached &&
                active &&
                (!centeredRef.current || becameActive || (autoCenter && changed))
            ) {
                frame = requestAnimationFrame(() => {
                    api.zoomToViewPort({padding: FIT_PADDING});
                    centeredRef.current = true;
                });
            }
            previousActiveRef.current = Boolean(active);
            previousStructureRef.current = structureKey;
            setPopup(undefined);
            setHoverAnchor(undefined);
            setHoveredNodeId(undefined);
            return () => {
                if (frame !== undefined) cancelAnimationFrame(frame);
            };
        }, [active, api, attached, autoCenter, setPopup, structureKey]);

        const handleClick: NonNullable<React.ComponentProps<typeof GraphCanvas>['click']> = ({
            target,
            sourceEvent,
        }) => {
            setHoverAnchor(undefined);
            const state = (target as {state?: QueryGraphBlock; isBlock?: boolean} | undefined)
                ?.state;
            if (!state?.meta?.node || !rootRef.current) {
                setPopup(undefined);
                return;
            }
            const mouseEvent = sourceEvent as MouseEvent;
            const rect = rootRef.current.getBoundingClientRect();
            const left = Math.min(
                Math.max(16, mouseEvent.clientX - rect.left + 12),
                rect.width - 456,
            );
            const top = Math.min(
                Math.max(16, mouseEvent.clientY - rect.top + 12),
                rect.height - 240,
            );
            setPopup({
                nodeId: state.meta.node.id,
                left: Math.max(16, left),
                top: Math.max(16, top),
            });
            onNodeClick?.(state.meta.node, mouseEvent);
        };

        const selectedNode = popup ? nodes.find((node) => node.id === popup.nodeId) : undefined;
        const hoveredNode = nodes.find((node) => node.id === hoveredNodeId);
        const defaultContent = selectedNode ? <QueryGraphPopup node={selectedNode} /> : null;
        let popupContent: React.ReactNode = null;
        if (selectedNode) {
            popupContent = renderNodePopup
                ? renderNodePopup({node: selectedNode, defaultContent})
                : defaultContent;
        }

        return (
            <div
                ref={rootRef}
                className={block(null, className)}
                onMouseLeave={() => {
                    setHoveredNodeId(undefined);
                    setHoverAnchor(undefined);
                }}
            >
                <GraphCanvas
                    graph={graph}
                    className={block('canvas')}
                    click={handleClick}
                    renderBlock={renderEmptyBlock}
                    onStateChanged={({state}) => {
                        if (state === GraphState.ATTACHED) {
                            if (active) start();
                            attachedRef.current = true;
                            setAttached(true);
                        }
                    }}
                />
                {active && hoverAnchor && hoveredNode && (
                    <Tooltip
                        open
                        content={hoveredNode.label ?? hoveredNode.name}
                        placement="top"
                        offset={12}
                        style={{pointerEvents: 'none'}}
                        onOpenChange={(open) => {
                            if (!open) setHoverAnchor(undefined);
                        }}
                    >
                        <span className={block('hover-anchor')} style={hoverAnchor} />
                    </Tooltip>
                )}
                <div className={block('toolbox')}>
                    <Tooltip content={i18n('action_zoom-in')} placement="right">
                        <Button
                            view="raised"
                            className={block('toolbox-button', {position: 'top'})}
                            aria-label={i18n('action_zoom-in')}
                            disabled={scale >= scaleMax}
                            onClick={() => changeZoom(graph, ZOOM_STEP)}
                        >
                            <Icon data={MagnifierPlus} />
                        </Button>
                    </Tooltip>
                    <Tooltip content={i18n('action_fit')} placement="right">
                        <Button
                            view="raised"
                            pin="brick-brick"
                            aria-label={i18n('action_fit')}
                            onClick={() => api.zoomToViewPort({padding: FIT_PADDING})}
                        >
                            <Icon data={SquareDashed} />
                        </Button>
                    </Tooltip>
                    <Tooltip content={i18n('action_zoom-out')} placement="right">
                        <Button
                            view="raised"
                            className={block('toolbox-button', {position: 'bottom'})}
                            aria-label={i18n('action_zoom-out')}
                            disabled={scale <= scaleMin}
                            onClick={() => changeZoom(graph, -ZOOM_STEP)}
                        >
                            <Icon data={MagnifierMinus} />
                        </Button>
                    </Tooltip>
                </div>
                {popup && popupContent !== null && (
                    <div className={block('popup')} style={{left: popup.left, top: popup.top}}>
                        {popupContent}
                    </div>
                )}
            </div>
        );
    },
);

function changeZoom(graph: ReturnType<typeof useGraph>['graph'], delta: number) {
    const camera = graph.cameraService;
    const state = camera.getCameraState();
    const nextScale = Math.min(state.scaleMax, Math.max(state.scaleMin, state.scale + delta));
    camera.zoom(state.width / 2, state.height / 2, nextScale);
}
