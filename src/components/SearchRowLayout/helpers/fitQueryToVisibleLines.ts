const MONACO_VISIBLE_LINES = 4;

export const fitQueryToVisibleLines = (query = '') => {
    const lines = query.split(/\r\n|\r|\n/).slice(0, MONACO_VISIBLE_LINES);
    while (lines.length < MONACO_VISIBLE_LINES) {
        lines.push('');
    }

    return lines.join('\n');
};
