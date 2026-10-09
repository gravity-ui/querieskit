import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(import.meta.url);
const packageName = '@gravity-ui/querieskit';
const widgets = [
    'QueriesHistory',
    'SavedQueries',
    'TutorialsHistory',
    'QueriesNavigation',
    'QueryResults',
    'DashboardCharts',
    'QueryExecutionPanel',
    'QueriesSidebar',
    'QueryTabs',
    'QueryEditor',
];
const sections = new Set(widgets.slice(0, 4));
const unitPath = (name) =>
    `${name === 'QueryResults' || name === 'QueryTabs' || name === 'QueryEditor' || sections.has(name) ? 'modules' : 'widgets'}/${name}`;
const monacoUnits = new Set([...widgets.slice(0, 3), 'QueriesSidebar', 'QueryEditor']);
const contributions = [
    'clickhouse/clickhouse.contribution.js',
    'yql/yql.contribution.js',
    'yql_ansi/yql_ansi.contribution.js',
    's-expressions/s-expressions.contribution.js',
    'themes/themes.contribution.js',
];

// Storybook bundles TypeScript sources directly. Preserve language registration
// there as well as in published JavaScript builds; dev mode does not tree-shake it.
const sourceEditorBundle = await build({
    absWorkingDir: root,
    entryPoints: ['src/components/MonacoEditor/index.ts'],
    bundle: true,
    write: false,
    format: 'esm',
    packages: 'external',
    external: ['*.scss'],
    metafile: true,
    logLevel: 'silent',
});
const sourceOutputs = Object.values(sourceEditorBundle.metafile.outputs);
const sourceInputs = new Set(sourceOutputs.flatMap((output) => Object.keys(output.inputs)));
for (const contribution of contributions) {
    const source = `src/components/MonacoEditor/monaco-yql-languages/${contribution.replace(/\.js$/, '.ts')}`;
    assert(sourceInputs.has(source), `Source editor bundle lost language registration: ${source}`);
}
assert(
    sourceOutputs.some((output) =>
        output.imports.some((item) => item.path.endsWith('/MonacoEditor.scss')),
    ),
    'Source editor bundle lost its stylesheet',
);

// Resolve source imports, including type-only imports, to prevent common barrels
// from silently returning anywhere in a widget's public dependency chain.
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
assert.equal(config.error, undefined);
const {options} = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const barrels = new Set(
    ['index.ts', 'components/index.ts', 'modules/index.ts', 'widgets/index.ts'].map((p) =>
        path.join(root, 'src', p),
    ),
);
const pending = [
    ...widgets.map((name) => path.join(root, 'src', unitPath(name), 'index.ts')),
    path.join(root, 'src/modules/QueryTimeline/index.ts'),
    path.join(root, 'src/modules/QueryProgress/index.ts'),
];
const visited = new Set();
while (pending.length) {
    const file = pending.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    const source = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
    );
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
        if (!statement.moduleSpecifier) continue;
        const specifier = statement.moduleSpecifier.text;
        assert(
            ![packageName, `${packageName}/build/esm`, `${packageName}/build/cjs`].includes(
                specifier,
            ),
            `${file}: package self-import ${specifier}`,
        );
        const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule;
        if (!resolved) continue;
        const target = resolved.resolvedFileName;
        assert(!barrels.has(target), `${file}: common barrel dependency ${specifier}`);
        if (target.startsWith(path.join(root, 'src') + path.sep)) pending.push(target);
    }
}

function checkTypes(specifier, widget, mode) {
    const nodeNext = mode !== 'bundler';
    const requireMode = mode === 'require';
    const file = path.join(root, 'tests/tree-shaking', `consumer.${requireMode ? 'cts' : 'mts'}`);
    const compilerOptions = {
        target: ts.ScriptTarget.ES2020,
        module: nodeNext ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext,
        moduleResolution: nodeNext
            ? ts.ModuleResolutionKind.NodeNext
            : ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.ReactJSX,
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        types: [],
    };
    const resolved = ts.resolveModuleName(
        specifier,
        file,
        compilerOptions,
        ts.sys,
        undefined,
        undefined,
        requireMode ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
    ).resolvedModule;
    assert(resolved, `${mode}: cannot resolve ${specifier}`);
    const expected = path.join(
        root,
        'build',
        requireMode ? 'cjs' : 'esm',
        specifier === packageName ? '' : unitPath(widget),
        'index.d.ts',
    );
    assert.equal(resolved.resolvedFileName, expected);
    let contents =
        `export {${widget}} from '${specifier}';\n` +
        (specifier === packageName ? '' : `export type {${widget}Props} from '${specifier}';`);
    if (widget === 'QueryEditor') {
        contents += `
import type {QueryEditorProps, QueryEditorEngine, QueryEditorOptions} from '${specifier}';
const engine: QueryEditorEngine = {id: 'yql', title: 'YQL', language: 'yql'};
const options: QueryEditorOptions = {fontSize: 14, wordWrap: 'on'};
// @ts-expect-error The module owns its model.
const invalidOptions: QueryEditorOptions = {model: null};
// @ts-expect-error Every engine must specify a language.
const invalidEngine: QueryEditorEngine = {id: 'yql', title: 'YQL'};
const onChange: QueryEditorProps['onChange'] = (value) => {
    const text: string = value;
    // @ts-expect-error Changes must retain their string type.
    const invalid: number = value;
};
import {createQueryEditorPreset} from '${packageName}/helpers/queryEditorPreset';
import type {QueryCatalogRequest, QueryEditorPresetOptions} from '${packageName}/helpers/queryEditorPreset';
import type {MonacoEditorProps, EditorProviders, EditorExtension} from '${packageName}/components/MonacoEditor';
const presetOptions: QueryEditorPresetOptions = {
    getTableSchema: async (request: QueryCatalogRequest) => [{name: request.path, type: 'String'}],
};
const preset = createQueryEditorPreset(presetOptions);
const providers: EditorProviders = {
    completion: {mode: 'append', provider: {provideCompletionItems: () => ({suggestions: []})}},
    hover: false,
    // @ts-expect-error Formatting cannot merge multiple edit sets.
    documentFormatting: {mode: 'append', provider: {provideDocumentFormattingEdits: () => []}},
};
const extension: EditorExtension = {setup: ({editor, monaco}) => {
    const subscription = editor.onDidBlurEditorText(() => {});
    const position = new monaco.Position(1, 1);
    editor.setPosition(position);
    return () => subscription.dispose();
}};
const editorProps: MonacoEditorProps = {value: '', preset, providers, extensions: [extension]};
`;
    }
    if (widget === 'QueryExecutionPanel') {
        contents += `
import type {QueryExecutionPanelProps, QueryExecutionTab} from '${specifier}';
type Row = {count: number};
type Meta = {name: string; value: string; custom: string};
const tabs: QueryExecutionTab<Row, Meta>[] = [
    {id: 'r', type: 'result', props: {
        rows: [{count: 1}], columns: [{name: 'count', type: ['DataType', 'Int32'], render: ({row}) => {
            const value: number = row.count;
            // @ts-expect-error The row must retain its concrete type.
            const invalid: string = row.count;
            return value;
        }}],
    }},
    {id: 'm', type: 'meta', props: {
        data: {groups: [{items: [{name: 'n', value: 'v', custom: 'c'}]}]},
        view: {render: (data) => {
            const value: string = data.groups[0].items[0].custom;
            // @ts-expect-error Metadata must retain its concrete type.
            const invalid: number = data.groups[0].items[0].custom;
            return value;
        }},
    }},
];
const props: QueryExecutionPanelProps<Row, Meta> = {tabs};
`;
    }
    if (widget === 'QueriesSidebar') {
        contents += `
import type {QueriesSidebarProps, QueriesSidebarTab} from '${specifier}';
import type {QueryHistoryRow, SavedQuery, NavigationItem, NavigationCluster, TutorialHistoryRow} from '${packageName}';
type History = QueryHistoryRow & {custom: number};
type Saved = SavedQuery & {custom: number};
type Item = NavigationItem & {custom: number};
type Cluster = NavigationCluster & {custom: number};
type Tutorial = TutorialHistoryRow & {custom: number};
const tabs: QueriesSidebarTab<History, Saved, Item, Cluster, Tutorial>[] = [
    {id: 'h', type: 'history', props: {items: [], search: {onUpdate() {}}, getRowActions: (row) => {
        const value: number = row.custom;
        // @ts-expect-error Preserve extended history row types.
        const invalid: string = row.custom;
        return [];
    }}},
    {id: 's', type: 'saved', props: {items: [], search: {onUpdate() {}}, renderAuthor: (row) => {
        const value: number = row.custom;
        // @ts-expect-error Preserve extended saved row types.
        const invalid: string = row.custom;
        return value;
    }}},
    {id: 'n', type: 'navigation', props: {
        location: {cluster: undefined, path: undefined}, onUpdate() {},
        onItemClick: (item) => {
            const value: number = item.custom;
            // @ts-expect-error Preserve extended navigation item types.
            const invalid: string = item.custom;
        },
        onClusterClick: (cluster) => {
            const value: number = cluster.custom;
            // @ts-expect-error Preserve extended cluster types.
            const invalid: string = cluster.custom;
        },
    }},
    {id: 't', type: 'tutorials', props: {items: [], search: {onUpdate() {}}, renderRowItem: ({item}) => {
        if ('header' in item) return item.header;
        const value: number = item.custom;
        // @ts-expect-error Preserve extended tutorial types.
        const invalid: string = item.custom;
        return value;
    }}},
];
const props: QueriesSidebarProps<History, Saved, Item, Cluster, Tutorial> = {tabs, hideTabs: true, activeTab: 'h'};
`;
    }
    const host = ts.createCompilerHost(compilerOptions);
    const originalGetSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ...args) =>
        name === file
            ? ts.createSourceFile(file, contents, ts.ScriptTarget.Latest, true)
            : originalGetSourceFile(name, ...args);
    const program = ts.createProgram([file], compilerOptions, host);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(
        diagnostics.length,
        0,
        ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCanonicalFileName: (name) => name,
            getCurrentDirectory: () => root,
            getNewLine: () => '\n',
        }),
    );
}

for (const widget of widgets) {
    for (const specifier of [
        packageName,
        `${packageName}/${unitPath(widget)}`,
        ...(sections.has(widget) ? [`${packageName}/widgets/${widget}`] : []),
    ]) {
        const esmEntry = fileURLToPath(import.meta.resolve(specifier));
        const cjsEntry = require.resolve(specifier);
        const suffix = specifier === packageName ? 'index.js' : `${unitPath(widget)}/index.js`;
        assert.equal(esmEntry, path.join(root, 'build/esm', suffix));
        assert.equal(cjsEntry, path.join(root, 'build/cjs', suffix));
        const result = await build({
            absWorkingDir: root,
            stdin: {contents: `export {${widget}} from '${specifier}';`, resolveDir: root},
            bundle: true,
            write: false,
            format: 'esm',
            platform: 'browser',
            treeShaking: true,
            metafile: true,
            outfile: path.join(root, 'build/tree-shaking/consumer.js'),
            // Bundle our published JS and CSS, but keep third-party packages external.
            packages: 'external',
            plugins: [
                {
                    name: 'resolve-consumer-entry',
                    setup(builder) {
                        builder.onResolve({filter: /^@gravity-ui\/querieskit(?:\/|$)/}, (args) => ({
                            path: fileURLToPath(import.meta.resolve(args.path)),
                        }));
                    },
                },
            ],
            logLevel: 'silent',
        });
        const outputs = Object.values(result.metafile.outputs);
        const included = new Set(outputs.flatMap((output) => Object.keys(output.inputs)));
        const imports = outputs.flatMap((output) => output.imports.map((item) => item.path));
        const hasDependency = (name) => imports.some((p) => p === name || p.startsWith(name + '/'));
        assert(
            !hasDependency('@gravity-ui/websql-autocomplete'),
            `${specifier}: opt-in SQL parsers leaked into core bundle`,
        );
        assert(
            !included.has('build/esm/helpers/queryEditorPreset/index.js'),
            `${specifier}: unused editor preset retained`,
        );
        for (const other of widgets) {
            assert.equal(
                included.has(`build/esm/${unitPath(other)}/${other}.js`),
                other === widget ||
                    (widget === 'QueriesSidebar' && sections.has(other)) ||
                    (widget === 'QueryExecutionPanel' &&
                        ['QueryResults', 'DashboardCharts'].includes(other)),
                `${specifier}: unexpected inclusion/exclusion of ${other}`,
            );
            // esbuild can extract CSS from unused root re-exports. An individual
            // entrypoint must not even introduce the other widgets' styles.
            if (specifier !== packageName) {
                assert.equal(
                    included.has(`build/esm/${unitPath(other)}/${other}.css`),
                    other === widget ||
                        (widget === 'QueriesSidebar' && sections.has(other)) ||
                        (widget === 'QueryExecutionPanel' &&
                            ['QueryResults', 'DashboardCharts'].includes(other)),
                    `${specifier}: unexpected inclusion/exclusion of ${other} CSS`,
                );
            }
        }
        assert(
            widget === 'QueryExecutionPanel' || !hasDependency('@gravity-ui/timeline'),
            `${specifier}: unrelated timeline dependency`,
        );
        assert(
            widget === 'QueryExecutionPanel' || !hasDependency('@gravity-ui/graph'),
            `${specifier}: unrelated graph dependency`,
        );
        assert.equal(
            hasDependency('monaco-editor'),
            monacoUnits.has(widget),
            `${specifier}: Monaco`,
        );
        for (const dependency of ['@gravity-ui/charts', '@gravity-ui/dashkit']) {
            assert.equal(
                hasDependency(dependency),
                // The built-in Charts tab can load DashboardCharts on demand.
                widget === 'DashboardCharts' || widget === 'QueryExecutionPanel',
                `${specifier}: ${dependency}`,
            );
        }
        for (const contribution of contributions) {
            assert.equal(
                included.has(
                    `build/esm/components/MonacoEditor/monaco-yql-languages/${contribution}`,
                ),
                monacoUnits.has(widget),
                `${specifier}: ${contribution}`,
            );
        }
        assert(
            included.has(`build/esm/${unitPath(widget)}/${widget}.css`),
            `${specifier}: missing CSS`,
        );
        assert(
            result.outputFiles.some((file) => file.path.endsWith('.css') && file.contents.length),
            `${specifier}: empty CSS output`,
        );
        // QueriesHistory currently gets its visible translations from shared components.
        const localization =
            widget === 'QueriesHistory' ? 'components/FieldsSelector' : unitPath(widget);
        for (const language of ['en', 'ru']) {
            assert(
                included.has(`build/esm/${localization}/i18n/${language}.json`),
                `${specifier}: missing ${language} translations`,
            );
        }
        for (const mode of ['bundler', 'import', 'require']) checkTypes(specifier, widget, mode);
        console.info(`✓ ${specifier} → ${widget}: JS, CSS, i18n, Monaco, exports and types`);
    }
}

// Timeline is independently importable, and its public types do not expose the engine.
for (const mode of ['bundler', 'import', 'require']) checkTypes(packageName, 'QueryTimeline', mode);
for (const format of ['esm', 'cjs']) {
    const result = await build({
        absWorkingDir: root,
        entryPoints: [path.join(root, `build/${format}/modules/QueryTimeline/index.js`)],
        bundle: true,
        write: false,
        platform: 'browser',
        format,
        outfile: path.join(root, `build/tree-shaking/timeline-${format}.js`),
        metafile: true,
        external: [
            'react',
            'react-dom',
            '@gravity-ui/uikit',
            '@gravity-ui/icons',
            '@gravity-ui/date-components',
            '@gravity-ui/date-utils',
        ],
        logLevel: 'silent',
    });
    const included = Object.keys(result.metafile.inputs);
    assert(
        included.some((file) => file.includes('@gravity-ui/timeline/')),
        `${format}: missing timeline engine`,
    );
    assert(
        !included.some((file) => file.includes('@gravity-ui/graph/')),
        `${format}: unrelated graph engine`,
    );
    assert(
        result.outputFiles.some((file) => file.path.endsWith('.css')),
        `${format}: missing timeline CSS`,
    );
    console.info(
        `✓ QueryTimeline ${format}: standalone consumer bundle, CSS and engine resolution`,
    );
}

// The opt-in preset has no runtime Monaco dependency and keeps parser imports lazy.
const presetBundle = await build({
    absWorkingDir: root,
    entryPoints: [path.join(root, 'build/esm/helpers/queryEditorPreset/index.js')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    packages: 'external',
    metafile: true,
    outfile: path.join(root, 'build/tree-shaking/editor-preset.js'),
    logLevel: 'silent',
});
const presetImports = Object.values(presetBundle.metafile.outputs).flatMap(
    (output) => output.imports,
);
assert(
    !presetImports.some((item) => item.path.startsWith('monaco-editor')),
    'Preset imports a second Monaco runtime',
);
for (const dialect of ['yql', 'clickhouse']) {
    assert(
        presetImports.some(
            (item) =>
                item.path === `@gravity-ui/websql-autocomplete/${dialect}` &&
                item.kind === 'dynamic-import',
        ),
        `${dialect} parser must remain lazy`,
    );
}
console.info('✓ Query editor preset: standalone entrypoint and lazy SQL parsers');
