import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {ConfigLayout} from '@gravity-ui/dashkit';
import {Dashboard} from '../../../src/components/Dashboard';
import '@gravity-ui/uikit/styles/styles.css';

const initialLayout: ConfigLayout[] = [
    {i: 'a', x: 0, y: 0, w: 2, h: 2},
    {i: 'b', x: 2, y: 0, w: 2, h: 2},
];
const items = ['a', 'b'].map((id) => ({
    id,
    content: <div data-testid={`dashboard-${id}`}>{id}</div>,
}));
const grid = {cols: 4, rowHeight: 64, gap: 8, compactType: null};
let calls: ConfigLayout[][] = [];

function App() {
    const [controlled, setControlled] = useState(true);
    const [layout, setLayout] = useState(initialLayout);
    const [revision, setRevision] = useState(0);
    const [reversed, setReversed] = useState(false);
    window.dashboardTest = {
        snapshot: () => ({calls, layout}),
        external: () => flushSync(() => setLayout([{...initialLayout[0], y: 4}, initialLayout[1]])),
        uncontrolled: () =>
            flushSync(() => {
                calls = [];
                setControlled(false);
            }),
        rerender: () => flushSync(() => setRevision((value) => value + 1)),
        reverse: () => flushSync(() => setReversed((value) => !value)),
    };
    return (
        <ThemeProvider>
            <div style={{width: 800, height: 700}} data-revision={revision}>
                <Dashboard
                    key={controlled ? 'controlled' : 'uncontrolled'}
                    items={reversed ? [...items].reverse() : items}
                    layout={controlled ? layout : undefined}
                    defaultLayout={initialLayout}
                    grid={grid}
                    onLayoutChange={(next) => {
                        calls.push(next);
                    }}
                />
            </div>
        </ThemeProvider>
    );
}

declare global {
    interface Window {
        dashboardTest: {
            snapshot(): {calls: ConfigLayout[][]; layout: ConfigLayout[]};
            external(): void;
            uncontrolled(): void;
            rerender(): void;
            reverse(): void;
        };
    }
}

createRoot(document.getElementById('root')!).render(<App />);
