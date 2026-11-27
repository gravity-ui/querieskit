const MONACO_VISIBLE_LINES = 4;

export const fitQueryToVisibleLines = (query = '', previewLineNumber?: number) => {
    const lines = query.split(/\r\n|\r|\n/);
    let startIndex = 0;

    if (typeof previewLineNumber === 'number' && Number.isInteger(previewLineNumber)) {
        const targetLine = Math.max(1, Math.min(previewLineNumber, lines.length));
        startIndex = Math.max(0, Math.min(targetLine - 2, lines.length - MONACO_VISIBLE_LINES));
    }

    const visibleLines = lines.slice(startIndex, startIndex + MONACO_VISIBLE_LINES);
    while (visibleLines.length < MONACO_VISIBLE_LINES) {
        visibleLines.push('');
    }

    return {query: visibleLines.join('\n'), startLineNumber: startIndex + 1};
};
