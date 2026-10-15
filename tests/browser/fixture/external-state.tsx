import React from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import {ExternalStateExample} from '../../../src/pages/QueryPage/story/ExternalStateExample';
import {setLang} from '../../../src/i18n';
import '@gravity-ui/uikit/styles/styles.css';

self.MonacoEnvironment = {getWorker: () => new EditorWorker()};
configure({lang: 'en'});
setLang('en');
createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <ExternalStateExample />
    </ThemeProvider>,
);
