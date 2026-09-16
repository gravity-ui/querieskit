import type React from 'react';

export type QueryGraphNodeKind = 'operation' | 'input' | 'output';
export type QueryGraphOperationType =
    'read' | 'map' | 'reduce' | 'map-reduce' | 'merge' | 'sort' | 'erase' | 'commit' | 'operation';
export type QueryGraphNodeStatus =
    'not-started' | 'waiting' | 'running' | 'completed' | 'failed' | 'aborted';

export type QueryGraphJobCounts = {
    total?: number;
    pending?: number;
    running?: number;
    completed?: number;
    failed?: number;
    aborted?: number;
};

export type QueryGraphProgress = QueryGraphJobCounts & {
    /** A value between 0 and 1. Takes precedence over completed / total. */
    fraction?: number;
};

export type QueryGraphStage = {name: string; duration: number};
export type QueryGraphDetailValue = string | number | boolean | null | QueryGraphDetailValue[];
export type QueryGraphDetail = {
    name: string;
    value?: QueryGraphDetailValue;
    children?: QueryGraphDetail[];
};
export type QueryGraphSchemaColumn = {name: string; type: string};
export type QueryGraphSchema = {
    name: string;
    columns: QueryGraphSchemaColumn[];
};

export type QueryGraphNodePopup = {
    stages?: QueryGraphStage[];
    details?: QueryGraphDetail[];
    jobs?: QueryGraphJobCounts;
    inputs?: QueryGraphSchema[];
    outputs?: QueryGraphSchema[];
};

export type QueryGraphNode = {
    id: string;
    kind: QueryGraphNodeKind;
    name: string;
    label?: string;
    operationType?: QueryGraphOperationType;
    /**
     * Overrides the built-in operation icon. Canvas rendering supports static SVG React markup.
     * Non-SVG content falls back to the icon selected by `operationType`.
     */
    icon?: React.ReactNode;
    status?: QueryGraphNodeStatus;
    progress?: QueryGraphProgress;
    popup?: QueryGraphNodePopup;
};

export type QueryGraphEdge = {id: string; source: string; target: string};

export type QueryGraphRenderPopupContext = {
    node: QueryGraphNode;
    defaultContent: React.ReactNode;
};

export type QueryGraphProps = {
    nodes: QueryGraphNode[];
    edges: QueryGraphEdge[];
    loading?: boolean;
    errorContent?: React.ReactNode;
    className?: string;
    autoCenter?: boolean;
    /** Pauses rendering while preserving the camera state. */
    active?: boolean;
    largeGraphThreshold?: number | false;
    renderNodePopup?: (context: QueryGraphRenderPopupContext) => React.ReactNode;
    onNodeClick?: (node: QueryGraphNode, event: MouseEvent) => void;
    onError?: (error: Error) => void;
};

export type QueryProgressView = 'graph' | 'timeline';
export type QueryProgressProps = {
    graphProps: QueryGraphProps;
    view?: QueryProgressView;
    defaultView?: QueryProgressView;
    onViewChange?: (view: QueryProgressView) => void;
    className?: string;
};
