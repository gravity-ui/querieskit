/// <reference types="vite/client" />

import type {Decorator, Preview} from '@storybook/react';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import React, {useEffect, useState} from 'react';
import {settings} from '@gravity-ui/date-utils';
import {setLang} from '../src/i18n';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/languages/features/json/json.worker?worker';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/unipika/dist/unipika.css';
import '@gravity-ui/illustrations/styles/styles.scss';
import './redefinition.css';

// Vite must emit the worker as an asset; Monaco's default URL cannot resolve
// relative bootstrap imports from the production preview's bundled code.
self.MonacoEnvironment = {
    getWorker: (_moduleId, label) => (label === 'json' ? new JsonWorker() : new EditorWorker()),
};

configure({lang: 'en'});

function LocalePreview({lang, children}: {lang: 'en' | 'ru'; children: React.ReactNode}) {
    const [readyLang, setReadyLang] = useState<string>();
    useEffect(() => {
        let active = true;
        settings.loadLocale(lang).then(() => {
            if (!active) return;
            settings.setLocale(lang);
            configure({lang});
            setLang(lang);
            setReadyLang(lang);
        });
        return () => {
            active = false;
        };
    }, [lang]);
    return readyLang === lang ? <React.Fragment key={lang}>{children}</React.Fragment> : null;
}

const withYtComponentsTheme: Decorator = (Story, context) => {
    const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
    const lang = context.globals.locale === 'ru' ? 'ru' : 'en';
    return (
        <LocalePreview lang={lang}>
            <ThemeProvider theme={theme}>
                <Story />
            </ThemeProvider>
        </LocalePreview>
    );
};

const preview: Preview = {
    decorators: [withYtComponentsTheme],
    globalTypes: {
        locale: {
            defaultValue: 'en',
            toolbar: {
                title: 'Language',
                icon: 'globe',
                items: [
                    {value: 'en', title: 'English'},
                    {value: 'ru', title: 'Русский'},
                ],
                dynamicTitle: true,
            },
        },
        theme: {
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                ],
                dynamicTitle: true,
            },
        },
    },
    parameters: {},
};

export default preview;
