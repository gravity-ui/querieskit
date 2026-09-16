import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {
    BezierMultipointConnection,
    ECanDrag,
    GraphState,
    type TMultipointConnection,
} from '@gravity-ui/graph';
import {GraphCanvas, useGraph, useGraphEvent} from '@gravity-ui/graph/react';
import {MagnifierMinus, MagnifierPlus, SquareDashed} from '@gravity-ui/icons';
import {Button, Icon, Loader, Text, Tooltip, useThemeValue} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import type {QueryGraphNode, QueryGraphProps} from '../../types/queryGraph';
import {
    createQueryGraphConnections,
    getQueryGraphNodeSize,
    validateQueryGraph,
} from './helpers/layout';
import i18n from './i18n';
import {type QueryGraphBlock, QueryGraphCanvasBlock} from './internal/QueryGraphCanvasBlock';
import {QueryGraphPopup} from './internal/QueryGraphPopup';
import {getQueryGraphNodeIconSvgs} from './internal/queryGraphIcons';
import {useQueryGraphLayout} from './internal/useQueryGraphLayout';

import './QueryGraph.scss';

const block = cn('qp-query-graph');
const FIT_PADDING = 120;
const ZOOM_STEP = 0.08;
const renderEmptyBlock = () => <React.Fragment />;

type PopupState = {nodeId: string; left: number; top: number};

export function QueryGraph({
    nodes,
    edges,
    loading,
    errorContent,
    className,
    autoCenter = true,
    active = true,
    largeGraphThreshold = 250,
    renderNodePopup,
    onNodeClick,
    onError,
}: QueryGraphProps) {
    const [showLargeGraph, setShowLargeGraph] = useState(false);
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    nodesRef.current = nodes;
    edgesRef.current = edges;

    const structureKey = useMemo(
        () =>
            `${nodes.map(({id, kind}) => `${id}:${kind}`).join('|')}::${edges
                .map(({id, source, target}) => `${id}:${source}:${target}`)
                .join('|')}`,
        [edges, nodes],
    );

    const validationError = useMemo(() => {
        try {
            validateQueryGraph(nodesRef.current, edgesRef.current);
            return undefined;
        } catch (nextError) {
            return nextError instanceof Error
                ? nextError
                : new Error('Unable to build query graph');
        }
        // Only graph structure affects validation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structureKey]);
    useEffect(() => {
        if (validationError) onError?.(validationError);
    }, [onError, validationError]);

    const shouldConfirm = largeGraphThreshold !== false && nodes.length > largeGraphThreshold;
    if (loading)
        return (
            <State className={className}>
                <Loader size="m" />
            </State>
        );
    if (errorContent)
        return (
            <State className={className}>
                <Text color="danger">{errorContent}</Text>
            </State>
        );
    if (validationError)
        return (
            <State className={className}>
                <Text color="danger">{validationError.message}</Text>
            </State>
        );
    if (!nodes.length)
        return (
            <State className={className}>
                <Text color="secondary">{i18n('context_empty')}</Text>
            </State>
        );
    if (shouldConfirm && !showLargeGraph) {
        return (
            <State className={className}>
                <div className={block('large-graph')}>
                    <Text>{i18n('context_large-graph', {count: nodes.length})}</Text>
                    <Button view="action" onClick={() => setShowLargeGraph(true)}>
                        {i18n('action_show-graph')}
                    </Button>
                </div>
            </State>
        );
    }

    return (
        <QueryGraphWithLayout
            nodes={nodes}
            edges={edges}
            structureKey={structureKey}
            autoCenter={autoCenter}
            active={active}
            renderNodePopup={renderNodePopup}
            onNodeClick={onNodeClick}
            onError={onError}
            className={className}
        />
    );
}

type QueryGraphWithLayoutProps = Pick<
    QueryGraphProps,
    | 'nodes'
    | 'edges'
    | 'autoCenter'
    | 'active'
    | 'renderNodePopup'
    | 'onNodeClick'
    | 'onError'
    | 'className'
> & {structureKey: string};

function QueryGraphWithLayout({
    nodes,
    edges,
    structureKey,
    autoCenter,
    active,
    renderNodePopup,
    onNodeClick,
    onError,
    className,
}: QueryGraphWithLayoutProps) {
    const [popup, setPopup] = useState<PopupState>();
    const rootRef = useRef<HTMLDivElement>(null);
    const nodesRef = useRef(nodes);
    const edgesRef = useRef(edges);
    nodesRef.current = nodes;
    edgesRef.current = edges;

    const layoutBlocks = useMemo(
        () =>
            nodesRef.current.map((node) => ({
                id: node.id,
                ...getQueryGraphNodeSize(node),
            })),
        // Node status and presentation do not affect layout.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [structureKey],
    );
    const layoutConnections = useMemo(
        () =>
            edgesRef.current.map((edge) => ({
                id: edge.id,
                sourceBlockId: edge.source,
                targetBlockId: edge.target,
            })),
        // Only graph structure affects layout.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [structureKey],
    );
    const {result, resolvedStructureKey, isInitialLoading, error} = useQueryGraphLayout({
        structureKey,
        blocks: layoutBlocks,
        connections: layoutConnections,
        onError,
    });

    const graphBlocks = useMemo<QueryGraphBlock[]>(
        () =>
            nodes.flatMap((node) => {
                const position = result?.blocks[node.id];
                if (!position) return [];
                const {iconSvg, fallbackIconSvg, iconColorToken, fallbackIconColorToken} =
                    getQueryGraphNodeIconSvgs(node);
                return [
                    {
                        id: node.id,
                        is: 'query-node',
                        name: node.name,
                        selected: false,
                        anchors: [],
                        meta: {
                            node,
                            iconSvg,
                            fallbackIconSvg,
                            iconColorToken,
                            fallbackIconColorToken,
                        },
                        ...getQueryGraphNodeSize(node),
                        ...position,
                    },
                ];
            }),
        [nodes, result],
    );
    const graphConnections = useMemo<TMultipointConnection[]>(
        () => createQueryGraphConnections(edges, result?.edges),
        [edges, result],
    );

    if (error)
        return (
            <State className={className}>
                <Text color="danger">{error.message}</Text>
            </State>
        );
    if (isInitialLoading || !result || !resolvedStructureKey)
        return (
            <State className={className}>
                <Loader size="m" />
            </State>
        );

    return (
        // The renderer is declared below to keep the public component and its states together.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        <QueryGraphRenderer
            ref={rootRef}
            blocks={graphBlocks}
            connections={graphConnections}
            nodes={nodes}
            structureKey={resolvedStructureKey}
            autoCenter={autoCenter}
            active={active}
            popup={popup}
            setPopup={setPopup}
            renderNodePopup={renderNodePopup}
            onNodeClick={onNodeClick}
            className={className}
        />
    );
}

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

const QueryGraphRenderer = React.forwardRef<HTMLDivElement, RendererProps>(
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
        const themeValue = useThemeValue();
        const {graph, api, setEntities, start, stop} = useGraph({
            name: 'query-graph',
            settings: {
                connection: BezierMultipointConnection,
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
        useGraphEvent(graph, 'camera-change', ({scale: nextScale}) => setScale(nextScale));
        useGraphEvent(graph, 'mouseenter', ({target}) => {
            const state = (target as {state?: QueryGraphBlock} | undefined)?.state;
            if (state?.meta?.node) setHoveredNodeId(state.meta.node.id);
        });
        useGraphEvent(graph, 'mouseleave', ({target}) => {
            const state = (target as {state?: QueryGraphBlock} | undefined)?.state;
            if (state?.meta?.node) setHoveredNodeId(undefined);
        });

        useEffect(() => {
            if (!rootRef.current) return;

            const background = getComputedStyle(rootRef.current)
                .getPropertyValue('--g-color-base-background')
                .trim();
            const connection = getComputedStyle(rootRef.current)
                .getPropertyValue('--g-color-line-generic-accent')
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
            return () => {
                if (frame !== undefined) cancelAnimationFrame(frame);
            };
        }, [active, api, attached, autoCenter, setPopup, structureKey]);

        const handleClick: NonNullable<React.ComponentProps<typeof GraphCanvas>['click']> = ({
            target,
            sourceEvent,
        }) => {
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
        const defaultContent = selectedNode ? <QueryGraphPopup node={selectedNode} /> : null;
        let popupContent: React.ReactNode = null;
        if (selectedNode) {
            popupContent = renderNodePopup
                ? renderNodePopup({node: selectedNode, defaultContent})
                : defaultContent;
        }

        return (
            <div ref={rootRef} className={block(null, className)}>
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
                <div className={block('toolbox')}>
                    <Tooltip content={i18n('action_zoom-in')} placement="right">
                        <Button
                            view="raised"
                            pin="round-brick"
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
                            pin="brick-round"
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

function State({className, children}: {className?: string; children: React.ReactNode}) {
    return (
        <div className={block(null, className)}>
            <div className={block('state')}>{children}</div>
        </div>
    );
}
