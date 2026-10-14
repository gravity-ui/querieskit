import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Button, Loader, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {QueryGraphProps} from '../../types/queryGraph';
import {validateQueryGraph} from './helpers/layout';
import {QueryGraphWithLayout} from './internal/QueryGraphWithLayout';
import {QueryGraphState as State} from './internal/QueryGraphState';
import i18n from './i18n';
import './QueryGraph.scss';
const block = cn('qp-query-graph');

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
