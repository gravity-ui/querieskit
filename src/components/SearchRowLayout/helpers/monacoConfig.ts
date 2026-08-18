import type {MonacoEditorConfig} from '../../MonacoEditor';

const MONACO_LINE_HEIGHT = 18;

export const MONACO_CONFIG: MonacoEditorConfig = {
    contextmenu: false,
    fontSize: 12,
    lineHeight: MONACO_LINE_HEIGHT,
    renderWhitespace: 'boundary',
    minimap: {
        enabled: false,
    },
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    overviewRulerLanes: 0,
    lineNumbersMinChars: 2,
    glyphMargin: false,
    scrollbar: {
        vertical: 'hidden',
        verticalHasArrows: false,
        horizontal: 'auto',
        useShadows: false,
        alwaysConsumeMouseWheel: false,
    },
};
