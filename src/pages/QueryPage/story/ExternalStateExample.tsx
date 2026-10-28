import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Button, Flex, Progress, Text, TextInput} from '@gravity-ui/uikit';
import type {editor} from 'monaco-editor';
import {KeyCode, KeyMod} from 'monaco-editor/editor/editor.api';
import {QueryPage} from '..';
import {MonacoEditor} from '../../../components/MonacoEditor';
import {createQueryEditorPreset} from '../../../helpers/queryEditorPreset';
import type {EditorExtension, EditorProviders} from '../../../types/editorProviders';
import type {QueryExecutionTab} from '../../../types/queryExecutionPanel';
import './ExternalStateExample.scss';

const engines = [
    {id: 'sql', title: 'SQL', language: 'clickhouse'},
    {id: 'analytics', title: 'Analytics', language: 'clickhouse'},
];
const clusters = [
    {id: 'development', title: 'Development'},
    {id: 'production', title: 'Production'},
];
const preset = createQueryEditorPreset({
    listPathChildren: ({clusterId, token}) =>
        token.isCancellationRequested ? [] : [{name: `${clusterId}_events`, kind: 'table'}],
    getTableSchema: () => [
        {name: 'region', type: 'String'},
        {name: 'total', type: 'Int64'},
    ],
});
const initialQuery = 'SELECT region, count(*) AS total\nFROM events\nGROUP BY region;';
const tabs: QueryExecutionTab[] = [
    {
        id: 'rows',
        type: 'result',
        title: 'Rows',
        props: {
            columns: [
                {name: 'region', type: ['DataType', 'Utf8']},
                {name: 'total', type: ['DataType', 'Int64']},
            ],
            rows: [
                {region: 'North', total: '12'},
                {region: 'South', total: '8'},
            ],
        },
    },
    {
        id: 'charts',
        type: 'charts',
        props: {
            dataSource: {
                line: {
                    totals: {
                        type: 'line',
                        seriesId: 'totals',
                        name: 'Totals',
                        data: [
                            {x: 1, y: 12},
                            {x: 2, y: 8},
                        ],
                    },
                },
            },
        },
    },
];

/** All application state stays outside QueryPage, including file and execution state. */
export function ExternalStateExample() {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [value, setValue] = useState(initialQuery);
    const [engineId, setEngineId] = useState('sql');
    const [clusterId, setClusterId] = useState('development');
    const [queryName, setQueryName] = useState('Regional totals');
    const [attachment, setAttachment] = useState('notes.sql');
    const [fileValue, setFileValue] = useState('-- Shared scratch file\nSELECT 42;');
    const [fileOpen, setFileOpen] = useState(false);
    const [fileExpanded, setFileExpanded] = useState(false);
    const [fileWidth, setFileWidth] = useState(320);
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultHeight, setResultHeight] = useState(260);
    const [diagnostics, setDiagnostics] = useState<editor.IMarkerData[]>([]);
    const [cursorLine, setCursorLine] = useState(1);
    const extensions = useMemo<EditorExtension[]>(
        () => [
            {
                setup: ({editor: instance}) => {
                    const listener = instance.onDidChangeCursorPosition(({position}) =>
                        setCursorLine(position.lineNumber),
                    );
                    return () => listener.dispose();
                },
            },
        ],
        [],
    );
    const providers = useMemo<EditorProviders>(
        () => ({
            hover: {
                mode: 'append',
                provider: {
                    provideHover: () => ({
                        contents: [{value: `Application context: ${engineId} / ${clusterId}`}],
                    }),
                },
            },
        }),
        [engineId, clusterId],
    );
    useEffect(() => {
        if (!running) return undefined;
        const timer = window.setInterval(
            () => setProgress((current) => Math.min(current + 5, 100)),
            500,
        );
        return () => window.clearInterval(timer);
    }, [running]);
    useEffect(() => {
        if (progress === 100) setRunning(false);
    }, [progress]);
    let executionStatus = 'Ready';
    if (progress > 0) executionStatus = 'Stopped';
    if (progress === 100) executionStatus = 'Completed';
    if (running) executionStatus = 'Running';
    const validate = () =>
        setDiagnostics([
            {
                severity: 4,
                message: 'Example diagnostic: verify the events table.',
                startLineNumber: 2,
                endLineNumber: 2,
                startColumn: 6,
                endColumn: 12,
            },
        ]);

    return (
        <Flex direction="column" gap={2} className="qp-external-state-example">
            <Flex gap={2} wrap alignItems="center">
                <Button onClick={() => setFileOpen(true)}>Open file</Button>
                <Button
                    onClick={() => {
                        editorRef.current?.setPosition({lineNumber: 2, column: 1});
                        editorRef.current?.revealLineInCenter(2);
                        editorRef.current?.focus();
                    }}
                >
                    Go to line 2
                </Button>
                <Button onClick={() => setDiagnostics([])}>Clear diagnostics</Button>
                <Button onClick={() => setResultHeight(120)}>Minimum results height</Button>
                <Text>Cursor line: {cursorLine}</Text>
            </Flex>
            <div className="qp-external-state-example__page">
                <QueryPage
                    defaultSidebarCollapsed
                    sidebarProps={{tabs: []}}
                    tabsProps={{
                        activeTab: 'query',
                        onActiveTabChange: () => editorRef.current?.focus(),
                        // This example intentionally keeps a single application-owned query.
                        onAddTab: () => editorRef.current?.focus(),
                        onCloseTab: () => editorRef.current?.focus(),
                        hideCloseOnLastTab: true,
                        items: [
                            {
                                id: 'query',
                                type: 'query',
                                status: 'draft',
                                title: queryName,
                                executionPanelHeight: resultHeight,
                                onExecutionPanelHeightChange: setResultHeight,
                                editorProps: {
                                    active: !fileExpanded,
                                    // Monaco encodes modifiers and keys as a bitmask.
                                    // eslint-disable-next-line no-bitwise
                                    shortcuts: {run: [KeyMod.CtrlCmd | KeyCode.Enter]},
                                    value,
                                    onChange: setValue,
                                    engines,
                                    engineId,
                                    onEngineChange: setEngineId,
                                    clusters,
                                    clusterId,
                                    onClusterChange: setClusterId,
                                    editorRef,
                                    preset,
                                    providers,
                                    extensions,
                                    diagnostics,
                                    hiddenActions:
                                        engineId === 'analytics' ? ['format', 'validate'] : [],
                                    hiddenPanels: ['parameters'],
                                    onRun: () => {
                                        setProgress(0);
                                        setRunning(true);
                                    },
                                    onFormat: () => setValue((current) => current.trim() + '\n'),
                                    onValidate: validate,
                                    actionStates: {run: {disabled: running}},
                                    settings: (
                                        <TextInput
                                            controlProps={{'aria-label': 'Query name'}}
                                            value={queryName}
                                            onUpdate={setQueryName}
                                        />
                                    ),
                                    attachments: (
                                        <TextInput
                                            controlProps={{'aria-label': 'Attachment name'}}
                                            value={attachment}
                                            onUpdate={setAttachment}
                                        />
                                    ),
                                },
                                executionPanelProps: {
                                    tabs,
                                    active: !fileExpanded,
                                    headerActions: (
                                        <Button
                                            disabled={!running}
                                            onClick={() => setRunning(false)}
                                        >
                                            Stop
                                        </Button>
                                    ),
                                    statusContent: (
                                        <Flex
                                            direction="column"
                                            gap={1}
                                            className="qp-external-state-example__status"
                                        >
                                            <Text>
                                                {executionStatus} · {engineId} · {clusterId}
                                            </Text>
                                            <Progress value={progress} text={`${progress}%`} />
                                            <Text color="secondary">
                                                Example results remain available while a simulated
                                                execution runs. Execution and cancellation belong to
                                                the application.
                                            </Text>
                                        </Flex>
                                    ),
                                },
                                // A fresh callback each render is safe: keep the returned structure stable.
                                renderWorkspace: ({children, active}) => (
                                    <Flex
                                        className="qp-external-state-example__workspace"
                                        data-active={active}
                                    >
                                        <div
                                            className="qp-external-state-example__query"
                                            hidden={fileExpanded}
                                        >
                                            {children}
                                        </div>
                                        <Flex
                                            direction="column"
                                            gap={2}
                                            className="qp-external-state-example__file"
                                            style={{
                                                display: fileOpen ? undefined : 'none',
                                                width: fileExpanded ? '100%' : fileWidth,
                                            }}
                                        >
                                            <Flex gap={2} wrap>
                                                <Button
                                                    onClick={() =>
                                                        setFileExpanded((current) => !current)
                                                    }
                                                >
                                                    {fileExpanded ? 'Restore file' : 'Expand file'}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setFileOpen(false);
                                                        setFileExpanded(false);
                                                    }}
                                                >
                                                    Close file
                                                </Button>
                                                <Button
                                                    disabled={fileExpanded}
                                                    onClick={() =>
                                                        setFileWidth((current) =>
                                                            current === 320 ? 440 : 320,
                                                        )
                                                    }
                                                >
                                                    Change file width
                                                </Button>
                                            </Flex>
                                            <Text>notes.sql</Text>
                                            <div className="qp-external-state-example__file-editor">
                                                <MonacoEditor
                                                    value={fileValue}
                                                    onChange={setFileValue}
                                                    language="sql"
                                                />
                                            </div>
                                        </Flex>
                                    </Flex>
                                ),
                            },
                        ],
                    }}
                />
            </div>
        </Flex>
    );
}
