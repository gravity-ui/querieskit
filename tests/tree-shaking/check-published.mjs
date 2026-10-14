import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const require = createRequire(import.meta.url);
const declared = new Set(Object.keys({...manifest.dependencies, ...manifest.peerDependencies}));
const packageName = (specifier) =>
    specifier.startsWith('@')
        ? specifier.split('/').slice(0, 2).join('/')
        : specifier.split('/')[0];
const files = (directory) =>
    readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
        const filename = path.join(directory, entry.name);
        return entry.isDirectory() ? files(filename) : [filename];
    });

// Validate emitted files, not just source imports: Babel adds runtime dependencies.
let runtimeImports = 0;
for (const format of ['esm', 'cjs']) {
    for (const filename of files(path.join(root, 'build', format)).filter(
        (f) => f.endsWith('.js') && !f.includes('/story/') && !f.includes('.stories.'),
    )) {
        const source = ts.createSourceFile(
            filename,
            readFileSync(filename, 'utf8'),
            ts.ScriptTarget.Latest,
            true,
        );
        const check = (specifier) => {
            if (!specifier || specifier.startsWith('.') || specifier.startsWith('/')) return;
            assert.notEqual(
                specifier,
                'monaco-editor',
                `${filename}: runtime import of the full Monaco entrypoint`,
            );
            assert(
                declared.has(packageName(specifier)),
                `${filename}: undeclared runtime dependency ${specifier}`,
            );
            runtimeImports++;
        };
        const visit = (node) => {
            if (
                (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
                node.moduleSpecifier
            ) {
                check(node.moduleSpecifier.text);
            } else if (
                ts.isCallExpression(node) &&
                node.arguments.length &&
                (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
                    (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
                ts.isStringLiteral(node.arguments[0])
            ) {
                check(node.arguments[0].text);
            }
            ts.forEachChild(node, visit);
        };
        visit(source);
    }
}
console.info(
    `✓ ${runtimeImports} emitted external imports have declared dependencies; no runtime Monaco root import`,
);

const target = (value, mode, types = false) => {
    if (typeof value === 'string') return value;
    if (types && value.types) return target(value.types, mode, types);
    if (value[mode]) return target(value[mode], mode, types);
    return target(value.default, mode, types);
};
// A new public unit must gain a stable subpath, not only a root re-export.
for (const level of ['components', 'modules', 'widgets', 'pages']) {
    const filename = path.join(root, 'src', level, 'index.ts');
    const source = ts.createSourceFile(
        filename,
        readFileSync(filename, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
    );
    for (const statement of source.statements) {
        if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) continue;
        const specifier = statement.moduleSpecifier.text;
        if (!specifier.startsWith('./')) continue;
        const subpath = `./${level}/${specifier.slice(2)}`;
        assert(
            Object.hasOwn(manifest.exports, subpath),
            `${filename}: public unit lacks explicit export ${subpath}`,
        );
    }
}

let exportCount = 0;
for (const [subpath, conditions] of Object.entries(manifest.exports)) {
    if (subpath.includes('*') || subpath.endsWith('.json')) continue;
    const specifier = manifest.name + (subpath === '.' ? '' : subpath.slice(1));
    for (const mode of ['import', 'require']) {
        const js = path.resolve(root, target(conditions, mode));
        assert(existsSync(js), `${specifier} ${mode}: missing ${js}`);
        const actual =
            mode === 'import'
                ? fileURLToPath(import.meta.resolve(specifier))
                : require.resolve(specifier);
        assert.equal(actual, js, `${specifier} ${mode}: unexpected runtime resolution`);
        const expectedTypes = path.resolve(root, target(conditions, mode, true));
        assert(
            expectedTypes.endsWith('.d.ts'),
            `${specifier} ${mode}: missing explicit types condition`,
        );
        assert(existsSync(expectedTypes), `${specifier} ${mode}: missing ${expectedTypes}`);
        for (const resolution of ['bundler', 'nodenext']) {
            if (resolution === 'bundler' && mode === 'require') continue;
            const resolved = ts.resolveModuleName(
                specifier,
                path.join(root, `consumer.${mode === 'require' ? 'cts' : 'mts'}`),
                {
                    module:
                        resolution === 'bundler' ? ts.ModuleKind.ESNext : ts.ModuleKind.NodeNext,
                    moduleResolution:
                        resolution === 'bundler'
                            ? ts.ModuleResolutionKind.Bundler
                            : ts.ModuleResolutionKind.NodeNext,
                },
                ts.sys,
                undefined,
                undefined,
                mode === 'require' ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
            ).resolvedModule;
            assert.equal(
                resolved?.resolvedFileName,
                expectedTypes,
                `${specifier} ${mode}/${resolution}: types resolution`,
            );
        }
    }
    exportCount++;
}
console.info(
    `✓ ${exportCount} explicit public entrypoints resolve JS and declarations in both module formats`,
);

const bundle = async (unit, name) =>
    build({
        absWorkingDir: root,
        stdin: {
            contents: `export {${name}} from './build/esm/${unit}/index.js';`,
            resolveDir: root,
        },
        bundle: true,
        splitting: true,
        format: 'esm',
        platform: 'browser',
        write: false,
        outdir: path.join(root, 'build/tree-shaking/probes'),
        packages: 'external',
        metafile: true,
        logLevel: 'silent',
    });
for (const name of ['QueriesHistory', 'SavedQueries', 'TutorialsHistory', 'QueriesSidebar']) {
    const unit = `${name === 'QueriesSidebar' ? 'widgets' : 'modules'}/${name}`;
    const result = await bundle(unit, name);
    const outputs = result.metafile.outputs;
    const initial = new Set();
    const visit = (key) => {
        if (initial.has(key)) return;
        initial.add(key);
        for (const imported of outputs[key].imports) {
            if (imported.external) {
                assert(
                    !imported.path.startsWith('monaco-editor'),
                    `${name}: Monaco in initial graph`,
                );
            } else if (imported.kind !== 'dynamic-import') visit(imported.path);
        }
    };
    const entry = Object.keys(outputs).find((key) => outputs[key].entryPoint === '<stdin>');
    assert(entry, `${name}: missing entry output`);
    visit(entry);
    for (const key of initial) {
        assert(
            !Object.keys(outputs[key].inputs).some((f) =>
                /components\/Monaco(?:Diff)?Editor\/(?:Monaco(?:Diff)?Editor(?:Themes)?\.js|monaco-yql-languages\/(?!constants\.js|index\.js))/.test(
                    f,
                ),
            ),
            `${name}: editor implementation in initial graph`,
        );
    }
    assert(
        Object.values(outputs).some((output) =>
            output.imports.some((item) => item.path.startsWith('monaco-editor')),
        ),
        `${name}: missing deferred editor`,
    );
    console.info(`✓ ${name}: Monaco is present only behind dynamic imports`);
}
for (const name of ['QueryStatusIcon', 'QueryDuration']) {
    const result = await bundle(`components/${name}`, name);
    const included = Object.values(result.metafile.outputs).flatMap((output) =>
        Object.keys(output.inputs),
    );
    const styles = included.filter((filename) => filename.endsWith('.css'));
    assert(
        styles.includes(`build/esm/components/${name}/${name}.css`),
        `${name}: missing own stylesheet`,
    );
    assert(
        styles.every((filename) => filename.startsWith(`build/esm/components/${name}/`)),
        `${name}: unrelated styles: ${styles.join(', ')}`,
    );
    console.info(`✓ ${name}: direct entrypoint isolates owned CSS`);
}
