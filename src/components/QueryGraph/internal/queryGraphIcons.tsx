import React from 'react';
import {
    CircleCheck,
    CircleMinus,
    CirclePlay,
    CircleXmark,
    CodeCommit,
    CodeMerge,
    Eraser,
    LayoutHeaderCellsLarge,
    ListTimeline,
    Molecule,
    Shuffle,
} from '@gravity-ui/icons';
import {renderToStaticMarkup} from 'react-dom/server';

import type {
    QueryGraphNode,
    QueryGraphNodeStatus,
    QueryGraphOperationType,
} from '../../../types/queryGraph';

type SvgIcon = (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;

// Map, Reduce and MapReduce paths are adapted from the corresponding neutral
// operation icons in ytsaurus/ytsaurus-ui (Apache-2.0).
const MapOperationIcon: SvgIcon = (props) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M3 2.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M2.25.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5M3 8a.75.75 0 1 1-1.5 0A.75.75 0 0 1 3 8m-.75-2.25a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5M3 13.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M2.25 11a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5m11.5-8a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5m0-2.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5m0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5m0-3a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5m.75 7.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m-.75-2.25a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5"
        />
        <path
            d="M4 2.8h8M4 8h8m-5-2.5L9.5 8 7 10.5m-3 2.8h8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ReduceOperationIcon: SvgIcon = (props) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M4 2.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M3.25.5a2.25 2.25 0 0 1 2.122 1.5h.378a3 3 0 0 1 3 3v2.25h3.94l-1.22-1.22a.75.75 0 0 1 1.06-1.06l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06l1.22-1.22H8.75V11a3 3 0 0 1-3 3h-.378a2.25 2.25 0 1 1 0-1.5h.378A1.5 1.5 0 0 0 7.25 11V8.75H5.372a2.25 2.25 0 1 1 0-1.5H7.25V5a1.5 1.5 0 0 0-1.5-1.5h-.378A2.25 2.25 0 1 1 3.25.5M4 8a.75.75 0 1 1-1.5 0A.75.75 0 0 1 4 8m0 5.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0"
        />
    </svg>
);

const MapReduceOperationIcon: SvgIcon = (props) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M3 2.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M4.372 3.5A2.25 2.25 0 1 1 4.372 2H6.25a3 3 0 0 1 3 3v.896A2.25 2.25 0 0 1 10.572 7.25H14a.75.75 0 0 1 0 1.5h-3.428A2.25 2.25 0 0 1 9.25 10.104V11a3 3 0 0 1-3 3H4.372a2.25 2.25 0 1 1 0-1.5H6.25a1.5 1.5 0 0 0 1.5-1.5v-.861a2.25 2.25 0 0 1-1.423-1.393L6.25 8.75H4.372a2.25 2.25 0 1 1 0-1.5H6.25l.077.004A2.25 2.25 0 0 1 7.75 5.861V5a1.5 1.5 0 0 0-1.5-1.5zM3 8a.75.75 0 1 1-1.5 0A.75.75 0 0 1 3 8m0 5.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0M9.2 8a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0"
        />
        <path
            d="M12.5 5.5 15 8l-2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const operationIcons: Record<QueryGraphOperationType, SvgIcon> = {
    read: ListTimeline,
    map: MapOperationIcon,
    reduce: ReduceOperationIcon,
    'map-reduce': MapReduceOperationIcon,
    merge: CodeMerge,
    sort: Shuffle,
    erase: Eraser,
    commit: CodeCommit,
    operation: Molecule,
};

const statusIcons: Partial<Record<QueryGraphNodeStatus, SvgIcon>> = {
    running: CirclePlay,
    completed: CircleCheck,
    failed: CircleXmark,
    aborted: CircleMinus,
};
const statusIconSvgCache = new Map<QueryGraphNodeStatus, string | undefined>();
const defaultIconSvgCache = new Map<string, string>();
const customIconSvgCache = new WeakMap<object, string | undefined>();

export function getDefaultQueryGraphNodeIcon(node: QueryGraphNode): React.ReactElement {
    const IconComponent =
        node.kind === 'operation'
            ? operationIcons[node.operationType ?? 'operation']
            : LayoutHeaderCellsLarge;
    return <IconComponent />;
}

export function getQueryGraphNodeIcon(node: QueryGraphNode): React.ReactElement {
    return React.isValidElement(node.icon) && queryGraphIconToSvg(node.icon)
        ? node.icon
        : getDefaultQueryGraphNodeIcon(node);
}

export function getQueryGraphNodeIconSvgs(node: QueryGraphNode) {
    const defaultKey =
        node.kind === 'operation' ? `operation:${node.operationType ?? 'operation'}` : 'resource';
    const defaultIconColorToken = '--g-color-text-misc';
    let fallbackIconSvg = defaultIconSvgCache.get(defaultKey);
    if (!fallbackIconSvg) {
        fallbackIconSvg = queryGraphIconToSvg(getDefaultQueryGraphNodeIcon(node)) ?? '';
        defaultIconSvgCache.set(defaultKey, fallbackIconSvg);
    }

    if (!React.isValidElement(node.icon)) {
        return {
            iconSvg: fallbackIconSvg,
            fallbackIconSvg,
            iconColorToken: defaultIconColorToken,
            fallbackIconColorToken: defaultIconColorToken,
        };
    }
    let iconSvg = customIconSvgCache.get(node.icon);
    if (!customIconSvgCache.has(node.icon)) {
        iconSvg = queryGraphIconToSvg(node.icon);
        customIconSvgCache.set(node.icon, iconSvg);
    }
    return {
        iconSvg: iconSvg ?? fallbackIconSvg,
        fallbackIconSvg,
        iconColorToken: iconSvg ? '--g-color-text-primary' : defaultIconColorToken,
        fallbackIconColorToken: defaultIconColorToken,
    };
}

export function queryGraphIconToSvg(icon: React.ReactNode): string | undefined {
    if (!React.isValidElement(icon)) return undefined;
    try {
        const markup = renderToStaticMarkup(icon);
        return markup.startsWith('<svg') ? markup : undefined;
    } catch {
        return undefined;
    }
}

export function getQueryGraphStatusIconSvg(status: QueryGraphNodeStatus) {
    if (statusIconSvgCache.has(status)) return statusIconSvgCache.get(status);
    const StatusIcon = statusIcons[status];
    const svg = StatusIcon ? queryGraphIconToSvg(<StatusIcon />) : undefined;
    statusIconSvgCache.set(status, svg);
    return svg;
}
