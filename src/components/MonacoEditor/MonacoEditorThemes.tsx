// @ts-ignore monaco-editor ships its own types but the default resolution
// doesn't pick them up for this deep import path in this project setup.
import * as monaco from 'monaco-editor/editor/editor.api';

const lightRules = [
    {token: 'string.tablepath', foreground: '3e999f'},
    {token: 'path', foreground: '3e999f', fontStyle: 'underline'},
    {token: 'string.sql', foreground: 'a31515'},
];

export const YT_LIGHT_MONACO_THEME = 'yt-light';
monaco.editor.defineTheme(YT_LIGHT_MONACO_THEME, {
    base: 'vs',
    inherit: true,
    rules: lightRules,
    colors: {
        'editorLineNumber.foreground': '#000000b3',
        'editor.lineHighlightBackground': '#0000000a',
        'editorGutter.background': '#0000000a',
    },
});

export const YT_LIGHT_HC_MONACO_THEME = 'yt-light-hc';
monaco.editor.defineTheme(YT_LIGHT_HC_MONACO_THEME, {
    base: 'hc-light',
    inherit: true,
    rules: lightRules,
    colors: {},
});

const darkRules = [
    {token: 'string.tablepath', foreground: '3e999f'},
    {token: 'path', foreground: '3e999f', fontStyle: 'underline'},
    {token: 'string.sql', foreground: 'ce9178'},
];

export const YT_DARK_MONACO_THEME = 'yt-dark';
monaco.editor.defineTheme(YT_DARK_MONACO_THEME, {
    base: 'vs-dark',
    inherit: true,
    rules: darkRules,
    colors: {
        'editorLineNumber.foreground': '#ffffffb3',
        'editor.lineHighlightBackground': '#ffffff0a',
        'editorGutter.background': '#ffffff0a',
        'editor.background': '#2d2c33',
    },
});

export const YT_DARK_HC_MONACO_THEME = 'yt-dark-hc';
monaco.editor.defineTheme(YT_DARK_HC_MONACO_THEME, {
    base: 'hc-black',
    inherit: true,
    rules: darkRules,
    colors: {},
});

export type MonacoThemeName =
    | typeof YT_LIGHT_MONACO_THEME
    | typeof YT_LIGHT_HC_MONACO_THEME
    | typeof YT_DARK_MONACO_THEME
    | typeof YT_DARK_HC_MONACO_THEME
    | 'vs'
    | 'vs-dark'
    | 'hc-black'
    | 'hc-light';

export const MONACO_THEME_BY_UI: Record<string, MonacoThemeName> = {
    dark: YT_DARK_MONACO_THEME,
    'dark-hc': YT_DARK_HC_MONACO_THEME,
    light: YT_LIGHT_MONACO_THEME,
    'light-hc': YT_LIGHT_HC_MONACO_THEME,
};
