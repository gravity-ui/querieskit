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
];
const historyWidgets = new Set(widgets.slice(0, 3));
const contributions = [
    'clickhouse/clickhouse.contribution.js',
    'yql/yql.contribution.js',
    'yql_ansi/yql_ansi.contribution.js',
    's-expressions/s-expressions.contribution.js',
    'themes/themes.contribution.js',
];

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
const pending = widgets.map((name) => path.join(root, 'src/widgets', name, 'index.ts'));
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
        specifier === packageName ? '' : `widgets/${widget}`,
        'index.d.ts',
    );
    assert.equal(resolved.resolvedFileName, expected);
    const contents =
        `export {${widget}} from '${specifier}';\n` +
        (specifier === packageName ? '' : `export type {${widget}Props} from '${specifier}';`);
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
    for (const specifier of [packageName, `${packageName}/widgets/${widget}`]) {
        const esmEntry = fileURLToPath(import.meta.resolve(specifier));
        const cjsEntry = require.resolve(specifier);
        const suffix = specifier === packageName ? 'index.js' : `widgets/${widget}/index.js`;
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
        for (const other of widgets) {
            assert.equal(
                included.has(`build/esm/widgets/${other}/${other}.js`),
                other === widget,
                `${specifier}: unexpected inclusion/exclusion of ${other}`,
            );
            // esbuild can extract CSS from unused root re-exports. An individual
            // entrypoint must not even introduce the other widgets' styles.
            if (specifier !== packageName) {
                assert.equal(
                    included.has(`build/esm/widgets/${other}/${other}.css`),
                    other === widget,
                    `${specifier}: unexpected inclusion/exclusion of ${other} CSS`,
                );
            }
        }
        assert(!hasDependency('@gravity-ui/graph'), `${specifier}: unrelated graph dependency`);
        assert.equal(
            hasDependency('monaco-editor'),
            historyWidgets.has(widget),
            `${specifier}: Monaco`,
        );
        for (const dependency of ['@gravity-ui/charts', '@gravity-ui/dashkit']) {
            assert.equal(
                hasDependency(dependency),
                widget === 'DashboardCharts',
                `${specifier}: ${dependency}`,
            );
        }
        for (const contribution of contributions) {
            assert.equal(
                included.has(
                    `build/esm/components/MonacoEditor/monaco-yql-languages/${contribution}`,
                ),
                historyWidgets.has(widget),
                `${specifier}: ${contribution}`,
            );
        }
        assert(
            included.has(`build/esm/widgets/${widget}/${widget}.css`),
            `${specifier}: missing CSS`,
        );
        assert(
            result.outputFiles.some((file) => file.path.endsWith('.css') && file.contents.length),
            `${specifier}: empty CSS output`,
        );
        // QueriesHistory currently gets its visible translations from shared components.
        const localization =
            widget === 'QueriesHistory' ? 'components/FieldsSelector' : `widgets/${widget}`;
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
