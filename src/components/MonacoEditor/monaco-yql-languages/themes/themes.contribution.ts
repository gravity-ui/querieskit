import * as monaco from '../fillers/monaco-editor-core';

monaco.editor.defineTheme('vs', {
    base: 'vs',
    inherit: true,
    rules: [
        {token: 'string.tablepath', foreground: '338186'},
        {token: 'constant.yql', foreground: '608b4e'},
        {token: 'keyword.type', foreground: '4d932d'},
        {token: 'string.sql', foreground: 'a31515'},
        {token: 'support.function', foreground: '7a3e9d'},
        {token: 'constant.other.color', foreground: '7a3e9d'},
        {token: 'comment', foreground: '969896'},
    ],
    colors: {
        'editor.lineHighlightBackground': '#EFEFEF',
    },
});

monaco.editor.defineTheme('vs-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
        {token: 'string.tablepath', foreground: '338186'},
        {token: 'constant.yql', foreground: '608b4e'},
        {token: 'storage.type', foreground: '6A8759'},
        {token: 'string.sql', foreground: 'ce9178'},
        {token: 'support.function', foreground: '9e7bb0'},
        {token: 'constant.other.color', foreground: '9e7bb0'},
        {token: 'comment', foreground: '969896'},
    ],
    colors: {
        'editor.lineHighlightBackground': '#282A2E',
    },
});
