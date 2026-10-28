import React, {createRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ThemeProvider} from '@gravity-ui/uikit';
import * as monaco from 'monaco-editor/editor/editor.api';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import {QueryEditor} from '../../../src/widgets/QueryEditor';
import '@gravity-ui/uikit/styles/styles.css';

self.MonacoEnvironment = {getWorker: () => new EditorWorker()};
const refs = [
    createRef<monaco.editor.IStandaloneCodeEditor>(),
    createRef<monaco.editor.IStandaloneCodeEditor>(),
];
const calls = [0, 0];
function App() {
    const [active, setActive] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(true);
    const [increment, setIncrement] = useState(1);
    const [mounted, setMounted] = useState(true);
    window.commandTest = {
        snapshot: () => ({
            calls: [...calls],
            ready: refs.every((ref) => Boolean(ref.current)),
            ids: refs.map((ref) => ref.current?.getId()),
        }),
        focus: (index) => refs[index].current?.focus(),
        configure: (key, value) =>
            flushSync(() => {
                if (key === 'active') setActive(Boolean(value));
                if (key === 'disabled') setDisabled(Boolean(value));
                if (key === 'loading') setLoading(Boolean(value));
                if (key === 'enabled') setEnabled(Boolean(value));
                if (key === 'increment') setIncrement(Number(value));
                if (key === 'mounted') setMounted(Boolean(value));
            }),
    };
    return (
        <ThemeProvider>
            <input aria-label="outside" />
            {mounted &&
                refs.map((ref, index) => (
                    <div key={index} style={{height: 260}}>
                        <QueryEditor
                            value="select 1"
                            onChange={() => {}}
                            editorRef={ref}
                            engines={[{id: 'sql', title: 'SQL', language: 'plaintext'}]}
                            engineId="sql"
                            onEngineChange={() => {}}
                            clusters={[]}
                            onClusterChange={() => {}}
                            active={active}
                            onRun={() => {
                                calls[index] += increment;
                            }}
                            actionStates={{run: {disabled, loading}}}
                            shortcuts={enabled ? {run: [monaco.KeyCode.F8]} : undefined}
                        />
                    </div>
                ))}
        </ThemeProvider>
    );
}
declare global {
    interface Window {
        commandTest: {
            snapshot(): {calls: number[]; ready: boolean; ids: Array<string | undefined>};
            focus(index: number): void;
            configure(
                key: 'active' | 'disabled' | 'loading' | 'enabled' | 'increment' | 'mounted',
                value: boolean | number,
            ): void;
        };
    }
}
createRoot(document.getElementById('root')!).render(<App />);
