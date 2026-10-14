import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const require = createRequire(import.meta.url);
const webpackRequire = createRequire(require.resolve('webpack/package.json'));
const TerserPlugin = webpackRequire('terser-webpack-plugin');
const root = fileURLToPath(new URL('../../', import.meta.url));

export async function measureConsumer({
    consumerRoot = root,
    outputDirectory = path.join(root, 'build/consumer'),
    baselineRuntime,
    baseline = Boolean(baselineRuntime),
} = {}) {
    mkdirSync(outputDirectory, {recursive: true});
    const fixtures = [
        ['status-root', '.', 'QueryStatusIcon'],
        ['status-direct', './components/QueryStatusIcon', 'QueryStatusIcon'],
        ['tabs', './modules/QueryTabs', 'QueryTabs'],
        ['history', './modules/QueriesHistory', 'QueriesHistory'],
        ...(!baselineRuntime
            ? [
                  ['status-cjs', '.', 'QueryStatusIcon', 'require'],
                  ['history-cjs', './modules/QueriesHistory', 'QueriesHistory', 'require'],
              ]
            : []),
    ];
    const rows = [];
    for (const [id, subpath, name, mode] of fixtures) {
        const manifest = JSON.parse(readFileSync(path.join(consumerRoot, 'package.json'), 'utf8'));
        // Local snapshots may predate a public subpath; use the equivalent built unit.
        const packageDirectory =
            manifest.name === '@gravity-ui/querieskit'
                ? consumerRoot
                : path.join(consumerRoot, 'node_modules/@gravity-ui/querieskit');
        const entry = subpath === '.' ? 'index.js' : `${subpath.slice(2)}/index.js`;
        const fixtureDirectory =
            consumerRoot === root || baselineRuntime
                ? outputDirectory
                : path.join(consumerRoot, '.querieskit-fixtures');
        mkdirSync(fixtureDirectory, {recursive: true});
        const fixture = path.join(fixtureDirectory, `${id}.${mode === 'require' ? 'cjs' : 'mjs'}`);
        const specifier = baselineRuntime
            ? path.join(packageDirectory, 'build/esm', entry)
            : `@gravity-ui/querieskit${subpath === '.' ? '' : subpath.slice(1)}`;
        writeFileSync(
            fixture,
            mode === 'require'
                ? `const {${name}} = require(${JSON.stringify(specifier)});\nglobalThis.__querieskitFixture = ${name};\n`
                : `import {${name}} from ${JSON.stringify(specifier)};\nglobalThis.__querieskitFixture = ${name};\n`,
        );
        const config = {
            mode: 'production',
            context: consumerRoot,
            entry: fixture,
            output: {
                path: path.join(outputDirectory, id),
                filename: '[name].[contenthash].js',
                chunkFilename: '[name].[contenthash].js',
                clean: true,
            },
            devtool: false,
            resolve: {
                alias: baselineRuntime ? {'@babel/runtime': baselineRuntime} : {},
            },
            module: {
                rules: [
                    {
                        test: /\.scss$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            require.resolve('css-loader'),
                            {
                                loader: require.resolve('sass-loader'),
                                options: {
                                    implementation: require('sass'),
                                    sassOptions: {quietDeps: true},
                                },
                            },
                        ],
                    },
                    {
                        test: /\.css$/,
                        use: [MiniCssExtractPlugin.loader, require.resolve('css-loader')],
                    },
                    {test: /\.(ttf|woff2?|eot|svg|png)$/, type: 'asset/resource'},
                ],
            },
            plugins: [new MiniCssExtractPlugin({filename: '[name].[contenthash].css'})],
            optimization: {minimizer: [new TerserPlugin({parallel: false})]},
            performance: {hints: false},
        };
        const compiler = webpack(config);
        const stats = await new Promise((resolve, reject) =>
            compiler.run((error, result) => {
                compiler.close((closeError) =>
                    error || closeError ? reject(error || closeError) : resolve(result),
                );
            }),
        );
        const json = stats.toJson({all: true, source: false});
        writeFileSync(path.join(outputDirectory, `stats-${id}.json`), JSON.stringify(json));
        if (consumerRoot !== root && !baselineRuntime) {
            const checkIsolation = (modules) => {
                for (const module of modules || []) {
                    const identity = `${module.identifier || ''} ${module.nameForCondition || ''}`;
                    assert(
                        !identity.includes(path.join(root, 'build') + path.sep),
                        `Isolated consumer resolved repository build: ${identity}`,
                    );
                    checkIsolation(module.modules);
                }
            };
            checkIsolation(json.modules);
        }
        if (stats.hasErrors() && baseline) {
            // Historical builds may fail (for example Monaco's root require
            // resolves its AMD distribution). Keep the evidence and continue
            // so that the fixed build is still checked without any aliases.
            const error = stats.toString({all: false, errors: true});
            rows.push({fixture: id, error});
            console.info(`Baseline ${id} failed; details saved in stats-${id}.json`);
            continue;
        }
        assert(!stats.hasErrors(), stats.toString({all: false, errors: true}));
        const initialChunks = new Set(
            json.chunks.filter((chunk) => chunk.initial).map((chunk) => chunk.id),
        );
        if (id === 'history' && !baseline) {
            const visitModules = (modules, inheritedChunks = []) => {
                for (const module of modules || []) {
                    const chunks = module.chunks?.length ? module.chunks : inheritedChunks;
                    assert(
                        !(
                            module.name?.includes('/monaco-editor/') &&
                            chunks.some((chunk) => initialChunks.has(chunk))
                        ),
                        `History initial webpack chunk contains ${module.name}`,
                    );
                    if (chunks.length) {
                        const identity = module.name || module.identifier || '';
                        assert(
                            !/monaco-editor\/esm\/vs\/index\.js/.test(identity),
                            `History emitted full Monaco entrypoint: ${identity}`,
                        );
                        assert(
                            !/monaco-editor\/esm\/vs\/languages\/definitions\/(?!json\/)/.test(
                                identity,
                            ),
                            `History emitted an unrelated Monaco language: ${identity}`,
                        );
                    }
                    visitModules(module.modules, chunks);
                }
            };
            visitModules(json.modules);
        }
        const flattenAssets = (assets) =>
            assets.flatMap((asset) => (asset.children ? flattenAssets(asset.children) : [asset]));
        const sum = (extension, initial) =>
            flattenAssets(json.assets)
                .filter(
                    (asset) =>
                        asset.name.endsWith(extension) &&
                        asset.chunks.some((chunk) => initialChunks.has(chunk)) === initial,
                )
                .reduce((total, asset) => total + asset.size, 0);
        rows.push({
            fixture: id,
            initialJs: sum('.js', true),
            lazyJs: sum('.js', false),
            initialCss: sum('.css', true),
            lazyCss: sum('.css', false),
        });
        console.info(`✓ production webpack ${id}: ${JSON.stringify(rows.at(-1))}`);
    }
    writeFileSync(path.join(outputDirectory, 'sizes.json'), JSON.stringify(rows, null, 2) + '\n');
    console.table(rows.map(({error, ...row}) => ({...row, status: error ? 'failed' : 'passed'})));
    return rows;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await measureConsumer({
        consumerRoot: process.env.CONSUMER_ROOT || root,
        outputDirectory: process.env.CONSUMER_OUTPUT || path.join(root, 'build/consumer'),
        baselineRuntime: process.env.BASELINE_RUNTIME,
    });
}
