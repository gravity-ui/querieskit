import {describe, expect, it, vi} from 'vitest';
import type * as Monaco from 'monaco-editor';

import {createQueryEditorPreset} from '../../src/helpers/queryEditorPreset';
import {
    activeCluster,
    completionTarget,
    tableReferences,
} from '../../src/helpers/queryEditorPreset/syntax';
import type {EditorSetupContext} from '../../src/types/editorProviders';
import type {QueryEditorPresetOptions} from '../../src/types/queryEditorPreset';

function setup(query: string, language = 'yql', options: QueryEditorPresetOptions = {}) {
    const offset = query.indexOf('|');
    const value = query.replace('|', '');
    const lines = value.split('\n');
    const positionAt = (index: number) => {
        const precedingLines = value.slice(0, index).split('\n');
        return {
            lineNumber: precedingLines.length,
            column: precedingLines[precedingLines.length - 1].length + 1,
        };
    };
    const model = {
        getValue: () => value,
        getLanguageId: () => language,
        getOffsetAt: (position: Monaco.Position) =>
            lines
                .slice(0, position.lineNumber - 1)
                .reduce((sum, line) => sum + line.length + 1, 0) +
            position.column -
            1,
        getPositionAt: positionAt,
    } as Monaco.editor.ITextModel;
    const token = {
        isCancellationRequested: false,
        onCancellationRequested: vi.fn(),
    } as Monaco.CancellationToken;
    const mouse = vi.fn();
    const release = vi.fn();
    const monaco = {
        languages: {
            CompletionItemKind: {
                Keyword: 1,
                TypeParameter: 2,
                Function: 3,
                Variable: 4,
                Folder: 5,
                Struct: 6,
                Field: 7,
            },
            CompletionItemInsertTextRule: {InsertAsSnippet: 4},
            getLanguages: () => [],
            register: vi.fn(),
            setMonarchTokensProvider: () => ({dispose: release}),
            setLanguageConfiguration: () => ({dispose: release}),
        },
        editor: {MouseTargetType: {CONTENT_TEXT: 6}},
    } as unknown as EditorSetupContext['monaco'];
    const instance = createQueryEditorPreset(options).create({
        model,
        monaco,
        editor: {
            onMouseDown: mouse.mockReturnValue({dispose: release}),
        } as unknown as Monaco.editor.IStandaloneCodeEditor,
        context: {language, clusterId: 'fallback', data: {tenant: 1}},
    });
    const complete = async () =>
        await instance.providers!.completion!.provideCompletionItems(
            model,
            positionAt(offset) as Monaco.Position,
            {triggerKind: 0},
            token,
        );
    const hover = async () =>
        await instance.providers!.hover!.provideHover(
            model,
            positionAt(offset) as Monaco.Position,
            token,
        );
    return {complete, hover, token, instance, mouse, release, monaco};
}

describe('query editor preset', () => {
    it('uses dialect keywords and function snippets without adapters', async () => {
        const {complete} = setup('SELECT |');
        const result = await complete();
        expect(result?.suggestions.some((item) => item.label === 'DISTINCT')).toBe(true);
        expect(result?.suggestions.find((item) => item.label === 'COUNT')?.insertText).toBe(
            'COUNT(${1})',
        );
    });
    it('resolves explicit and USE clusters and keeps quoted replacement ranges', async () => {
        const listPathChildren = vi.fn().mockResolvedValue([{name: 'table', kind: 'table'}]);
        const {complete} = setup('USE used; SELECT * FROM explicit.`//dir/ta|`', 'yql', {
            listPathChildren,
        });
        const result = await complete();
        expect(listPathChildren).toHaveBeenCalledWith(
            expect.objectContaining({path: '//dir/', clusterId: 'explicit', data: {tenant: 1}}),
        );
        const item = result?.suggestions.find((suggestion) => suggestion.label === 'table');
        expect(item?.insertText).toBe('//dir/table');
        expect(item?.range).toEqual({
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 35,
            endColumn: 43,
        });
    });
    it.each([
        ['yql', '', 'explicit'],
        ['ytql', '', 'explicit'],
        ['clickhouse', 'explicit.', 'fallback'],
        ['spyt', 'explicit.', 'fallback'],
    ])(
        'preserves multiline quoted catalog ranges and %s namespaces',
        async (language, path, clusterId) => {
            const listPathChildren = vi.fn(() => [{name: 'table name', kind: 'table' as const}]);
            const {complete} = setup('USE default;\nSELECT *\nFROM explicit.`ta|ble`', language, {
                listPathChildren,
            });
            const result = await complete();
            expect(listPathChildren).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({language, path, clusterId}),
            );
            expect(result?.suggestions.find((item) => item.label === 'table name')).toMatchObject({
                insertText: 'table name',
                range: {startLineNumber: 3, endLineNumber: 3, startColumn: 16, endColumn: 21},
            });
        },
    );
    it.each(['yql', 'clickhouse'])(
        'uses the %s parser cursor on later lines for column completion',
        async (language) => {
            const getTableSchema = vi.fn(() => [{name: 'user name'}]);
            const {complete} = setup('SELECT\n  col|umn\nFROM events', language, {getTableSchema});
            const result = await complete();
            expect(getTableSchema).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({path: 'events'}),
            );
            expect(result?.suggestions.find((item) => item.label === 'user name')).toMatchObject({
                insertText: '`user name`',
                range: {startLineNumber: 2, endLineNumber: 2, startColumn: 3, endColumn: 9},
            });
        },
    );
    it('keeps local vocabulary specific to unparsed dialects', async () => {
        const ytql = (await setup('SELECT |', 'ytql').complete())?.suggestions ?? [];
        const spyt = (await setup('SELECT |', 'spyt').complete())?.suggestions ?? [];
        for (const label of ['COUNT', 'STRING', 'RLIKE']) {
            expect(ytql.some((item) => item.label === label)).toBe(false);
            expect(spyt.some((item) => item.label === label)).toBe(true);
        }
        expect(spyt.find((item) => item.label === 'COUNT')?.insertText).toBe('COUNT(${1})');
    });
    it('loads columns from aliased tables using the actual table identifier', async () => {
        const getTableSchema = vi.fn().mockResolvedValue([{name: 'column', type: 'String'}]);
        const {complete} = setup('SELECT t.| FROM `//table` AS t', 'yql', {getTableSchema});
        const result = await complete();
        expect(getTableSchema).toHaveBeenCalledWith(
            expect.objectContaining({path: '//table', clusterId: 'fallback'}),
        );
        expect(result?.suggestions.find((item) => item.label === 'column')?.detail).toBe('String');
    });
    it('retains local results after synchronous or asynchronous adapter failure', async () => {
        for (const listPathChildren of [
            () => {
                throw Error('offline');
            },
            () => Promise.reject(Error('offline')),
        ]) {
            const {complete} = setup('SELECT * FROM |', 'yql', {listPathChildren});
            expect((await complete())?.suggestions.some((item) => item.label === 'ANY')).toBe(true);
        }
    });
    it('discards responses after cancellation', async () => {
        let resolve!: (value: []) => void;
        const listPathChildren = vi.fn(
            () =>
                new Promise<[]>((done) => {
                    resolve = done;
                }),
        );
        const {complete, token} = setup('SELECT * FROM |', 'yql', {listPathChildren});
        const pending = complete();
        await vi.waitFor(() => expect(listPathChildren).toHaveBeenCalled());
        (token as {isCancellationRequested: boolean}).isCancellationRequested = true;
        resolve([]);
        expect((await pending)?.suggestions).toEqual([]);
    });
    it('supports ClickHouse columns', async () => {
        const getTableSchema = vi.fn(() => [{name: 'id'}]);
        const {complete} = setup('SELECT t.| FROM db.events AS t', 'clickhouse', {getTableSchema});
        expect((await complete())?.suggestions.some((item) => item.label === 'id')).toBe(true);
        expect(getTableSchema).toHaveBeenCalledWith(
            expect.objectContaining({path: 'db.events', clusterId: 'fallback'}),
        );
    });
    it.each(['WHERE ', 'WHERE event_', 'ORDER BY ', 'ORDER BY event_'])(
        'loads ClickHouse columns when tables are also suggested in %s',
        async (clause) => {
            const getTableSchema = vi.fn(() => [{name: 'event_id'}]);
            const {complete} = setup(`SELECT * FROM events ${clause}|`, 'clickhouse', {
                getTableSchema,
            });
            const result = await complete();
            expect(getTableSchema).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({path: 'events', clusterId: 'fallback'}),
            );
            expect(result?.suggestions.some((item) => item.label === 'event_id')).toBe(true);
        },
    );
    it.each(['yql', 'clickhouse', 'ytql', 'spyt'])(
        'does not interpret a qualified %s table position as a column position',
        async (language) => {
            const getTableSchema = vi.fn(() => [{name: 'event_id'}]);
            const listPathChildren = vi.fn(() => [{name: 'other', kind: 'table' as const}]);
            const {complete} = setup('SELECT * FROM events AS explicit JOIN explicit.|', language, {
                getTableSchema,
                listPathChildren,
            });
            const result = await complete();
            expect(getTableSchema).not.toHaveBeenCalled();
            expect(listPathChildren).toHaveBeenCalledOnce();
            expect(result?.suggestions.some((item) => item.label === 'other')).toBe(true);
        },
    );
    it.each(['clickhouse', 'spyt'])(
        'keeps %s database qualifiers separate from the selected cluster',
        async (language) => {
            const getTableSchema = vi.fn(() => [{name: 'id'}]);
            const {complete} = setup(
                'USE defaultdb; SELECT events.| FROM explicit.events',
                language,
                {getTableSchema},
            );
            expect((await complete())?.suggestions.some((item) => item.label === 'id')).toBe(true);
            expect(getTableSchema).toHaveBeenCalledWith(
                expect.objectContaining({path: 'explicit.events', clusterId: 'fallback'}),
            );
        },
    );
    it.each(['clickhouse', 'spyt'])(
        'uses USE as the default database for %s schemas',
        async (language) => {
            const getTableSchema = vi.fn(() => [{name: 'id'}]);
            const {complete} = setup('USE defaultdb; SELECT t.| FROM events AS t', language, {
                getTableSchema,
            });
            await complete();
            expect(getTableSchema).toHaveBeenCalledWith(
                expect.objectContaining({path: 'defaultdb.events', clusterId: 'fallback'}),
            );
        },
    );
    it.each(['clickhouse', 'spyt'])(
        'requests %s catalog namespaces and inserts table names without duplicate qualifiers',
        async (language) => {
            for (const query of [
                'USE defaultdb; SELECT * FROM explicit.ev|',
                'USE explicit; SELECT * FROM ev|',
            ]) {
                const listPathChildren = vi.fn(() => [
                    {name: 'events', path: 'explicit.events', kind: 'table' as const},
                ]);
                const {complete} = setup(query, language, {listPathChildren});
                const result = await complete();
                expect(listPathChildren).toHaveBeenCalledWith(
                    expect.objectContaining({path: 'explicit.', clusterId: 'fallback'}),
                );
                expect(
                    result?.suggestions.find((item) => item.label === 'events')?.insertText,
                ).toBe('events');
            }
        },
    );
    it.each(['clickhouse', 'spyt'])(
        'navigates to qualified %s tables within the selected cluster',
        (language) => {
            const onReferenceClick = vi.fn();
            const {mouse} = setup('USE defaultdb; SELECT * FROM explicit.events|', language, {
                onReferenceClick,
            });
            mouse.mock.calls[0][0]({
                target: {type: 6, position: {lineNumber: 1, column: 36}},
                event: {metaKey: true},
            });
            expect(onReferenceClick).toHaveBeenCalledWith(
                expect.objectContaining({identifier: 'explicit.events', clusterId: 'fallback'}),
            );
        },
    );
    it.each(['yql', 'clickhouse'])('resolves nested alias shadowing in %s', async (language) => {
        const getTableSchema = vi.fn((_request: {path: string}) => [{name: 'id'}]);
        const {complete} = setup(
            'SELECT * FROM first AS t WHERE EXISTS (SELECT t.| FROM second AS t)',
            language,
            {getTableSchema},
        );
        await complete();
        expect(getTableSchema.mock.calls.map(([request]) => request.path)).toEqual(['second']);
    });
    it.each([
        ['SELECT t.| FROM first AS t UNION ALL SELECT t.id FROM second AS t', 'first'],
        ['SELECT t.id FROM first AS t UNION ALL SELECT t.| FROM second AS t', 'second'],
        ['SELECT t.id FROM first AS t UNION SELECT t.| FROM second AS t', 'second'],
    ])('isolates UNION branch columns: %s', async (query, table) => {
        const getTableSchema = vi.fn(({path}: {path: string}) => [{name: `${path}_column`}]);
        const {complete} = setup(query, 'clickhouse', {getTableSchema});
        const result = await complete();
        expect(getTableSchema.mock.calls.map(([request]) => request.path)).toEqual([table]);
        expect(result?.suggestions.some((item) => item.label === `${table}_column`)).toBe(true);
        expect(
            result?.suggestions.some(
                (item) => item.label === `${table === 'first' ? 'second' : 'first'}_column`,
            ),
        ).toBe(false);
    });
    it.each([
        ['t', 'second'],
        ['o', 'outer_table'],
    ])('preserves alias %s across nested UNION branches', async (alias, table) => {
        const getTableSchema = vi.fn(({path}: {path: string}) => [{name: `${path}_column`}]);
        const {complete} = setup(
            `SELECT * FROM outer_table AS o WHERE EXISTS (SELECT t.id FROM first AS t UNION ALL SELECT ${alias}.| FROM second AS t)`,
            'clickhouse',
            {getTableSchema},
        );
        const result = await complete();
        expect(getTableSchema.mock.calls.map(([request]) => request.path)).toEqual([table]);
        expect(result?.suggestions.some((item) => item.label === `${table}_column`)).toBe(true);
        expect(result?.suggestions.some((item) => item.label === 'first_column')).toBe(false);
    });
    it.each(['yql', 'clickhouse'])(
        'preserves outer comma tables after subqueries in %s',
        async (language) => {
            const getTableSchema = vi.fn((_request: {path: string}) => [{name: 'id'}]);
            const {complete} = setup(
                'SELECT o.| FROM (SELECT * FROM inner_table AS t) AS sub, outer_table AS o',
                language,
                {getTableSchema},
            );
            await complete();
            expect(getTableSchema.mock.calls.map(([request]) => request.path)).toEqual([
                'outer_table',
            ]);
        },
    );
    it.each(['yql', 'clickhouse'])(
        'does not fetch schemas for CTE names in %s',
        async (language) => {
            const getTableSchema = vi.fn(() => [{name: 'id'}]);
            const {complete} = setup(
                'WITH derived AS (SELECT id FROM physical) SELECT d.| FROM derived AS d',
                language,
                {getTableSchema},
            );
            await complete();
            expect(getTableSchema).not.toHaveBeenCalled();
        },
    );
    it.each(['clickhouse', 'spyt'])(
        'loads qualified physical %s tables with the same name as a CTE',
        async (language) => {
            const getTableSchema = vi.fn(() => [{name: 'physical_column'}]);
            const {complete} = setup(
                'WITH events AS (SELECT 1) SELECT e.| FROM db.events AS e',
                language,
                {getTableSchema},
            );
            const result = await complete();
            expect(getTableSchema).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({path: 'db.events', clusterId: 'fallback'}),
            );
            expect(result?.suggestions.some((item) => item.label === 'physical_column')).toBe(true);
        },
    );
    it.each(['clickhouse', 'spyt'])(
        'supports hover and navigation for qualified %s tables shadowed by a CTE name',
        async (language) => {
            const query = 'WITH events AS (SELECT 1) SELECT * FROM db.ev|ents';
            const onReferenceClick = vi.fn();
            const {hover, mouse} = setup(query, language, {onReferenceClick});
            expect(await hover()).toMatchObject({
                contents: [{value: 'db\\.events (fallback)'}],
            });
            mouse.mock.calls[0][0]({
                target: {type: 6, position: {lineNumber: 1, column: query.indexOf('|') + 1}},
                event: {ctrlKey: true},
            });
            expect(onReferenceClick).toHaveBeenCalledExactlyOnceWith(
                expect.objectContaining({identifier: 'db.events', clusterId: 'fallback'}),
            );
        },
    );
    it.each(['clickhouse', 'spyt'])(
        'does not treat unqualified CTE names as physical %s tables after USE',
        async (language) => {
            const getTableSchema = vi.fn(() => [{name: 'id'}]);
            const {complete} = setup(
                'USE db; WITH events AS (SELECT 1) SELECT e.| FROM events AS e',
                language,
                {getTableSchema},
            );
            await complete();
            expect(getTableSchema).not.toHaveBeenCalled();
        },
    );
    it('does not expose inner tables outside their subquery', async () => {
        const getTableSchema = vi.fn((_request: {path: string}) => [{name: 'id'}]);
        const {complete} = setup(
            'SELECT | FROM outer_table AS o WHERE EXISTS (SELECT * FROM inner_table AS t)',
            'clickhouse',
            {getTableSchema},
        );
        await complete();
        expect(getTableSchema.mock.calls.map(([request]) => request.path)).toEqual(['outer_table']);
    });
    it.each(['ytql', 'spyt'])(
        'registers %s only on use and releases providers',
        async (language) => {
            const {complete, instance, monaco, release} = setup('|', language);
            expect(monaco.languages.register).toHaveBeenCalledWith({id: language});
            expect((await complete())?.suggestions.some((item) => item.label === 'SELECT')).toBe(
                true,
            );
            instance.dispose?.();
            expect(release).toHaveBeenCalledTimes(2);
        },
    );
    it.each(['SELECT -- comment |', 'SELECT /* comment |', "SELECT 'text|'"])(
        'does not suggest inside comments or strings: %s',
        async (query) => {
            expect((await setup(query).complete())?.suggestions).toEqual([]);
        },
    );
    it('closes unfinished quoted catalog identifiers', async () => {
        const {complete} = setup('SELECT * FROM `//dir/ta|', 'yql', {
            listPathChildren: () => [{name: 'table', kind: 'table'}],
        });
        expect(
            (await complete())?.suggestions.find((item) => item.label === 'table')?.insertText,
        ).toBe('//dir/table`');
    });
    it('loads schemas only for the active statement', async () => {
        const getTableSchema = vi.fn((_request: {path: string}) => [{name: 'id'}]);
        const {complete} = setup('SELECT * FROM old; SELECT t.| FROM current AS t', 'clickhouse', {
            getTableSchema,
        });
        await complete();
        expect(getTableSchema.mock.calls.map(([request]) => request.path)).toEqual(['current']);
    });
    it('does not enable excluded languages', () => {
        const {instance} = setup('|', 'yql', {languages: ['spyt']});
        expect(instance.providers).toBeUndefined();
    });
    it('dispatches generic references on modified text clicks only', () => {
        const onReferenceClick = vi.fn();
        const {mouse, instance, release} = setup('USE used; SELECT * FROM `//table`|', 'yql', {
            onReferenceClick,
        });
        const handler = mouse.mock.calls[0][0];
        const event = {
            target: {type: 6, position: {lineNumber: 1, column: 27}},
            event: {ctrlKey: true},
        };
        handler(event);
        expect(onReferenceClick).toHaveBeenCalledWith(
            expect.objectContaining({kind: 'table', identifier: '//table', clusterId: 'used'}),
        );
        handler({...event, event: {}});
        expect(onReferenceClick).toHaveBeenCalledTimes(1);
        instance.dispose?.();
        expect(release).toHaveBeenCalledOnce();
    });
});

describe('query references', () => {
    it('ignores comments and string literals', () => {
        expect(
            tableReferences("-- FROM bad\n SELECT 'FROM fake' FROM `real` /* JOIN ignored */"),
        ).toEqual([
            {identifier: 'real', start: 37, end: 43, alias: undefined, clusterId: undefined},
        ]);
    });
    it('recognizes comma-separated tables', () => {
        expect(
            tableReferences('SELECT * FROM first AS a, second AS b WHERE a.id = b.id').map(
                (item) => item.identifier,
            ),
        ).toEqual(['first', 'second']);
    });
    it('honors the last USE before a reference', () => {
        expect(activeCluster('USE first; -- USE wrong\nUSE `second`;', 'fallback')).toBe('second');
        expect(
            tableReferences('USE first; SELECT * FROM a; USE second; SELECT * FROM b;').map(
                (item) => item.clusterId,
            ),
        ).toEqual(['first', 'second']);
    });
    it('replaces the entire unfinished word while preserving enclosing quotes', () => {
        expect(completionTarget('SELECT * FROM `//folder/table`', 25)).toMatchObject({
            prefix: '//folder/t',
            start: 15,
            end: 29,
            quoted: true,
        });
    });
});
