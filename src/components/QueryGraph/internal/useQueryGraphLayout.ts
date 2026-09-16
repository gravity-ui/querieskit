import {useCallback, useEffect, useRef, useState} from 'react';
import {type ConverterResult, useLayeredLayout} from '@gravity-ui/graph';

type QueryGraphLayoutInput = {
    structureKey: string;
    blocks: Array<{id: string; width: number; height: number}>;
    connections: Array<{
        id: string;
        sourceBlockId: string;
        targetBlockId: string;
    }>;
    onError?: (error: Error) => void;
};

type ResolvedLayout = {structureKey: string; result: ConverterResult};

export function useQueryGraphLayout({
    structureKey,
    blocks,
    connections,
    onError,
}: QueryGraphLayoutInput) {
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;
    const requestedKeyRef = useRef(structureKey);
    const [resolved, setResolved] = useState<ResolvedLayout>();
    const [error, setError] = useState<Error>();

    const handleError = useCallback((nextError: Error) => {
        setError(nextError);
        onErrorRef.current?.(nextError);
    }, []);
    const {result, isLoading} = useLayeredLayout({blocks, connections, onError: handleError});

    useEffect(() => {
        setError(undefined);
    }, [structureKey]);
    useEffect(() => {
        if (isLoading) requestedKeyRef.current = structureKey;
    }, [isLoading, structureKey]);
    useEffect(() => {
        if (!isLoading && result && requestedKeyRef.current === structureKey) {
            setResolved({structureKey, result});
        }
    }, [isLoading, result, structureKey]);

    return {
        result: resolved?.result,
        resolvedStructureKey: resolved?.structureKey,
        isInitialLoading: isLoading && !resolved,
        error,
    };
}
