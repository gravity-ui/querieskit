import React, {useMemo, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import * as monaco from 'monaco-editor/editor/editor.api';
import {action} from 'storybook/actions';
import {QueryEditor, createQueryEditorPreset} from '../../..';
import type {EditorExtension, EditorProviders, QueryEditorProps} from '../../..';

const ENGINES = [
    {id: 'yql', title: 'YQL', language: 'yql'},
    {id: 'clickhouse', title: 'ClickHouse', language: 'clickhouse'},
    {id: 'ytql', title: 'YTQL', language: 'ytql'},
    {id: 'spyt', title: 'SPYT', language: 'spyt'},
];
const CLUSTERS = [
    {id: 'demo', title: 'Demo'},
    {id: 'sandbox', title: 'Sandbox'},
];
const preset = createQueryEditorPreset({
    listPathChildren: ({path, clusterId, token}) => {
        action('listPathChildren')({path, clusterId});
        if (token.isCancellationRequested) return [];
        return [{name: 'events', path: '//demo/events', kind: 'table'}];
    },
    getTableSchema: ({path, clusterId, token}) => {
        action('getTableSchema')({path, clusterId});
        if (token.isCancellationRequested) return [];
        return [
            {name: 'event_id', type: 'String'},
            {name: 'created_at', type: 'Timestamp'},
        ];
    },
    onReferenceClick: action('onReferenceClick'),
});

const meta: Meta<typeof QueryEditor> = {
    title: 'Modules/QueryEditor/Extensions',
    component: QueryEditor,
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<typeof QueryEditor>;

function Example({
    initialValue = 'SELECT * FROM `//demo/events`;',
    ...props
}: Partial<QueryEditorProps> & {initialValue?: string}) {
    const [value, setValue] = useState(initialValue);
    const [engineId, setEngineId] = useState('yql');
    const [clusterId, setClusterId] = useState('demo');
    return (
        <div style={{height: 380, width: '100%', minWidth: 0}}>
            <QueryEditor
                value={value}
                onChange={setValue}
                engines={ENGINES}
                engineId={engineId}
                onEngineChange={setEngineId}
                clusters={CLUSTERS}
                clusterId={clusterId}
                onClusterChange={setClusterId}
                onRun={action('run')}
                onFormat={action('format')}
                onValidate={action('validate')}
                {...props}
            />
        </div>
    );
}

export const CatalogAndDialects: Story = {
    render: () => (
        <Flex direction="column" gap={3}>
            <Text>
                Choose a language in Settings. Use Ctrl+Space for suggestions; Ctrl/Cmd+click a
                table reference to log navigation.
            </Text>
            <Example preset={preset} />
        </Flex>
    ),
};

function customCompletion(label: string): monaco.languages.CompletionItemProvider {
    return {
        provideCompletionItems(model, position) {
            const word = model.getWordUntilPosition(position);
            return {
                suggestions: [
                    {
                        label,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: `${label}(\${1:value})`,
                        insertTextRules:
                            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn,
                        },
                    },
                ],
            };
        },
    };
}
const replacement: EditorProviders = {
    completion: {mode: 'replace', provider: customCompletion('APP_FUNCTION')},
};
const addition: EditorProviders = {
    completion: {mode: 'append', provider: customCompletion('APP_FUNCTION')},
};

export const ReplaceCompletion: Story = {
    render: () => <Example preset={preset} providers={replacement} initialValue="SELECT " />,
};
export const AppendCompletion: Story = {
    render: () => <Example preset={preset} providers={addition} initialValue="SELECT " />,
};
export const IndependentEditors: Story = {
    render: () => (
        <Flex direction="column" gap={3}>
            <Text>
                The first editor replaces completion. The second keeps the catalog preset. Their
                models and contexts are independent.
            </Text>
            <Example preset={preset} providers={replacement} />
            <Example preset={preset} />
        </Flex>
    ),
};

const inlineProviders: EditorProviders = {
    inlineCompletion: {
        mode: 'replace',
        provider: {
            provideInlineCompletions(model, position, _context, token) {
                if (
                    token.isCancellationRequested ||
                    position.column !== model.getLineMaxColumn(position.lineNumber)
                )
                    return {items: []};
                return {
                    items: [
                        {
                            insertText: ' SELECT event_id FROM events',
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column,
                                endColumn: position.column,
                            },
                        },
                    ],
                };
            },
            handleItemDidShow: () => action('inline shown')(),
            handlePartialAccept: (_list, _item, _count, info) =>
                action('inline partial acceptance')(info),
            handleEndOfLifetime: (_list, _item, reason) => {
                const labels = {
                    [monaco.languages.InlineCompletionEndOfLifeReasonKind.Accepted]: 'accepted',
                    [monaco.languages.InlineCompletionEndOfLifeReasonKind.Rejected]: 'rejected',
                    [monaco.languages.InlineCompletionEndOfLifeReasonKind.Ignored]: 'ignored',
                };
                action(`inline ${labels[reason.kind]}`)(reason);
            },
            disposeInlineCompletions: (_list, reason) => action('inline disposed')(reason),
        },
    },
};
export const InlineLifecycle: Story = {
    render: () => (
        <Flex direction="column" gap={3}>
            <Text>
                Type at the end of a line. Tab accepts the suggestion; Escape dismisses it.
                Lifecycle events appear in Actions.
            </Text>
            <Example
                initialValue="-- Inline demo\n"
                providers={inlineProviders}
                editorOptions={{inlineSuggest: {enabled: true}}}
            />
        </Flex>
    ),
};

function DiagnosticsExample() {
    const [visible, setVisible] = useState(true);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const diagnostics = useMemo(
        () =>
            visible
                ? [
                      {
                          severity: monaco.MarkerSeverity.Error,
                          message: 'Example validation error supplied by the application',
                          startLineNumber: 2,
                          endLineNumber: 2,
                          startColumn: 1,
                          endColumn: 8,
                      },
                  ]
                : [],
        [visible],
    );
    return (
        <Flex direction="column" gap={3}>
            <Flex gap={2}>
                <Button onClick={() => setVisible(!visible)}>Toggle diagnostics</Button>
                <Button
                    onClick={() => {
                        const editor = editorRef.current;
                        const selection = editor?.getSelection();
                        if (editor && selection) {
                            editor.pushUndoStop();
                            editor.executeEdits('example', [{range: selection, text: 'event_id'}]);
                            editor.pushUndoStop();
                            editor.focus();
                        }
                    }}
                >
                    Insert at selection
                </Button>
            </Flex>
            <Example
                initialValue="SELECT\nunknown\nFROM events;"
                editorRef={editorRef}
                diagnostics={diagnostics}
                highlightErrorLines
                highlightedLine={visible ? 2 : undefined}
                onLineNumberClick={action('line number')}
                onFocus={action('focus')}
                onBlur={action('blur')}
            />
        </Flex>
    );
}
export const DiagnosticsAndRef: Story = {render: () => <DiagnosticsExample />};

const statusExtension: EditorExtension = {
    setup({editor, statusBarElement}) {
        if (!statusBarElement) return () => {};
        const label = document.createElement('span');
        statusBarElement.append(label);
        const update = () => {
            const position = editor.getPosition();
            label.textContent = `Line ${position?.lineNumber ?? 1}, column ${position?.column ?? 1}`;
        };
        update();
        const listener = editor.onDidChangeCursorPosition(update);
        return () => {
            listener.dispose();
            label.remove();
        };
    },
};
const extensions = [statusExtension];
function StatusExample() {
    const [visible, setVisible] = useState(true);
    return (
        <Flex direction="column" gap={3}>
            <Button onClick={() => setVisible(!visible)}>Toggle status bar</Button>
            <Example extensions={extensions} showStatusBar={visible} />
        </Flex>
    );
}
export const StatusExtension: Story = {render: () => <StatusExample />};
