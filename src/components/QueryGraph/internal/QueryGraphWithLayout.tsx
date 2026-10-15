import React, {useMemo, useRef, useState} from 'react';
import type {TMultipointConnection} from '@gravity-ui/graph';
import {Loader, Text} from '@gravity-ui/uikit';
import type {QueryGraphProps} from '../../../types/queryGraph';
import {createQueryGraphConnections, getQueryGraphNodeSize} from '../helpers/layout';
import type {QueryGraphBlock} from './QueryGraphCanvasBlock';
import {getQueryGraphNodeIconSvgs} from './queryGraphIcons';
import {useQueryGraphLayout} from './useQueryGraphLayout';
import {QueryGraphRenderer} from './QueryGraphRenderer';
import type {PopupState} from './queryGraphTypes';
import {QueryGraphState as State} from './QueryGraphState';

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

export function QueryGraphWithLayout({
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
