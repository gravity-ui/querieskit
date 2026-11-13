import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const runner = fileURLToPath(new URL('../../scripts/run-visual-tests.mjs', import.meta.url));
const docker = {Client: {Arch: 'arm64'}, Server: {Platform: {Name: 'Docker Engine'}}};
const podman = {Client: {OsArch: 'darwin/arm64'}, Server: {OsArch: 'linux/arm64'}};

function run(versions, override) {
    const directory = mkdtempSync(join(tmpdir(), 'querieskit-runtime-'));
    const log = join(directory, 'calls.jsonl');
    try {
        for (const runtime of ['docker', 'podman']) {
            writeFileSync(
                join(directory, runtime),
                `#!${process.execPath}
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({runtime: ${JSON.stringify(runtime)}, args}) + '\\n');
if (args[0] === 'version') {
    const version = ${JSON.stringify(versions[runtime] ?? null)};
    if (!version) { console.error('server unavailable'); process.exit(1); }
    console.log(JSON.stringify(version));
}
`,
                {mode: 0o755},
            );
        }
        const result = spawnSync(process.execPath, [runner, '--grep', 'query editor'], {
            env: {...process.env, PATH: directory, CONTAINER_RUNTIME: override ?? ''},
            encoding: 'utf8',
        });
        const calls = readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);
        return {...result, calls};
    } finally {
        rmSync(directory, {recursive: true, force: true});
    }
}

for (const scenario of [
    {
        name: 'prefers reachable Docker',
        versions: {docker, podman},
        runtime: 'docker',
        engine: 'docker',
    },
    {name: 'falls back to Podman', versions: {podman}, runtime: 'podman', engine: 'podman'},
    {
        name: 'detects a Docker shim',
        versions: {docker: podman},
        runtime: 'docker',
        engine: 'podman',
    },
    {
        name: 'detects Podman behind Docker API',
        versions: {
            docker: {
                ...docker,
                Server: {
                    Platform: {Name: 'linux/arm64/fedora-44'},
                    Components: [{Name: 'Podman Engine'}],
                },
            },
        },
        runtime: 'docker',
        engine: 'podman',
    },
    {
        name: 'honors explicit Podman',
        versions: {docker, podman},
        override: 'podman',
        runtime: 'podman',
        engine: 'podman',
    },
]) {
    test(scenario.name, () => {
        const result = run(scenario.versions, scenario.override);
        assert.equal(result.status, 0, result.stderr);
        const invocation = result.calls.find(({args}) => args[0] === 'run');
        assert.equal(invocation.runtime, scenario.runtime);
        const option = scenario.engine === 'podman' ? 'volume-opt=nocopy=true' : 'volume-nocopy';
        for (const target of ['/work/node_modules', '/work/storybook-static']) {
            assert.ok(invocation.args.includes(`type=volume,target=${target},${option}`));
        }
        assert.deepEqual(invocation.args.slice(-2), ['--grep', 'query editor']);
    });
}

test('explicit Docker does not fall back to Podman', () => {
    const result = run({podman}, 'docker');
    assert.equal(result.status, 1);
    assert.deepEqual(
        result.calls.map(({runtime}) => runtime),
        ['docker'],
    );
    assert.match(result.stderr, /server unavailable/);
});

test('reports both unavailable servers without starting a container', () => {
    const result = run({});
    assert.equal(result.status, 1);
    assert.ok(result.calls.every(({args}) => args[0] === 'version'));
    assert.match(result.stderr, /podman machine start/);
    assert.match(result.stderr, /docker: server unavailable/);
    assert.match(result.stderr, /podman: server unavailable/);
});
