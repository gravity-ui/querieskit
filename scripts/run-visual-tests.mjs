import {spawn, spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const requestedRuntime = process.env.CONTAINER_RUNTIME;
if (requestedRuntime && !['docker', 'podman'].includes(requestedRuntime)) {
    console.error('CONTAINER_RUNTIME must be docker or podman.');
    process.exit(1);
}
const runtime = (requestedRuntime ? [requestedRuntime] : ['docker', 'podman']).find(
    (candidate) => spawnSync(candidate, ['--version'], {stdio: 'ignore'}).status === 0,
);

if (!runtime) {
    console.error(
        'Visual tests require Docker or Podman. No selected runtime is available. ' +
            'Run these tests on a machine with a container runtime, or use ' +
            'npm run build-storybook followed by npm run test:visual:impl for native debugging.',
    );
    process.exit(1);
}

const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const version = lock.packages?.['node_modules/@playwright/test']?.version;
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    console.error('Cannot determine a stable @playwright/test version from package-lock.json.');
    process.exit(1);
}

const image = `mcr.microsoft.com/playwright:v${version}-noble`;
// A unique name lets signal cleanup target only this invocation, including concurrent runs.
const containerName = `querieskit-visual-${randomUUID()}`;
const args = [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    '--platform=linux/amd64',
    '--name',
    containerName,
    '--workdir',
    '/work',
    '--volume',
    `${projectDirectory}:/work`,
    '--env',
    'VISUAL_CONTAINER=1',
];

for (const target of ['/work/node_modules', '/work/storybook-static']) {
    // Podman accepts nocopy as a local volume-driver option. Its short -v syntax
    // interprets target:nocopy as source:destination, not an anonymous volume.
    const noCopyOption = runtime === 'docker' ? 'volume-nocopy' : 'volume-opt=nocopy=true';
    args.push('--mount', `type=volume,target=${target},${noCopyOption}`);
}

if (process.env.CI !== undefined) {
    args.push('--env', `CI=${process.env.CI}`);
}

args.push(
    image,
    'bash',
    '-c',
    // Arguments stay separate from shell source, including grep expressions and snapshot flags.
    // The container writes editable reports and baselines to the mounted checkout.
    'set -e; umask 0000; npm ci --no-audit --no-fund; npm run test:visual:coverage; npm run test:visual:types; npm run build-storybook; exec npm run test:visual:impl -- "$@"',
    'visual-tests',
    ...process.argv.slice(2),
);

console.info(`Running visual tests with ${runtime} (${image}, linux/amd64).`);
const child = spawn(runtime, args, {cwd: projectDirectory, stdio: 'inherit'});
let interrupted;

function removeContainer() {
    spawnSync(runtime, ['rm', '--force', '--volumes', containerName], {
        stdio: 'ignore',
        timeout: 15_000,
    });
}

function interrupt(signal) {
    if (interrupted) return;
    interrupted = signal;
    removeContainer();
    child.kill(signal);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, interrupt.bind(undefined, signal));
}

child.on('error', (error) => {
    console.error(`Cannot start ${runtime}: ${error.message}`);
    process.exitCode = 1;
});

child.on('close', (code, signal) => {
    // Also covers interruption during startup before the container was created.
    removeContainer();
    if (interrupted === 'SIGINT') process.exitCode = 130;
    else if (interrupted || signal) process.exitCode = 143;
    else process.exitCode = code ?? 1;
});
