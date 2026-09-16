import type {TMultipointConnection} from '@gravity-ui/graph';

import type {QueryGraphEdge, QueryGraphNode} from '../../../types/queryGraph';

const OPERATION_SIZE = 65;
const RESOURCE_WIDTH = 36;
const RESOURCE_HEIGHT = 36;

export function getQueryGraphNodeSize(node: QueryGraphNode) {
    return node.kind === 'operation'
        ? {width: OPERATION_SIZE, height: OPERATION_SIZE}
        : {width: RESOURCE_WIDTH, height: RESOURCE_HEIGHT};
}

export function validateQueryGraph(nodes: QueryGraphNode[], edges: QueryGraphEdge[]) {
    const ids = new Set<string>();
    for (const node of nodes) {
        if (ids.has(node.id)) throw new Error(`Duplicate query graph node id: ${node.id}`);
        ids.add(node.id);
    }

    const edgeIds = new Set<string>();
    for (const edge of edges) {
        if (edgeIds.has(edge.id)) throw new Error(`Duplicate query graph edge id: ${edge.id}`);
        edgeIds.add(edge.id);
        if (!ids.has(edge.source)) throw new Error(`Unknown source node: ${edge.source}`);
        if (!ids.has(edge.target)) throw new Error(`Unknown target node: ${edge.target}`);
    }

    const incoming = new Map(nodes.map((node) => [node.id, 0]));
    const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]));
    edges.forEach((edge) => {
        incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
        outgoing.get(edge.source)?.push(edge.target);
    });

    const queue = nodes.filter((node) => incoming.get(node.id) === 0).map((node) => node.id);
    let visited = 0;
    for (let index = 0; index < queue.length; index++) {
        const id = queue[index];
        visited++;
        for (const target of outgoing.get(id) ?? []) {
            const nextIncoming = (incoming.get(target) ?? 0) - 1;
            incoming.set(target, nextIncoming);
            if (nextIncoming === 0) queue.push(target);
        }
    }
    if (visited !== nodes.length) throw new Error('Query graph contains a cycle');
}

export function createQueryGraphConnections(
    edges: QueryGraphEdge[],
    routes?: Record<string | number | symbol, Pick<TMultipointConnection, 'points' | 'labels'>>,
): TMultipointConnection[] {
    return edges.map((edge) => ({
        id: edge.id,
        sourceBlockId: edge.source,
        targetBlockId: edge.target,
        ...routes?.[edge.id],
    }));
}

export function getQueryGraphProgress(node: QueryGraphNode) {
    const fraction = node.progress?.fraction;
    if (typeof fraction === 'number') return Math.min(1, Math.max(0, fraction));
    const total = node.progress?.total ?? 0;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, (node.progress?.completed ?? 0) / total));
}
