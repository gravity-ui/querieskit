import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {
    cpSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    renameSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {measureConsumer} from './webpack-consumer.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const workspace = mkdtempSync(path.join(tmpdir(), 'querieskit-consumer-'));
const outputDirectory = path.join(root, 'build/consumer');
mkdirSync(outputDirectory, {recursive: true});
try {
    // Pack the already-built tree. No build hooks or repository devDependencies
    // may mask a missing published runtime dependency in this consumer.
    const packed = JSON.parse(
        execFileSync(
            'npm',
            ['pack', '--ignore-scripts', '--json', '--pack-destination', workspace],
            {cwd: root, encoding: 'utf8'},
        ),
    );
    const tarball = path.join(workspace, packed[0].filename);
    assert(
        !packed[0].files.some((file) => file.path.startsWith('build/consumer/')),
        'Consumer build artifacts must not be published in the package',
    );
    const peers = Object.fromEntries(
        Object.keys(manifest.peerDependencies).map((name) => [
            name,
            manifest.devDependencies[name] || manifest.peerDependencies[name],
        ]),
    );
    writeFileSync(
        path.join(workspace, 'package.json'),
        JSON.stringify(
            {
                name: 'querieskit-isolated-consumer',
                version: '1.0.0',
                private: true,
                dependencies: {
                    ...peers,
                    '@babel/runtime': '^8.0.0',
                    [manifest.name]: `file:${tarball}`,
                },
            },
            null,
            2,
        ),
    );
    console.info(`Installing packed package into isolated consumer ${workspace}`);
    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
        cwd: workspace,
        stdio: 'inherit',
    });
    const consumerRequire = createRequire(path.join(workspace, 'package.json'));
    const libraryRequire = createRequire(consumerRequire.resolve('@gravity-ui/querieskit'));
    const hostRuntime = consumerRequire('@babel/runtime/package.json');
    const libraryRuntime = libraryRequire('@babel/runtime/package.json');
    assert(hostRuntime.version.startsWith('8.'), 'Fixture must keep host Babel runtime 8');
    assert(libraryRuntime.version.startsWith('7.'), 'Library must resolve its own Babel runtime 7');
    libraryRequire.resolve('@babel/runtime/helpers/regeneratorRuntime');
    libraryRequire.resolve('core-js/modules/es.array.includes.js');
    console.info(
        `✓ host runtime ${hostRuntime.version}; packed library runtime ${libraryRuntime.version}; helpers and polyfills resolve`,
    );
    let baselineFile = process.env.CONSUMER_BASELINE;
    if (process.env.CONSUMER_BASELINE_BUILD) {
        const installedBuild = path.join(workspace, 'node_modules/@gravity-ui/querieskit/build');
        const savedBuild = path.join(workspace, 'after-build');
        const beforeOutput = path.join(outputDirectory, 'before');
        renameSync(installedBuild, savedBuild);
        try {
            cpSync(path.resolve(process.env.CONSUMER_BASELINE_BUILD), installedBuild, {
                recursive: true,
            });
            console.info(
                'Measuring baseline build with the same installed dependency tree and public export map',
            );
            await measureConsumer({
                consumerRoot: workspace,
                outputDirectory: beforeOutput,
                baseline: true,
            });
            baselineFile = path.join(beforeOutput, 'sizes.json');
        } finally {
            rmSync(installedBuild, {recursive: true, force: true});
            renameSync(savedBuild, installedBuild);
        }
    }
    const rows = await measureConsumer({consumerRoot: workspace, outputDirectory});
    if (baselineFile) {
        const before = JSON.parse(readFileSync(baselineFile, 'utf8'));
        const comparison = rows.map((after) => ({
            ...after,
            before: before.find((row) => row.fixture === after.fixture),
        }));
        writeFileSync(
            path.join(outputDirectory, 'comparison.json'),
            JSON.stringify(comparison, null, 2) + '\n',
        );
        console.table(
            comparison.map(({before: previous, ...after}) => ({
                fixture: after.fixture,
                beforeInitialJs: previous?.initialJs,
                afterInitialJs: after.initialJs,
                beforeLazyJs: previous?.lazyJs,
                afterLazyJs: after.lazyJs,
                beforeInitialCss: previous?.initialCss,
                afterInitialCss: after.initialCss,
            })),
        );
    }
} finally {
    rmSync(workspace, {recursive: true, force: true});
}
